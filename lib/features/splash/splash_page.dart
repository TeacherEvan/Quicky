import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/router/routes.dart';
import 'package:quicky/shared/widgets/loading_splash.dart';

/// Startup splash: shows LoadingSplash for a minimum of 2s, then replaces the
/// route stack with the dashboard home.
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 2), () {
      if (mounted) context.replace(Routes.home);
    });
  }

  @override
  Widget build(BuildContext context) => const LoadingSplash();
}
