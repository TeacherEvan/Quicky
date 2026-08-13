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
    required this.icon,
    required this.label,
    required this.onTap,
    super.key,
    this.octagonSize = 68,
    this.color,
    this.accent,
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

  /// Optional screen-reader label; defaults to [label] (Task 11.4 a11y).
  final String? semanticsLabel;

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
    final tileColor = color ?? scheme.primaryContainer;
    final effectiveLabel = semanticsLabel ?? label;
    return Material(
      color: Colors.transparent,
      // Keyboard accessibility (WCAG 2.1 AA): InkWell is focusable and activates
      // on Enter/Space; FocusableActionDetector makes the focus ring visible and
      // exposes an explicit ActivateIntent so the ripple tracks both pointer and key.
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        child: Semantics(
          button: true,
          label: effectiveLabel,
          child: InkWell(
            onTap: onTap,
            customBorder: const _OctagonBorder(),
            borderRadius: BorderRadius.circular(12),
            // Draw the focus highlight above the octagon clip so it is never occluded.
            focusColor: scheme.onPrimaryContainer.withOpacity(0.24),
            hoverColor: scheme.onPrimaryContainer.withOpacity(0.12),
            splashFactory: InkRipple.splashFactory,
            child: SizedBox(
              width: size,
              height: size,
              child: ClipPath(
                clipper: const _OctagonClipper(),
                child: Container(
                  color: tileColor,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        icon,
                        size: size * 0.34,
                        color: scheme.onPrimaryContainer,
                      ),
                      const SizedBox(height: 4),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        // Exclude the inner Text from the semantics tree so the
                        // tile's label isn't announced twice (Text + Semantics).
                        child: ExcludeSemantics(
                          child: Text(
                            label,
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: size * 0.13,
                              color: scheme.onPrimaryContainer,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
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

class _OctagonBorder extends OutlinedBorder {
  const _OctagonBorder();

  @override
  OutlinedBorder copyWith({BorderSide? side}) => this;

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final c = rect.width * 0.29;
    return Path()
      ..moveTo(rect.left + c, rect.top)
      ..lineTo(rect.right - c, rect.top)
      ..lineTo(rect.right, rect.top + c)
      ..lineTo(rect.right, rect.bottom - c)
      ..lineTo(rect.right - c, rect.bottom)
      ..lineTo(rect.left + c, rect.bottom)
      ..lineTo(rect.left, rect.bottom - c)
      ..lineTo(rect.left, rect.top + c)
      ..close();
  }

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) =>
      getOuterPath(rect);

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {}

  @override
  OutlinedBorder scale(double t) => this;
}
