import 'dart:convert';

import 'package:http/http.dart' as http;

/// Thin client for the Quicky Convex backend's HTTP actions.
///
/// [baseUrl] comes from `--dart-define` at build time. Convex exposes
/// httpActions on the SITE url (`CONVEX_SITE_URL`, e.g.
/// `https://<deployment>.convex.site`); legacy `CONVEX_URL` is accepted as a
/// fallback. When unset (non-web builds, or before the backend deploy)
/// [enabled] is false and callers fall through to direct-API / mock behaviour.
class ConvexClient {
  ConvexClient({this.baseUrlOverride, this.httpClient});

  /// Compile-time base URL injected via --dart-define.
  static const baseUrl = String.fromEnvironment('CONVEX_SITE_URL');

  /// Legacy alias, used only when CONVEX_SITE_URL is not provided.
  static const _legacyBaseUrl = String.fromEnvironment('CONVEX_URL');

  final String? baseUrlOverride;
  final http.Client? httpClient;

  String get _base =>
      baseUrlOverride ?? (baseUrl.isNotEmpty ? baseUrl : _legacyBaseUrl);

  bool get enabled => _base.isNotEmpty;

  /// GETs `<base>[path]?[params]` and decodes a JSON object response.
  ///
  /// Returns null on any failure (disabled, network error, timeout, non-200,
  /// upstream-error envelope, malformed body) so callers can fall back.
  Future<Map<String, dynamic>?> getJson(
    String path,
    Map<String, String> params,
  ) async {
    if (!enabled) return null;
    final injected = httpClient;
    if (injected != null) return _fetch(injected, path, params);
    // No injected client: use a throwaway one so nothing leaks.
    final client = http.Client();
    try {
      return await _fetch(client, path, params);
    } finally {
      client.close();
    }
  }

  Future<Map<String, dynamic>?> _fetch(
    http.Client client,
    String path,
    Map<String, String> params,
  ) async {
    try {
      final uri = Uri.parse('$_base$path').replace(queryParameters: params);
      final res = await client.get(uri).timeout(const Duration(seconds: 8));
      if (res.statusCode != 200) return null;
      final decoded = jsonDecode(res.body);
      if (decoded is! Map<String, dynamic>) return null;
      if (decoded['error'] != null) return null;
      return decoded;
    } on Exception {
      return null;
    }
  }
}
