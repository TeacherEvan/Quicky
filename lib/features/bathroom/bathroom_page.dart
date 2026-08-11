import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/bathroom/bathroom_controller.dart';

/// Bathroom toggle page: swipe/button between male (🚻) and female (🚽).
class BathroomPage extends ConsumerWidget {
  const BathroomPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isMale = ref.watch(bathroomControllerProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.bathroomTile)),
      body: GestureDetector(
        onHorizontalDragEnd: (_) =>
            ref.read(bathroomControllerProvider.notifier).toggle(),
        child: Center(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: Icon(
              isMale ? Icons.male : Icons.female,
              key: ValueKey(isMale),
              size: 120,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => ref.read(bathroomControllerProvider.notifier).toggle(),
        tooltip: 'Toggle',
        child: const Icon(Icons.swap_horiz),
      ),
    );
  }
}
