import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/settings/settings_controller.dart';
import 'package:quicky/features/weather/weather_controller.dart';

/// Weather page: current + 3-day forecast.
class WeatherPage extends ConsumerStatefulWidget {
  const WeatherPage({super.key});

  @override
  ConsumerState<WeatherPage> createState() => _WeatherPageState();
}

class _WeatherPageState extends ConsumerState<WeatherPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(weatherControllerProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(weatherControllerProvider);
    final l10n = AppLocalizations.of(context);

    // Refetch when the units setting changes so an open page stays correct.
    ref.listen(
      settingsControllerProvider.select((s) => s.weatherUnits),
      (previous, next) {
        if (previous != next) {
          ref.read(weatherControllerProvider.notifier).load();
        }
      },
    );

    final forecastLabels = [
      l10n.forecastToday,
      l10n.forecastTomorrow,
      l10n.forecastDay3,
    ];

    return Scaffold(
      appBar: AppBar(title: Text(l10n.weatherTile)),
      body: state.loading
          ? const Center(
              child: CircularProgressIndicator(
                semanticsLabel: 'Loading weather',
              ),
            )
          : state.snapshot == null
          ? Center(child: Text(l10n.errorTitle))
          : Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text(
                    state.units == 'F'
                        ? '${state.snapshot!.tempF.round()}°F'
                        : '${state.snapshot!.tempC.round()}°C',
                    style: Theme.of(context).textTheme.displayLarge,
                  ),
                  Text(state.snapshot!.condition),
                  // Sample-data disclosure: never pose mock as live.
                  if (state.snapshot!.isMock) ...[
                    const SizedBox(height: 12),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 14,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            l10n.offlineEstimate,
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onSurfaceVariant,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: List.generate(state.snapshot!.forecast.length, (
                      i,
                    ) {
                      final label = i < forecastLabels.length
                          ? forecastLabels[i]
                          : '';
                      return Chip(
                        label: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (label.isNotEmpty)
                              Text(
                                label,
                                style: Theme.of(context).textTheme.labelSmall,
                              ),
                            Text(state.snapshot!.forecast[i]),
                          ],
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),
    );
  }
}
