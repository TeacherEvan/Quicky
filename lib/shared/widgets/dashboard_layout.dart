import 'dart:math';

import 'package:flutter/material.dart';
import 'package:quicky/shared/widgets/octagon_tile.dart';

/// Lays out 8 tiles in an octagon formation around a center widget.
///
/// Trig positions each tile on a ring; the rim size scales to the viewport so
/// the outer tiles never clip on small phones, and a faint connecting ring
/// ties the rim to the center hub. Tiles fade + pop in on a staggered curve.
class DashboardLayout extends StatefulWidget {
  const DashboardLayout({
    required this.tiles,
    required this.center,
    super.key,
    this.radius = 120,
  });

  /// Exactly 8 entries, placed clockwise starting from the top.
  final List<OctagonTile> tiles;
  final Widget center;
  final double radius;

  @override
  State<DashboardLayout> createState() => _DashboardLayoutState();
}

class _DashboardLayoutState extends State<DashboardLayout>
    with SingleTickerProviderStateMixin {
  late final AnimationController _enter = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 700),
  )..forward();

  @override
  void dispose() {
    _enter.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    assert(
      widget.tiles.length == 8,
      'DashboardLayout expects exactly 8 tiles.',
    );
    final scheme = Theme.of(context).colorScheme;
    final mq = MediaQuery.of(context);
    final viewport = min(mq.size.width, mq.size.height);

    // Scale the ring so the outermost octagon (plus its label) stays on-screen.
    // The floor yields to [safeMax] on short viewports instead of forcing
    // tiles past the screen edge.
    final octSize = widget.tiles.first.octagonSize;
    final maxRadius = viewport / 2 - octSize - 20.0; // 20 = label + margin
    final insets = mq.viewPadding;
    final padV = (insets.top + insets.bottom) / 2;
    final safeMax = maxRadius - padV;
    const floorRadius = 40.0;
    final r = min(widget.radius, max(safeMax, floorRadius));

    // Brighter ring in dark mode so it stays visible on _darkSurface; faint in
    // light mode so it doesn't compete with the octagons.
    final isDark = scheme.brightness == Brightness.dark;
    final ringColor = isDark
        ? scheme.outlineVariant.withValues(alpha: 0.7)
        : scheme.outlineVariant.withValues(alpha: 0.35);
    final ring = Container(
      width: r * 2 + octSize,
      height: r * 2 + octSize,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: ringColor, width: 1.5),
      ),
    );

    final placed = <Widget>[
      // Ring first (bottom of stack) and pointer-transparent: it is pure
      // decoration and must never block taps on the hub or tiles.
      Positioned.fill(
        child: IgnorePointer(
          child: Center(child: ring),
        ),
      ),
      _fade(child: Center(child: widget.center)),
    ];

    return SafeArea(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final cx = constraints.maxWidth / 2;
          final cy = constraints.maxHeight / 2;
          final ringChildren = <Widget>[];
          for (var i = 0; i < widget.tiles.length; i++) {
            // Start at -90° (top) and step 45° clockwise.
            final angle = (-90 + i * 45) * pi / 180;
            final dx = cos(angle) * r;
            final dy = sin(angle) * r;
            final delay = (i / widget.tiles.length) * 0.5;
            final anim = CurvedAnimation(
              parent: _enter,
              curve: Interval(delay, 1, curve: Curves.easeOutBack),
            );
            ringChildren.add(
              Positioned(
                // Offset by half the octagon so its CENTER sits on the ring
                // point around the STACK CENTER; the label hangs below.
                left: cx + dx - octSize / 2,
                top: cy + dy - octSize / 2,
                child: FadeTransition(
                  opacity: anim,
                  child: ScaleTransition(
                    scale: Tween<double>(begin: 0.6, end: 1).animate(anim),
                    child: widget.tiles[i],
                  ),
                ),
              ),
            );
          }
          return Stack(
            alignment: Alignment.center,
            children: [...placed, ...ringChildren],
          );
        },
      ),
    );
  }

  Widget _fade({required Widget child}) =>
      FadeTransition(opacity: _enter, child: child);
}
