import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
/// Startup splash: video-based animation. Minimum display is enforced
/// by the caller (splash page) before navigating.
class LoadingSplash extends StatefulWidget {
  const LoadingSplash({super.key, this.label = 'Quicky'});
  final String? label;
  @override
  State<LoadingSplash> createState() => _LoadingSplashState();
}

class _LoadingSplashState extends State<LoadingSplash> {
  late VideoPlayerController _controller;
  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.asset('assets/videos/startup.mp4')
      ..initialize().then((_) {
        // Ensure the first frame is shown after initialization
        setState(() {});
        // Play the video
        _controller.play();
        // Ensure looping
        _controller.setLooping(true);
      });
    super.initState();
  }
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surface,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Wait for video to initialize
            _controller.value.isInitialized
                ? AspectRatio(
                    aspectRatio: _controller.value.size.width /
                        _controller.value.size.height,
                    child: VideoPlayer(_controller),
                  )
                : const CircularProgressIndicator(),
            const SizedBox(height: 24),
            if (widget.label != null)
              Text(widget.label!,
                  style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 24),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}