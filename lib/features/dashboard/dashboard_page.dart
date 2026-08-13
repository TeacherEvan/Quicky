import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/core/router/routes.dart';
import 'package:quicky/features/dashboard/dashboard_controller.dart';
import 'package:quicky/shared/widgets/dashboard_layout.dart';
import 'package:quicky/shared/widgets/octagon_tile.dart';

/// The octagon dashboard: 8 feature tiles arranged around the center Settings hub.
class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tiles = ref.watch(dashboardTilesProvider);
    final l10n = AppLocalizations.of(context);

    final octagonTiles = tiles
        .map(
          (t) => OctagonTile(
            icon: t.icon,
            label: _label(l10n, t.labelKey),
            semanticsLabel: _label(l10n, t.labelKey),
            accent: t.accent,
            onTap: () => context.push(t.route),
          ),
        )
        .toList();

    return Scaffold(
      body: DashboardLayout(
        center: OctagonTile(
          icon: Icons.settings,
          label: l10n.settingsTile,
          semanticsLabel: l10n.settingsTile,
          onTap: () => context.push(Routes.settings),
          color: Theme.of(context).colorScheme.secondaryContainer,
          octagonSize: 92,
        ),
        tiles: octagonTiles,
      ),
    );
  }

  String _label(AppLocalizations l10n, String key) {
    switch (key) {
      case 'costTile':
        return l10n.costTile;
      case 'locationTile':
        return l10n.locationTile;
      case 'bathroomTile':
        return l10n.bathroomTile;
      case 'attractionsTile':
        return l10n.attractionsTile;
      case 'counterTile':
        return l10n.counterTile;
      case 'boltTile':
        return l10n.boltTile;
      case 'bankingTile':
        return l10n.bankingTile;
      case 'weatherTile':
        return l10n.weatherTile;
      default:
        return key;
    }
  }
}
