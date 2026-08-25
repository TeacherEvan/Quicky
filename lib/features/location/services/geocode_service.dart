import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:quicky/core/convex/convex_client.dart';

/// Reverse-geocode service with a three-step fallback chain:
/// Convex proxy (/api/reverse) → direct Nominatim → deterministic mock label.
///
/// No API key required for any step; [apiKey] is kept for the optional
/// commercial provider upgrade path wired in Settings.
class GeocodeService {
  GeocodeService({this.apiKey, http.Client? httpClient, ConvexClient? convex})
    : _http = httpClient ?? http.Client(),
      _convex = convex ?? ConvexClient(httpClient: httpClient);

  final String? apiKey;

  final http.Client _http;
  final ConvexClient _convex;

  static const _userAgent = 'QuickyTravelHub/1.0';

  /// Returns a human-readable place label for [lat]/[lng].
  Future<String> reverseGeocode(double lat, double lng) async {
    final fromConvex = await _fromConvex(lat, lng);
    if (fromConvex != null) return fromConvex;
    final direct = await _fromNominatim(lat, lng);
    if (direct != null) return direct;
    return 'Near $lat, $lng (mock)';
  }

  Future<String?> _fromConvex(double lat, double lng) async {
    final data = await _convex.getJson('/api/reverse', {
      'lat': lat.toStringAsFixed(6),
      'lng': lng.toStringAsFixed(6),
    });
    return data?['label'] as String?;
  }

  Future<String?> _fromNominatim(double lat, double lng) async {
    try {
      final uri = Uri.https('nominatim.openstreetmap.org', '/reverse', {
        'format': 'jsonv2',
        'lat': lat.toStringAsFixed(6),
        'lon': lng.toStringAsFixed(6),
        'zoom': '16',
      });
      final res = await _http
          .get(uri, headers: {'User-Agent': _userAgent})
          .timeout(const Duration(seconds: 8));
      if (res.statusCode != 200) return null;
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final displayName = body['display_name'] as String?;
      if (displayName == null || displayName.isEmpty) return null;
      return shortenLabel(displayName);
    } on Exception {
      return null;
    }
  }

  /// Keeps the first three comma-separated parts of a Nominatim display name.
  static String shortenLabel(String displayName) {
    final parts = displayName.split(',').take(3).map((p) => p.trim()).toList();
    return parts.join(', ');
  }
}
