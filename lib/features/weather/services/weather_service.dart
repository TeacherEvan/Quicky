import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:quicky/core/convex/convex_client.dart';

/// Weather service with a three-step fallback chain:
/// Convex proxy (/api/weather) → direct Open-Meteo → deterministic mock.
///
/// No API key required for any step; [apiKey] is kept for the optional
/// OpenWeather upgrade path wired in Settings.
class WeatherService {
  WeatherService({this.apiKey, http.Client? httpClient, ConvexClient? convex})
    : _http = httpClient ?? http.Client(),
      _convex = convex ?? ConvexClient(httpClient: httpClient);

  final String? apiKey;

  final http.Client _http;
  final ConvexClient _convex;

  static const _mockSnapshot = WeatherSnapshot(
    tempC: 31,
    condition: 'Sunny',
    forecast: ['32°', '30°', '29°'],
  );

  /// Fetches the current snapshot for [lat]/[lng].
  ///
  /// [units] is 'C' (default) or 'F' and only affects the forecast strings'
  /// scale; [WeatherSnapshot.tempC] is always Celsius.
  Future<WeatherSnapshot> fetch(
    double lat,
    double lng, {
    String units = 'C',
  }) async {
    final fromConvex = await _fromConvex(lat, lng, units);
    if (fromConvex != null) return fromConvex;
    final direct = await _fromOpenMeteo(lat, lng, units);
    if (direct != null) return direct;
    return _mockSnapshot;
  }

  Future<WeatherSnapshot?> _fromConvex(
    double lat,
    double lng,
    String units,
  ) async {
    final data = await _convex.getJson('/api/weather', {
      'lat': lat.toStringAsFixed(2),
      'lng': lng.toStringAsFixed(2),
      'units': units.toUpperCase(),
    });
    if (data == null) return null;
    final tempC = (data['tempC'] as num?)?.toDouble();
    final condition = data['condition'] as String?;
    final rawForecast = data['forecast'] as List<dynamic>?;
    if (tempC == null || condition == null || rawForecast == null) return null;
    final forecast = rawForecast.whereType<String>().toList(growable: false);
    if (forecast.isEmpty) return null;
    return WeatherSnapshot(
      tempC: tempC,
      condition: condition,
      forecast: forecast,
    );
  }

  Future<WeatherSnapshot?> _fromOpenMeteo(
    double lat,
    double lng,
    String units,
  ) async {
    try {
      final params = <String, String>{
        'latitude': lat.toStringAsFixed(2),
        'longitude': lng.toStringAsFixed(2),
        'current': 'temperature_2m,weather_code',
        'daily': 'temperature_2m_max,temperature_2m_min',
        'timezone': 'auto',
      };
      if (units.toUpperCase() == 'F') {
        params['temperature_unit'] = 'fahrenheit';
      }
      final uri = Uri.https('api.open-meteo.com', '/v1/forecast', params);
      final res = await _http.get(uri).timeout(const Duration(seconds: 8));
      if (res.statusCode != 200) return null;
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final current = body['current'] as Map<String, dynamic>?;
      final daily = body['daily'] as Map<String, dynamic>?;
      if (current == null || daily == null) return null;
      final value = (current['temperature_2m'] as num?)?.toDouble();
      final code = (current['weather_code'] as num?)?.toInt();
      if (value == null || code == null) return null;
      final maxes =
          ((daily['temperature_2m_max'] as List<dynamic>?) ?? const <dynamic>[])
              .whereType<num>()
              .take(3)
              .toList(growable: false);
      if (maxes.isEmpty) return null;
      final tempC = units.toUpperCase() == 'F' ? (value - 32) * 5 / 9 : value;
      return WeatherSnapshot(
        tempC: tempC,
        condition: conditionForCode(code),
        forecast: maxes.map((m) => '${m.round()}°').toList(growable: false),
      );
    } on Exception {
      return null;
    }
  }

  /// Maps WMO weather codes to human-readable conditions.
  static String conditionForCode(int code) {
    if (code == 0) return 'Clear';
    if (code >= 1 && code <= 3) return 'Cloudy';
    if (code >= 45 && code <= 48) return 'Fog';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Storm';
    return 'Cloudy';
  }
}

class WeatherSnapshot {
  const WeatherSnapshot({
    required this.tempC,
    required this.condition,
    required this.forecast,
  });

  final double tempC;
  final String condition;
  final List<String> forecast;
}
