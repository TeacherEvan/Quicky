import 'package:flutter/material.dart';
import 'package:quicky/features/attractions/services/places_service.dart';

/// Card showing one attraction: name, distance, type, open-now badge.
class AttractionCard extends StatelessWidget {
  const AttractionCard({super.key, required this.attraction});

  final Attraction attraction;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: ListTile(
        leading: const Icon(Icons.place),
        title: Text(attraction.name),
        subtitle: Text(
          '${attraction.distanceKm.toStringAsFixed(1)} km · ${attraction.type}',
        ),
        trailing: Chip(
          label: Text(attraction.openNow ? 'Open' : 'Closed'),
          backgroundColor: attraction.openNow
              ? scheme.primaryContainer
              : scheme.errorContainer,
        ),
      ),
    );
  }
}
