import 'package:installed_apps/installed_apps.dart';
import 'package:url_launcher/url_launcher.dart';

/// Launcher for the BOLT ride app.
///
/// Contract (verified 2026-08-11 + user clarification):
/// - installed-app-only: check presence via installed_apps; if absent, do NOT
///   deep-link to the store.
/// - background-resident: launch keeps Quicky in the recents stack; never
///   call SystemNavigator.pop() / exit(0).
/// - Android package id is the authoritative installed-check target.
class BoltService {
  static const packageId = 'ee.mtakso.client';
  static const scheme = 'boltd://'; // community-reported, verify on-device

  /// Returns true if BOLT is installed.
  Future<bool> isInstalled() async {
    try {
      return await InstalledApps.isAppInstalled(packageId) ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Launches BOLT if installed. Returns false if not installed.
  Future<bool> launch() async {
    if (!await isInstalled()) return false;
    // Package id is the authoritative installed-check target (verified Play
    // Store value); the scheme is community-reported and unverified, so try
    // the package intent first and only fall back to the scheme.
    final pkgUri = Uri.parse('package:$packageId');
    if (await canLaunchUrl(pkgUri)) {
      await launchUrl(pkgUri, mode: LaunchMode.externalApplication);
      return true;
    }
    final schemeUri = Uri.parse('${scheme}home');
    if (await canLaunchUrl(schemeUri)) {
      await launchUrl(schemeUri, mode: LaunchMode.externalApplication);
      return true;
    }
    return false;
  }
}
