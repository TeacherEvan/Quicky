import 'package:flutter/material.dart';

/// An octagon-shaped tappable tile: clip-path octagon, icon + label, tap ripple.
class OctagonTile extends StatelessWidget {
  const OctagonTile({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.size = 72,
    this.color,
    this.semanticsLabel,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final double size;
  final Color? color;

  /// Optional screen-reader label; defaults to [label] when null (Task 11.4 a11y).
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final tileColor = color ?? scheme.primaryContainer;
    final effectiveLabel = semanticsLabel ?? label;
    return Material(
      color: Colors.transparent,
      child: Semantics(
        button: true,
        label: effectiveLabel,
        child: InkWell(
          onTap: onTap,
          customBorder: const _OctagonBorder(),
          borderRadius: BorderRadius.circular(12),
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
        ),
      ),
    );
  }
}

class _OctagonClipper extends CustomClipper<Path> {
  const _OctagonClipper();

  @override
  Path getClip(Size size) {
    final w = size.width;
    final h = size.height;
    final c = w * 0.29; // corner cut length
    final path = Path()
      ..moveTo(c, 0)
      ..lineTo(w - c, 0)
      ..lineTo(w, c)
      ..lineTo(w, h - c)
      ..lineTo(w - c, h)
      ..lineTo(c, h)
      ..lineTo(0, h - c)
      ..lineTo(0, c)
      ..close();
    return path;
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
