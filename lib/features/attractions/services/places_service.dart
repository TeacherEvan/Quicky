import 'dart:convert';
import 'dart:math' as math;

import 'package:http/http.dart' as http;
import 'package:quicky/core/convex/convex_client.dart';

/// Nearby-attractions service with a three-step fallback chain:
/// Convex proxy (/api/places) → direct Overpass → deterministic mock list.
///
/// No API key required for any step; [apiKey] is kept for the optional
/// commercial provider upgrade path wired in Settings.
class PlacesService {
  PlacesService({this.apiKey, http.Client? httpClient, ConvexClient? convex})
    : _http = httpClient ?? http.Client(),
      _convex = convex ?? ConvexClient(httpClient: httpClient);

  final String? apiKey;

  final http.Client _http;
  final ConvexClient _convex;

  /// Fixed reference point (Bangkok) — matches the controllers' coords.
  static const double refLat = 13.7563;
  static const double refLng = 100.5018;

  /// Returns nearby attractions within [radiusKm] of the reference point.
  Future<List<Attraction>> fetchNearby(double radiusKm) async {
    final fromConvex = await _fromConvex(radiusKm);
    if (fromConvex != null) return fromConvex;
    final direct = await _fromOverpass(radiusKm);
    if (direct != null) return direct;
    return _mockList(radiusKm);
  }

  List<Attraction> _mockList(double radiusKm) => [
    Attraction(
      name: 'Mock Cafe',
      distanceKm: radiusKm * 0.2,
      type: 'cafe',
      openNow: true,
      isMock: true,
    ),
    Attraction(
      name: 'Mock Temple',
      distanceKm: radiusKm * 0.5,
      type: 'temple',
      openNow: true,
      isMock: true,
    ),
    Attraction(
      name: 'Mock Market',
      distanceKm: radiusKm * 0.8,
      type: 'market',
      openNow: false,
      isMock: true,
    ),
  ];

  Future<List<Attraction>?> _fromConvex(double radiusKm) async {
    final data = await _convex.getJson('/api/places', {
      'lat': refLat.toStringAsFixed(2),
      'lng': refLng.toStringAsFixed(2),
      'radius': radiusKm.toString(),
    });
    if (data == null) return null;
    final raw = data['places'] as List<dynamic>?;
    if (raw == null) return null;
    final places = <Attraction>[];
    for (final entry in raw) {
      if (entry is! Map<String, dynamic>) continue;
      final name = entry['name'] as String?;
      final type = entry['type'] as String?;
      final distanceKm = (entry['distanceKm'] as num?)?.toDouble();
      if (name == null || type == null || distanceKm == null) continue;
      places.add(
        Attraction(
          name: name,
          type: type,
          distanceKm: distanceKm,
          openNow: entry['openNow'] as bool? ?? false,
        ),
      );
    }
    // Empty result: fall through to the next chain step, matching
    // _fromOverpass behaviour.
    if (places.isEmpty) return null;
    return places;
  }

  Future<List<Attraction>?> _fromOverpass(double radiusKm) async {
    try {
      final lat = refLat.toStringAsFixed(2);
      final lng = refLng.toStringAsFixed(2);
      final metres = (radiusKm * 1000).toStringAsFixed(0);
      const tourism = 'attraction|museum|temple|viewpoint|zoo|gallery';
      const leisure = 'park|marketplace';
      final query =
          '[out:json][timeout:10];'
          'nwr["tourism"~"^($tourism)\$"](around:$metres,$lat,$lng);'
          'nwr["leisure"~"^($leisure)\$"](around:$metres,$lat,$lng);'
          'out center 20;';
      final uri = Uri.https('overpass-api.de', '/api/interpreter');
      final res = await _http
          .post(uri, body: {'data': query})
          .timeout(const Duration(seconds: 8));
      if (res.statusCode != 200) return null;
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final elements = body['elements'] as List<dynamic>?;
      if (elements == null) return null;
      final places = <Attraction>[];
      for (final element in elements) {
        if (element is! Map<String, dynamic>) continue;
        final tags = element['tags'] as Map<String, dynamic>?;
        final name = tags?['name'] as String?;
        final type = tags?['tourism'] as String? ?? tags?['leisure'] as String?;
        var elLat = (element['lat'] as num?)?.toDouble();
        var elLng = (element['lon'] as num?)?.toDouble();
        final center = element['center'] as Map<String, dynamic>?;
        if (elLat == null || elLng == null) {
          elLat = (center?['lat'] as num?)?.toDouble();
          elLng = (center?['lon'] as num?)?.toDouble();
        }
        if (name == null || type == null || elLat == null || elLng == null) {
          continue;
        }
        places.add(
          Attraction(
            name: name,
            type: type,
            distanceKm: haversineKm(refLat, refLng, elLat, elLng),
            // Trivial parse only: 24/7 means open; anything else unknown.
            openNow: tags?['opening_hours'] == '24/7',
          ),
        );
      }
      if (places.isEmpty) return null;
      places.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
      return places.take(20).toList(growable: false);
    } on Exception {
      return null;
    }
  }

  /// Great-circle distance in km between two WGS84 points.
  static double haversineKm(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const earthRadiusKm = 6371.0;
    double toRad(double deg) => deg * math.pi / 180;
    final dLat = toRad(lat2 - lat1);
    final dLon = toRad(lon2 - lon1);
    final a =
        math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(toRad(lat1)) *
            math.cos(toRad(lat2)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    return earthRadiusKm * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  }
}

class Attraction {
  const Attraction({
    required this.name,
    required this.distanceKm,
    required this.type,
    required this.openNow,
    this.isMock = false,
  });

  final String name;
  final double distanceKm;
  final String type;
  final bool openNow;

  /// True when this row comes from the deterministic mock fallback rather
  /// than live Convex/Overpass data; the UI must disclose it.
  final bool isMock;
}
