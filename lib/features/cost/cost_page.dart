import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/cost/cost_controller.dart';
import 'package:quicky/features/cost/widgets/cost_result_card.dart';

/// Cost Translator page: camera preview, capture button, and a result card.
/// Camera lifecycle is handled locally; captured path lands in the provider.
class CostPage extends ConsumerStatefulWidget {
  const CostPage({super.key});

  @override
  ConsumerState<CostPage> createState() => _CostPageState();
}

class _CostPageState extends ConsumerState<CostPage> {
  CameraController? _controller;
  Future<void>? _initFuture;
  List<CameraDescription> _cameras = const [];

  @override
  void initState() {
    super.initState();
    _initFuture = _initCamera();
  }

  Future<void> _initCamera() async {
    _cameras = await availableCameras();
    if (_cameras.isEmpty) return;
    _controller = CameraController(_cameras.first, ResolutionPreset.medium);
    await _controller!.initialize();
    if (mounted) setState(() {});
  }

  Future<void> _capture() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    final l10n = AppLocalizations.of(context);
    final file = await _controller!.takePicture();
    ref.read(costControllerProvider.notifier).setImage(file.path);
    ref
        .read(costControllerProvider.notifier)
        .setPhrase(l10n.translate('costQuestion'));
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(costControllerProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.costTile)),
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<void>(
              future: _initFuture,
              builder: (context, snap) {
                if (snap.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (_controller == null || !_controller!.value.isInitialized) {
                  return const Center(child: Text('No camera available'));
                }
                return CameraPreview(_controller!);
              },
            ),
          ),
          if (state.imagePath != null)
            CostResultCard(
              imagePath: state.imagePath!,
              thaiPhrase: state.thaiPhrase,
            ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: FilledButton.icon(
                onPressed: _capture,
                icon: const Icon(Icons.camera),
                label: const Text('Capture'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
