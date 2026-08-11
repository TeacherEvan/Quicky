import 'package:go_router/go_router.dart';

/// Central route path constants.
class Routes {
  Routes._();

  static const String home = '/';
  static const String settings = '/settings';
  static const String cost = '/cost';
  static const String location = '/location';
  static const String bathroom = '/bathroom';
  static const String attractions = '/attractions';
  static const String counter = '/counter';
  static const String bolt = '/bolt';
  static const String banking = '/banking';
  static const String weather = '/weather';
}

/// Append-only route registry. Feature jobs (J4–J13) add their `RouteBase`
/// entries HERE, never inside app_router.dart, to respect directory scope locks.
final List<RouteBase> appRoutes = <RouteBase>[];
