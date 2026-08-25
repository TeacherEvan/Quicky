import 'dart:js_interop';
import 'dart:js_interop_unsafe';

/// Web implementation backed by the `beforeinstallprompt` event captured
/// early by `web/index.html`.
extension type _Window._(JSObject _) implements JSObject {
  external JSObject? get __quickyInstallPrompt;
  external set __quickyInstallPrompt(JSAny? value);
}

@JS('window')
external _Window get _window;

/// Whether the browser captured a `beforeinstallprompt` event.
bool pwaCanPromptInstall() {
  try {
    return _window.__quickyInstallPrompt != null;
  } on Object catch (_) {
    return false;
  }
}

/// Consumes the captured install prompt and clears the capture slot so the
/// Settings row disappears after use.
Future<void> pwaPromptInstall() async {
  final promptEvent = _window.__quickyInstallPrompt;
  if (promptEvent == null) return;
  _window.__quickyInstallPrompt = null;
  promptEvent.callMethod<JSAny?>('prompt'.toJS);
}
