/// Weather service. MOCK by default; real provider (OpenWeather/WeatherAPI)
/// is wired in Settings (Task 10) with an API key.
class WeatherService {
  WeatherService({this.apiKey});

  final String? apiKey;

  Future<WeatherSnapshot> fetch(double lat, double lng) async {
    if (apiKey == null) {
      return const WeatherSnapshot(
        tempC: 31,
        condition: 'Sunny',
        forecast: ['32°', '30°', '29°'],
      );
    }
    return const WeatherSnapshot(tempC: 0, condition: '', forecast: []);
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
