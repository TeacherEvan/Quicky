import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
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
  final _picker = ImagePicker();
  CameraController? _controller;
  Future<void>? _initFuture;
  bool _cameraReady = false;

  @override
  void initState() {
    super.initState();
    _initFuture = _initCamera();
  }

  Future<void> _initCamera() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) return;
    _controller = CameraController(cameras.first, ResolutionPreset.medium);
    await _controller!.initialize();
    if (mounted) setState(() => _cameraReady = true);
  }

  Future<void> _capture() async {
    if (!_cameraReady) return;
    final l10n = AppLocalizations.of(context);
    try {
      final file = await _controller!.takePicture();
      _onImage(file.path, l10n);
    } on Exception {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..clearSnackBars()
        ..showSnackBar(SnackBar(content: Text(l10n.captureFailed)));
    }
  }

  Future<void> _pickGallery() async {
    final l10n = AppLocalizations.of(context);
    final xfile = await _picker.pickImage(source: ImageSource.gallery);
    if (xfile != null) _onImage(xfile.path, l10n);
  }

  void _onImage(String path, AppLocalizations l10n) {
    ref.read(costControllerProvider.notifier).setImage(path);
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
                  return const Center(
                    child: CircularProgressIndicator(
                      semanticsLabel: 'Loading camera',
                    ),
                  );
                }
                if (!_cameraReady) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.videocam_off_outlined, size: 48),
                        const SizedBox(height: 12),
                        Text(l10n.noCamera),
                      ],
                    ),
                  );
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
              child: Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      // Disabled until a camera is actually usable; the
                      // gallery path always works as the fallback.
                      onPressed: _cameraReady ? _capture : null,
                      icon: const Icon(Icons.camera),
                      label: Text(l10n.capture),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _pickGallery,
                      icon: const Icon(Icons.photo_library),
                      label: Text(l10n.gallery),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
