import 'package:go_router/go_router.dart';

import 'package:quicky/features/weather/weather_page.dart';
import 'package:quicky/features/banking/banking_page.dart';
import 'package:quicky/features/bolt/bolt_page.dart';
import 'package:quicky/features/counter/counter_page.dart';
import 'package:quicky/features/attractions/attractions_page.dart';
import 'package:quicky/features/bathroom/bathroom_page.dart';
import 'package:quicky/features/cost/cost_page.dart';
import 'package:quicky/features/dashboard/dashboard_page.dart';
import 'package:quicky/features/location/location_page.dart';
import 'package:quicky/features/splash/splash_page.dart';

/// Central route path constants.
class Routes {
  Routes._();

  static const String home = '/';
  static const String splash = '/splash';
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
final List<RouteBase> appRoutes = <RouteBase>[
  GoRoute(
    path: Routes.splash,
    builder: (context, state) => const SplashPage(),
  ),
  GoRoute(
    path: Routes.weather,
    builder: (context, state) => const WeatherPage(),
  ),
  GoRoute(
    path: Routes.banking,
    builder: (context, state) => const BankingPage(),
  ),
  GoRoute(
    path: Routes.bolt,
    builder: (context, state) => const BoltPage(),
  ),
  GoRoute(
    path: Routes.counter,
    builder: (context, state) => const CounterPage(),
  ),
  GoRoute(
    path: Routes.attractions,
    builder: (context, state) => const AttractionsPage(),
  ),
  GoRoute(
    path: Routes.bathroom,
    builder: (context, state) => const BathroomPage(),
  ),
  GoRoute(
    path: Routes.location,
    builder: (context, state) => const LocationPage(),
  ),
  GoRoute(
    path: Routes.cost,
    builder: (context, state) => const CostPage(),
  ),
  GoRoute(
    path: Routes.home,
    builder: (context, state) => const DashboardPage(),
  ),
];
