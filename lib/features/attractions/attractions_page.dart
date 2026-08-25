import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/attractions/attractions_controller.dart';
import 'package:quicky/features/attractions/widgets/attraction_card.dart';

/// Attractions page: radius SegmentedButton + list of nearby places.
class AttractionsPage extends ConsumerStatefulWidget {
  const AttractionsPage({super.key});

  @override
  ConsumerState<AttractionsPage> createState() => _AttractionsPageState();
}

class _AttractionsPageState extends ConsumerState<AttractionsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(attractionsControllerProvider.notifier).load(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(attractionsControllerProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.attractionsTile)),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: SegmentedButton<double>(
              segments: [
                ButtonSegment(value: 0, label: Text(l10n.areaChip)),
                const ButtonSegment(value: 10, label: Text('10km')),
                const ButtonSegment(value: 40, label: Text('40km')),
                const ButtonSegment(value: 100, label: Text('100km')),
              ],
              selected: {state.radiusKm},
              onSelectionChanged: (s) => ref
                  .read(attractionsControllerProvider.notifier)
                  .setRadius(s.first),
            ),
          ),
          // Sample-data disclosure: never let fallback rows pose as live.
          if (state.showingMock)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 16,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      l10n.mockData,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          if (state.loading)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const CircularProgressIndicator(),
                    const SizedBox(height: 12),
                    Text(
                      l10n.loading,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            )
          else if (state.error)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.wifi_off_outlined,
                      size: 48,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(height: 12),
                    Text(l10n.errorTitle),
                    const SizedBox(height: 12),
                    FilledButton.tonal(
                      onPressed: () => ref
                          .read(attractionsControllerProvider.notifier)
                          .load(),
                      child: Text(l10n.retry),
                    ),
                  ],
                ),
              ),
            )
          else if (state.places.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.explore_outlined,
                      size: 48,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(height: 12),
                    Text(l10n.noPlaces),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                itemCount: state.places.length,
                itemBuilder: (_, i) =>
                    AttractionCard(attraction: state.places[i]),
              ),
            ),
        ],
      ),
    );
  }
}
