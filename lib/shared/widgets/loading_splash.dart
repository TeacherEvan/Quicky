import 'package:flutter/material.dart';

/// Startup splash: logo + indeterminate progress. Minimum display is enforced
/// by the caller (splash page) before navigating.
class LoadingSplash extends StatelessWidget {
  const LoadingSplash({super.key, this.label = 'Quicky'});

  final String label;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surface,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const FlutterLogo(size: 72, style: FlutterLogoStyle.stacked),
            const SizedBox(height: 24),
            Text(label, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 24),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
