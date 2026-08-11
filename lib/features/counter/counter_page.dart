import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/counter/counter_controller.dart';

/// Day Counter page: enter days, big countdown, reset.
class CounterPage extends ConsumerStatefulWidget {
  const CounterPage({super.key});

  @override
  ConsumerState<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends ConsumerState<CounterPage> {
  final _daysController = TextEditingController();
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      ref.read(counterControllerProvider.notifier).startTicking();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _daysController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(counterControllerProvider);
    final l10n = AppLocalizations.of(context);
    final days = (state.remainingSeconds / 86400).ceil();

    return Scaffold(
      appBar: AppBar(title: Text(l10n.counterTile)),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(
              controller: _daysController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Enter days'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () {
                final d = int.tryParse(_daysController.text);
                if (d != null) {
                  ref.read(counterControllerProvider.notifier).setDays(d);
                }
              },
              child: const Text('Set'),
            ),
            const Spacer(),
            if (state.target != null)
              Text(
                '$days',
                style: Theme.of(context).textTheme.displayLarge,
              )
            else
              const Text('No countdown set'),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
