import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/router/routes.dart';
import 'package:quicky/shared/widgets/loading_splash.dart';

/// Startup splash: plays the launch video once, then gently replaces the
/// route stack with the dashboard home (transition handled by LoadingSplash).
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) =>
      LoadingSplash(onComplete: () => context.replace(Routes.home));
}
