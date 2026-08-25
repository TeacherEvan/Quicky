/// Platform bridge for PWA shell behaviour (install prompt + per-session
/// splash flag).
///
/// `dart:js_interop` is only available on web targets, so the implementation
/// is selected via conditional export: web builds get `pwa_bridge_web.dart`,
/// every other target (and the VM test runner) gets the in-memory stub.
library;

export 'pwa_bridge_stub.dart'
    if (dart.library.js_interop) 'pwa_bridge_web.dart';
