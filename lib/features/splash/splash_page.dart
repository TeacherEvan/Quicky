import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/router/routes.dart';
import 'package:quicky/shared/widgets/loading_splash.dart';

/// Startup splash: always plays the launch video on cold launch, then gently
/// replaces the route stack with the dashboard home (transition handled by
/// `LoadingSplash`).
///
/// The startup video is the user's first impression of the app, so it plays
/// every time the app cold-launches (no once-per-session skip). A "Skip"
/// button inside `LoadingSplash` lets the user opt out at any time.
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  void _onComplete() {
    context.replace(Routes.home);
  }

  @override
  Widget build(BuildContext context) {
    return LoadingSplash(onComplete: _onComplete);
  }
}
