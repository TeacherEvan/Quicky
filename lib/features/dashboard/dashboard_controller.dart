import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Dashboard tile descriptor: route + static metadata.
class DashboardTile {
  const DashboardTile({
    required this.route,
    required this.icon,
    required this.labelKey,
  });

  final String route;
  final IconData icon;
  final String labelKey;
}

/// Provider holding the ordered list of dashboard tiles.
/// Order is fixed; visibility toggles could live here later (Task 10 settings).
final dashboardTilesProvider = Provider<List<DashboardTile>>((ref) {
  return const [
    DashboardTile(route: '/cost', icon: Icons.attach_money, labelKey: 'costTile'),
    DashboardTile(route: '/location', icon: Icons.place, labelKey: 'locationTile'),
    DashboardTile(route: '/bathroom', icon: Icons.wc, labelKey: 'bathroomTile'),
    DashboardTile(route: '/attractions', icon: Icons.attractions, labelKey: 'attractionsTile'),
    DashboardTile(route: '/counter', icon: Icons.timer, labelKey: 'counterTile'),
    DashboardTile(route: '/bolt', icon: Icons.electric_bolt, labelKey: 'boltTile'),
    DashboardTile(route: '/banking', icon: Icons.account_balance, labelKey: 'bankingTile'),
    DashboardTile(route: '/weather', icon: Icons.wb_sunny, labelKey: 'weatherTile'),
  ];
});
