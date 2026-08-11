/// Reverse-geocode / places service. MOCK by default; real provider
/// (Google Places / OSM / Foursquare) is wired in Settings (Task 10) with a key.
class PlacesService {
  PlacesService({this.apiKey});

  final String? apiKey;

  /// Returns a mock list of nearby attractions within [radiusKm].
  Future<List<Attraction>> fetchNearby(double radiusKm) async {
    if (apiKey == null) {
      return [
        Attraction(
          name: 'Mock Cafe',
          distanceKm: radiusKm * 0.2,
          type: 'cafe',
          openNow: true,
        ),
        Attraction(
          name: 'Mock Temple',
          distanceKm: radiusKm * 0.5,
          type: 'temple',
          openNow: true,
        ),
        Attraction(
          name: 'Mock Market',
          distanceKm: radiusKm * 0.8,
          type: 'market',
          openNow: false,
        ),
      ];
    }
    return const [];
  }
}

class Attraction {
  const Attraction({
    required this.name,
    required this.distanceKm,
    required this.type,
    required this.openNow,
  });

  final String name;
  final double distanceKm;
  final String type;
  final bool openNow;
}
