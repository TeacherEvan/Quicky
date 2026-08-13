import 'package:flutter/material.dart';

/// An octagon-shaped tappable tile.
///
/// The octagon body carries a real cast shadow ([PhysicalShape]) plus a subtle
/// top-down gradient sheen and a thin outline so it reads as a raised surface
/// rather than a flat cut-out. The label sits *below* the octagon (not inside
/// it) so it stays legible at small sizes. A press scales the body for tactile
/// feedback; the whole tile is one semantics node.
class OctagonTile extends StatefulWidget {
  const OctagonTile({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.octagonSize = 68,
    this.color,
    this.accent,
    this.labelStyle,
    this.semanticsLabel,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final double octagonSize;
  final Color? color;

  /// Optional feature accent. Drives a subtle corner tint + edge glow for
  /// scannability. Falls back to the on-color when null.
  final Color? accent;

  /// Optional screen-reader label; defaults to [label] when null (Task 11.4 a11y).
  final String? semanticsLabel;

  /// Caption style for the label beneath the octagon.
  final TextStyle? labelStyle;

  @override
  State<OctagonTile> createState() => _OctagonTileState();
}

class _OctagonTileState extends State<OctagonTile>
    with SingleTickerProviderStateMixin {
  /// Drives the press-scale feedback (0.92 pressed -> 1.0 resting).
  late final AnimationController _scale = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 110),
    lowerBound: 0.92,
    upperBound: 1,
  )..value = 1;

  void _press() => _scale.reverse();
  void _release() => _scale.forward();

  @override
  void dispose() {
    _scale.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final base = widget.color ?? scheme.primaryContainer;
    final onColor = scheme.onPrimaryContainer;
    final caption =
        widget.labelStyle ??
        TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: scheme.onSurfaceVariant,
        );

    return Semantics(
      button: true,
      label: widget.semanticsLabel ?? widget.label,
      child: GestureDetector(
        onTapDown: (_) => _press(),
        onTapUp: (_) {
          _release();
          widget.onTap();
        },
        onTapCancel: _release,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ScaleTransition(
              scale: _scale,
              child: _OctagonBody(
                size: widget.octagonSize,
                icon: widget.icon,
                color: base,
                accent: widget.accent,
                onColor: onColor,
              ),
            ),
            const SizedBox(height: 6),
            ExcludeSemantics(
              child: SizedBox(
                width: widget.octagonSize + 18,
                child: Text(
                  widget.label,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: caption,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// The raised octagon body: cast shadow + gradient sheen + outline.
class _OctagonBody extends StatelessWidget {
  const _OctagonBody({
    required this.size,
    required this.icon,
    required this.color,
    required this.accent,
    required this.onColor,
  });

  final double size;
  final IconData icon;
  final Color color;
  final Color? accent;
  final Color onColor;

  @override
  Widget build(BuildContext context) {
    final clipper = const _OctagonClipper();
    final edge = accent ?? onColor;
    return Stack(
      children: [
        PhysicalShape(
          clipper: clipper,
          elevation: 6,
          shadowColor: accent?.withValues(alpha: 0.45) ?? Colors.black45,
          color: color,
          // PhysicalShape clips its child to the octagon automatically.
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color.lerp(color, Colors.white, 0.20)!, color],
              ),
            ),
            child: Center(
              child: Icon(icon, size: size * 0.42, color: onColor),
            ),
          ),
        ),
        // Thin accent edge so the octagon keeps its hue against similar tones
        // and reads as the feature's color at a glance.
        IgnorePointer(
          child: SizedBox(
            width: size,
            height: size,
            child: CustomPaint(
              painter: _OctagonOutlinePainter(edge.withValues(alpha: 0.85)),
            ),
          ),
        ),
      ],
    );
  }
}

class _OctagonOutlinePainter extends CustomPainter {
  _OctagonOutlinePainter(this.color);
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final path = const _OctagonClipper().getClip(size);
    canvas.drawPath(
      path,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5
        ..color = color,
    );
  }

  @override
  bool shouldRepaint(covariant _OctagonOutlinePainter old) =>
      old.color != color;
}

class _OctagonClipper extends CustomClipper<Path> {
  const _OctagonClipper();

  @override
  Path getClip(Size size) {
    final w = size.width;
    final h = size.height;
    final c = w * 0.29; // corner cut length
    return Path()
      ..moveTo(c, 0)
      ..lineTo(w - c, 0)
      ..lineTo(w, c)
      ..lineTo(w, h - c)
      ..lineTo(w - c, h)
      ..lineTo(c, h)
      ..lineTo(0, h - c)
      ..lineTo(0, c)
      ..close();
  }

  @override
  bool shouldReclip(_OctagonClipper old) => false;
}
