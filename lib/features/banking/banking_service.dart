import 'package:flutter/foundation.dart';
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

/// Community-reported URL schemes (STACK.md). Web cannot resolve package
/// ids, so the web port hands off via these schemes (best-effort).
const Map<String, String> bankSchemes = {
  'SCB EASY': 'scb://',
  'K PLUS (KBank)': 'kbank://',
  'Bualuang mBanking (BBL)': 'bbl://',
  'Krungthai NEXT (KTB)': 'ktb://',
  'TTB touch': 'ttb://',
};

/// Launcher for Thai banking apps. Installed-only on native; on web the
/// installed check is unavailable so every bank offers a best-effort scheme
/// launch. Background-resident: never links to a store.
class BankingService {
  /// Returns the subset of banks that are currently installed.
  Future<List<String>> installedBanks() async {
    if (kIsWeb) return bankPackages.keys.toList();
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
    if (kIsWeb) {
      final scheme = bankSchemes[bankName];
      if (scheme == null) return false;
      final uri = Uri.parse(scheme);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        return true;
      }
      return false;
    }
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
