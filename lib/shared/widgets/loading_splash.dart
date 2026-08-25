import 'dart:async';

import 'package:flutter/material.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
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
  Timer? _safetyTimer;
  Timer? _fadeTimer;
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

    // Safety net: never trap the user on a stalled splash. The clip is 3s;
    // 6s covers slow decode without stranding anyone for double digits.
    _safetyTimer = Timer(const Duration(seconds: 6), _finish);
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
    _fadeTimer = Timer(const Duration(milliseconds: 450), () {
      if (mounted) widget.onComplete?.call();
    });
  }

  @override
  void dispose() {
    _safetyTimer?.cancel();
    _fadeTimer?.cancel();
    _controller
      ..removeListener(_onVideoProgress)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final l10n = AppLocalizations.of(context);
    return AnimatedOpacity(
      opacity: _fadeOut ? 0.0 : 1.0,
      duration: const Duration(milliseconds: 450),
      child: Scaffold(
        backgroundColor: scheme.surface,
        body: SafeArea(
          child: Stack(
            children: [
              Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_controller.value.isInitialized)
                      AspectRatio(
                        aspectRatio:
                            _controller.value.size.width /
                            _controller.value.size.height,
                        child: VideoPlayer(_controller),
                      )
                    else
                      const CircularProgressIndicator(
                        semanticsLabel: 'Loading Quicky',
                      ),
                    const SizedBox(height: 24),
                    if (widget.label != null)
                      Text(
                        widget.label!,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                  ],
                ),
              ),
              // Visible way out: no one waits on a branding clip unwillingly.
              Positioned(
                right: 16,
                bottom: 16,
                child: TextButton(
                  onPressed: _finish,
                  style: TextButton.styleFrom(
                    minimumSize: const Size(48, 48),
                  ),
                  child: Text(l10n.skip),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
