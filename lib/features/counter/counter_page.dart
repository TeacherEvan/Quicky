import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  String? _errorText;

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

  void _submit() {
    final l10n = AppLocalizations.of(context);
    final d = int.tryParse(_daysController.text);
    if (d == null || d <= 0) {
      setState(() => _errorText = l10n.invalidDays);
      return;
    }
    setState(() => _errorText = null);
    ref.read(counterControllerProvider.notifier).setDays(d);
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
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onChanged: (_) {
                if (_errorText != null) setState(() => _errorText = null);
              },
              decoration: InputDecoration(
                labelText: l10n.enterDays,
                errorText: _errorText,
              ),
              onSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 48,
              width: double.infinity,
              child: FilledButton(
                onPressed: _submit,
                child: Text(l10n.setLabel),
              ),
            ),
            const Spacer(),
            if (state.target != null)
              // Announced to screen readers when the value changes.
              Semantics(
                liveRegion: true,
                label: '$days ${l10n.daysUnit}',
                child: Column(
                  children: [
                    Text(
                      '$days',
                      style: Theme.of(context).textTheme.displayLarge,
                    ),
                    Text(
                      l10n.daysUnit,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              )
            else
              Text(l10n.noCountdown),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
