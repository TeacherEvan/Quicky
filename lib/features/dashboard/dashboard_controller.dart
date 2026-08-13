import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Dashboard tile descriptor: route + static metadata + accent color.
class DashboardTile {
  const DashboardTile({
    required this.route,
    required this.icon,
    required this.labelKey,
    required this.accent,
  });

  final String route;
  final IconData icon;
  final String labelKey;

  /// Feature accent used for scannability (subtle octagon tint + edge glow).
  final Color accent;
}

/// Provider holding the ordered list of dashboard tiles.
/// Order is fixed; visibility toggles could live here later (Task 10 settings).
final dashboardTilesProvider = Provider<List<DashboardTile>>((ref) {
  return const [
    DashboardTile(
      route: '/cost',
      icon: Icons.attach_money,
      labelKey: 'costTile',
      accent: Color(0xFF2E9E5B),
    ),
    DashboardTile(
      route: '/location',
      icon: Icons.place,
      labelKey: 'locationTile',
      accent: Color(0xFF2D7FF9),
    ),
    DashboardTile(
      route: '/bathroom',
      icon: Icons.wc,
      labelKey: 'bathroomTile',
      accent: Color(0xFF15A0A0),
    ),
    DashboardTile(
      route: '/attractions',
      icon: Icons.attractions,
      labelKey: 'attractionsTile',
      accent: Color(0xFFE8821E),
    ),
    DashboardTile(
      route: '/counter',
      icon: Icons.timer,
      labelKey: 'counterTile',
      accent: Color(0xFFD6453D),
    ),
    DashboardTile(
      route: '/bolt',
      icon: Icons.electric_bolt,
      labelKey: 'boltTile',
      accent: Color(0xFFE0A800),
    ),
    DashboardTile(
      route: '/banking',
      icon: Icons.account_balance,
      labelKey: 'bankingTile',
      accent: Color(0xFF6C4BE0),
    ),
    DashboardTile(
      route: '/weather',
      icon: Icons.wb_sunny,
      labelKey: 'weatherTile',
      accent: Color(0xFF1FA8C9),
    ),
  ];
});
