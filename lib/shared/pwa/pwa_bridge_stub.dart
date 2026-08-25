// Non-web fallback: no browser install prompt ever exists on native
// platforms.

/// Whether the browser captured a `beforeinstallprompt` event.
bool pwaCanPromptInstall() => false;

/// Consumes the captured install prompt (no-op off the web).
Future<void> pwaPromptInstall() async {}
