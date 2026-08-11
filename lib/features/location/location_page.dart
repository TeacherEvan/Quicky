import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/location/location_controller.dart';
import 'package:quicky/features/location/services/geocode_service.dart';

/// Location Finder page: camera or gallery image, then a Thai place label.
class LocationPage extends ConsumerStatefulWidget {
  const LocationPage({super.key});

  @override
  ConsumerState<LocationPage> createState() => _LocationPageState();
}

class _LocationPageState extends ConsumerState<LocationPage> {
  final _picker = ImagePicker();
  CameraController? _controller;
  Future<void>? _initFuture;

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
    if (mounted) setState(() {});
  }

  Future<void> _capture() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    final file = await _controller!.takePicture();
    _onImage(file.path);
  }

  Future<void> _pickGallery() async {
    final xfile = await _picker.pickImage(source: ImageSource.gallery);
    if (xfile != null) _onImage(xfile.path);
  }

  Future<void> _onImage(String path) async {
    ref.read(locationControllerProvider.notifier).setImage(path);
    // Mock geocode for now; real lat/lng would come from image EXIF.
    const lat = 13.7563;
    const lng = 100.5018;
    final place = await GeocodeService().reverseGeocode(lat, lng);
    ref.read(locationControllerProvider.notifier).setPlace(place);
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(locationControllerProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.locationTile)),
      body: Column(
        children: [
          Expanded(
            child: state.imagePath == null
                ? FutureBuilder<void>(
                    future: _initFuture,
                    builder: (context, snap) {
                      if (snap.connectionState != ConnectionState.done) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (_controller == null ||
                          !_controller!.value.isInitialized) {
                        return const Center(child: Text('No camera available'));
                      }
                      return CameraPreview(_controller!);
                    },
                  )
                : Image.network(
                    state.imagePath!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        const Center(child: Icon(Icons.image, size: 80)),
                  ),
          ),
          if (state.placeName.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Card(
                child: ListTile(
                  leading: const Icon(Icons.place),
                  title: Text(state.placeName),
                ),
              ),
            ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _capture,
                      icon: const Icon(Icons.camera),
                      label: const Text('Capture'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _pickGallery,
                      icon: const Icon(Icons.photo_library),
                      label: const Text('Gallery'),
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
