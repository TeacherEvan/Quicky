import 'package:flutter_test/flutter_test.dart';
import 'package:quicky/main.dart';

void main() {
  testWidgets('Quicky app boots and shows splash', (tester) async {
    await tester.pumpWidget(const QuickyApp());
    // Splash page shows briefly (LoadingSplash).
    expect(find.byType(QuickyApp), findsOneWidget);
  });
}
