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
    Future.microtask(() => ref.read(attractionsControllerProvider.notifier).load());
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
              segments: const [
                ButtonSegment(value: 0.0, label: Text('Area')),
                ButtonSegment(value: 10.0, label: Text('10km')),
                ButtonSegment(value: 40.0, label: Text('40km')),
                ButtonSegment(value: 100.0, label: Text('100km')),
              ],
              selected: {state.radiusKm},
              onSelectionChanged: (s) =>
                  ref.read(attractionsControllerProvider.notifier).setRadius(s.first),
            ),
          ),
          if (state.loading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else
            Expanded(
              child: ListView.builder(
                itemCount: state.places.length,
                itemBuilder: (_, i) => AttractionCard(attraction: state.places[i]),
              ),
            ),
        ],
      ),
    );
  }
}
