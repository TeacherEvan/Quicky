import 'package:installed_apps/installed_apps.dart';
import 'package:url_launcher/url_launcher.dart';

/// Verified Android package ids (Play Store, 2026-08-11). Schemes are
/// community-reported and must be verified on-device; the package id is the
/// authoritative installed-check target.
const Map<String, String> bankPackages = {
  'SCB EASY': 'com.scb.phone',
  'K PLUS (KBank)': 'com.kasikorn.retail.mbanking.wap',
  'Bualuang mBanking (BBL)': 'com.bbl.mobilebanking',
  'Krungthai NEXT (KTB)': 'ktbcs.netbank',
  'TTB touch': 'com.TMBTOUCH.PRODUCTION',
};

/// Launcher for Thai banking apps. Installed-only, background-resident.
class BankingService {
  /// Returns the subset of banks that are currently installed.
  Future<List<String>> installedBanks() async {
    final out = <String>[];
    for (final entry in bankPackages.entries) {
      try {
        final ok = await InstalledApps.isAppInstalled(entry.value) ?? false;
        if (ok) out.add(entry.key);
      } catch (_) {
        // skip on error
      }
    }
    return out;
  }

  /// Launches the given bank if installed. Returns false if absent.
  Future<bool> launch(String bankName) async {
    final pkg = bankPackages[bankName];
    if (pkg == null) return false;
    final uri = Uri.parse('package:$pkg');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      return true;
    }
    return false;
  }
}
