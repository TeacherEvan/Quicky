import 'dart:async';

import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

/// Startup splash: plays the launch video exactly once, then gently proceeds.
class LoadingSplash extends StatefulWidget {
  const LoadingSplash({super.key, this.label = 'Quicky', this.onComplete});

  final String? label;

  /// Called after the clip finishes and the fade-out completes.
  final VoidCallback? onComplete;

  @override
  State<LoadingSplash> createState() => _LoadingSplashState();
}

class _LoadingSplashState extends State<LoadingSplash> {
  late VideoPlayerController _controller;
  bool _fadeOut = false;
  bool _completed = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.asset('assets/videos/startup.mp4')
      ..addListener(_onVideoProgress)
      ..initialize().then((_) {
        if (!mounted) return;
        setState(() {});
        _controller.play();
      }, onError: (_) => _finish());

    // Safety net: never trap the user on a stalled splash.
    Timer(const Duration(seconds: 14), _finish);
  }

  void _onVideoProgress() {
    if (!mounted || _completed) return;
    final v = _controller.value;
    if (v.isInitialized &&
        v.position >= v.duration - const Duration(milliseconds: 200)) {
      _finish();
    }
  }

  void _finish() {
    if (_completed) return;
    _completed = true;
    _controller.removeListener(_onVideoProgress);
    if (!mounted) return;
    // Gentle fade, then proceed to the next window.
    setState(() => _fadeOut = true);
    Timer(const Duration(milliseconds: 450), () {
      if (mounted) widget.onComplete?.call();
    });
  }

  @override
  void dispose() {
    _controller.removeListener(_onVideoProgress);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AnimatedOpacity(
      opacity: _fadeOut ? 0.0 : 1.0,
      duration: const Duration(milliseconds: 450),
      child: Scaffold(
        backgroundColor: scheme.surface,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _controller.value.isInitialized
                  ? AspectRatio(
                      aspectRatio:
                          _controller.value.size.width /
                          _controller.value.size.height,
                      child: VideoPlayer(_controller),
                    )
                  : const CircularProgressIndicator(),
              const SizedBox(height: 24),
              if (widget.label != null)
                Text(
                  widget.label!,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
