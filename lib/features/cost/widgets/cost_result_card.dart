import 'package:flutter/material.dart';
import 'package:quicky/core/l10n/app_localizations.dart';

/// Result card for the Cost Translator: captured image + Thai phrase + copy.
class CostResultCard extends StatelessWidget {
  const CostResultCard({
    required this.imagePath,
    required this.thaiPhrase,
    super.key,
  });

  final String imagePath;
  final String thaiPhrase;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Card(
      margin: const EdgeInsets.all(12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                imagePath,
                width: 72,
                height: 72,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 72),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    thaiPhrase,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    l10n.translate('costQuestion'),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.copy),
              onPressed: () {
                // Copy to clipboard would live here (Task 11 wiring).
              },
              tooltip: 'Copy',
            ),
          ],
        ),
      ),
    );
  }
}
