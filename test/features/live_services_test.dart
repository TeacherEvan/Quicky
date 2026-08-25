import 'dart:async';
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:quicky/core/convex/convex_client.dart';
import 'package:quicky/features/attractions/services/places_service.dart';
import 'package:quicky/features/location/services/geocode_service.dart';
import 'package:quicky/features/weather/services/weather_service.dart';

/// Hand-rolled fake http client: records request URLs/headers and either
/// returns a canned [response] or throws [error]. No network involved.
class MockHttpClient extends http.BaseClient {
  MockHttpClient({this.response, this.error});

  final http.Response? response;
  final Exception? error;
  final List<Uri> urls = [];
  final List<Map<String, String>> headers = [];

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    urls.add(request.url);
    headers.add(request.headers);
    final err = error;
    if (err != null) throw err;
    final canned = response!;
    return http.StreamedResponse(
      Stream.value(canned.bodyBytes),
      canned.statusCode,
      headers: canned.headers,
    );
  }
}

ConvexClient convexFor(MockHttpClient client, {String baseUrl = ''}) =>
    ConvexClient(baseUrlOverride: baseUrl, httpClient: client);

void main() {
  const bangkok = (13.7563, 100.5018);

  group('WeatherService', () {
    test('uses Convex URL when set and parses the snapshot', () async {
      final mock = MockHttpClient(
        response: http.Response(
          jsonEncode(<String, dynamic>{
            'tempC': 31.2,
            'tempF': 88.2,
            'condition': 'Clear',
            'forecast': <String>['32°', '30°', '29°'],
          }),
          200,
        ),
      );
      final service = WeatherService(
        httpClient: mock,
        convex: convexFor(mock, baseUrl: 'https://test.convex.site'),
      );

      final snap = await service.fetch(bangkok.$1, bangkok.$2, units: 'F');

      expect(mock.urls, hasLength(1));
      expect(mock.urls.single.host, 'test.convex.site');
      expect(mock.urls.single.path, '/api/weather');
      expect(mock.urls.single.queryParameters['lat'], '13.76');
      expect(mock.urls.single.queryParameters['lng'], '100.50');
      expect(mock.urls.single.queryParameters['units'], 'F');
      expect(snap.tempC, closeTo(31.2, 0.001));
      expect(snap.condition, 'Clear');
      expect(snap.forecast, <String>['32°', '30°', '29°']);
    });

    test(
      'falls back to the mock snapshot when every network step fails',
      () async {
        final mock = MockHttpClient(error: Exception('network down'));
        final service = WeatherService(
          httpClient: mock,
          convex: convexFor(mock, baseUrl: 'https://dead.convex.site'),
        );

        final snap = await service.fetch(bangkok.$1, bangkok.$2);

        // Convex attempt + direct Open-Meteo attempt, then deterministic mock.
        expect(mock.urls, hasLength(2));
        expect(snap.tempC, 31);
        expect(snap.condition, 'Sunny');
        expect(snap.forecast, <String>['32°', '30°', '29°']);
      },
    );

    test('conditionForCode maps WMO ranges', () {
      expect(WeatherService.conditionForCode(0), 'Clear');
      expect(WeatherService.conditionForCode(2), 'Cloudy');
      expect(WeatherService.conditionForCode(45), 'Fog');
      expect(WeatherService.conditionForCode(63), 'Rain');
      expect(WeatherService.conditionForCode(73), 'Snow');
      expect(WeatherService.conditionForCode(81), 'Showers');
      expect(WeatherService.conditionForCode(95), 'Storm');
    });
  });

  group('PlacesService', () {
    test(
      'direct Overpass path parses elements with haversine distances',
      () async {
        final mock = MockHttpClient(
          response: http.Response(
            jsonEncode(<String, dynamic>{
              'elements': <dynamic>[
                // ~2.0 km north of the reference point.
                <String, dynamic>{
                  'type': 'node',
                  'id': 1,
                  'lat': 13.7743,
                  'lon': 100.5018,
                  'tags': <String, String>{
                    'name': 'Far Park',
                    'leisure': 'park',
                    'opening_hours': '24/7',
                  },
                },
                // ~0.5 km north of the reference point.
                <String, dynamic>{
                  'type': 'way',
                  'id': 2,
                  'center': <String, double>{'lat': 13.7608, 'lon': 100.5018},
                  'tags': <String, String>{
                    'name': 'Near Temple',
                    'tourism': 'temple',
                  },
                },
              ],
            }),
            200,
          ),
        );
        // Empty Convex base URL disables the proxy hop → direct Overpass POST.
        final service = PlacesService(
          httpClient: mock,
          convex: convexFor(mock),
        );

        final places = await service.fetchNearby(10);

        expect(mock.urls.single.host, 'overpass-api.de');
        expect(mock.urls.single.path, '/api/interpreter');
        expect(places, hasLength(2));
        // Sorted nearest-first.
        expect(places.first.name, 'Near Temple');
        expect(places.first.distanceKm, closeTo(0.5, 0.05));
        expect(places.last.name, 'Far Park');
        expect(places.last.distanceKm, closeTo(2.0, 0.05));
        // Trivial opening_hours parse: 24/7 → open, unknown → closed.
        expect(places.last.openNow, isTrue);
        expect(places.first.openNow, isFalse);
      },
    );

    test('falls back to the mock list when the client throws', () async {
      final mock = MockHttpClient(error: Exception('network down'));
      final service = PlacesService(
        httpClient: mock,
        convex: convexFor(mock, baseUrl: 'https://dead.convex.site'),
      );

      final places = await service.fetchNearby(10);

      expect(places.map((p) => p.name), <String>[
        'Mock Cafe',
        'Mock Temple',
        'Mock Market',
      ]);
    });

    test('haversine sanity: 1 degree of latitude ≈ 111.19 km', () {
      final d = PlacesService.haversineKm(13, 100, 14, 100);
      expect(d, closeTo(111.19, 0.5));
    });
  });

  group('GeocodeService', () {
    test(
      'direct Nominatim path shortens display_name to three parts',
      () async {
        final mock = MockHttpClient(
          response: http.Response(
            jsonEncode(<String, dynamic>{
              'display_name':
                  'Wat Phra Kaew, Phra Borom Maha Ratchawang, Phra Nakhon, '
                  'Bangkok, 10200, Thailand',
            }),
            200,
          ),
        );
        final service = GeocodeService(
          httpClient: mock,
          convex: convexFor(mock),
        );

        final label = await service.reverseGeocode(bangkok.$1, bangkok.$2);

        expect(mock.urls.single.host, 'nominatim.openstreetmap.org');
        // Street-level reverse geocoding needs full precision (6dp).
        expect(mock.urls.single.queryParameters['lat'], '13.756300');
        expect(
          mock.headers.single.entries.any(
            (e) => e.key.toLowerCase() == 'user-agent',
          ),
          isTrue,
        );
        expect(label, 'Wat Phra Kaew, Phra Borom Maha Ratchawang, Phra Nakhon');
      },
    );

    test('falls back to the mock label when the client throws', () async {
      final mock = MockHttpClient(error: Exception('network down'));
      final service = GeocodeService(
        httpClient: mock,
        convex: convexFor(mock, baseUrl: 'https://dead.convex.site'),
      );

      final label = await service.reverseGeocode(bangkok.$1, bangkok.$2);

      expect(label, 'Near ${bangkok.$1}, ${bangkok.$2} (mock)');
    });
  });
}
