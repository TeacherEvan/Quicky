import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/bathroom/bathroom_controller.dart';

/// Bathroom toggle page: tap/swipe/button between male and female.
class BathroomPage extends ConsumerWidget {
  const BathroomPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isMale = ref.watch(bathroomControllerProvider);
    final l10n = AppLocalizations.of(context);
    final stateLabel = isMale ? l10n.bathroomMale : l10n.bathroomFemale;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.bathroomTile)),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => ref.read(bathroomControllerProvider.notifier).toggle(),
        onHorizontalDragEnd: (_) =>
            ref.read(bathroomControllerProvider.notifier).toggle(),
        child: Center(
          child: Semantics(
            button: true,
            label: stateLabel,
            hint: l10n.toggleBathroom,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Icon(
                    isMale ? Icons.male : Icons.female,
                    key: ValueKey(isMale),
                    size: 120,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 16),
                // Icon-only communication is not enough: name the state.
                Text(
                  stateLabel,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => ref.read(bathroomControllerProvider.notifier).toggle(),
        tooltip: l10n.toggleBathroom,
        child: const Icon(Icons.swap_horiz),
      ),
    );
  }
}
