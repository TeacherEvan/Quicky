/// Reverse-geocode service. MOCK by default; real provider (Google Places /
/// OSM / Foursquare) is wired in Settings (Task 10) with an API key.
class GeocodeService {
  GeocodeService({this.apiKey});

  final String? apiKey;

  /// Returns a human-readable place label. Mock returns a deterministic stub.
  Future<String> reverseGeocode(double lat, double lng) async {
    if (apiKey == null) {
      return 'Near $lat, $lng (mock)';
    }
    // Real implementation would call the provider here.
    return 'Place at $lat, $lng';
  }
}
