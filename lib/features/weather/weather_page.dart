import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
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

    return Scaffold(
      appBar: AppBar(title: Text(l10n.weatherTile)),
      body: state.loading
          ? const Center(child: CircularProgressIndicator())
          : state.snapshot == null
              ? const Center(child: Text('No data'))
              : Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Text(
                        '${state.snapshot!.tempC.round()}°C',
                        style: Theme.of(context).textTheme.displayLarge,
                      ),
                      Text(state.snapshot!.condition),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: state.snapshot!.forecast
                            .map((f) => Chip(label: Text(f)))
                            .toList(),
                      ),
                    ],
                  ),
                ),
    );
  }
}
