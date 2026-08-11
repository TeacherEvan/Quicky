import 'dart:math';

import 'package:flutter/material.dart';
import 'package:quicky/shared/widgets/octagon_tile.dart';

/// Lays out 8 tiles in an octagon formation around a center widget.
/// Uses trig to position each tile on a ring; center is the settings hub.
class DashboardLayout extends StatelessWidget {
  const DashboardLayout({
    super.key,
    required this.tiles,
    required this.center,
    this.radius = 120,
  });

  /// Exactly 8 entries, placed clockwise starting from the top.
  final List<OctagonTile> tiles;
  final Widget center;
  final double radius;

  @override
  Widget build(BuildContext context) {
    assert(tiles.length == 8, 'DashboardLayout expects exactly 8 tiles.');
    final placed = <Widget>[Center(child: center)];
    for (var i = 0; i < tiles.length; i++) {
      // Start at -90° (top) and step 45° clockwise.
      final angle = (-90 + i * 45) * pi / 180;
      final dx = cos(angle) * radius;
      final dy = sin(angle) * radius;
      placed.add(
        Positioned(
          // Offset by half the tile size so each tile's CENTER sits on the ring
          // point (the Stack origin is its top-left, not the center).
          left: dx - tiles[i].size / 2,
          top: dy - tiles[i].size / 2,
          child: tiles[i],
        ),
      );
    }
    return SizedBox.expand(
      child: Stack(alignment: Alignment.center, children: placed),
    );
  }
}
