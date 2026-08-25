import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/banking/banking_service.dart';

/// Banking launcher page: list of known Thai banks; only installed ones launch.
class BankingPage extends ConsumerStatefulWidget {
  const BankingPage({super.key});

  @override
  ConsumerState<BankingPage> createState() => _BankingPageState();
}

class _BankingPageState extends ConsumerState<BankingPage> {
  List<String> _installed = const [];
  bool _checking = true;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    final list = await BankingService().installedBanks();
    if (mounted) {
      setState(() {
        _installed = list;
        _checking = false;
      });
    }
  }

  Future<void> _launch(String name) async {
    final l10n = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final ok = await BankingService().launch(name);
    if (!mounted) return;
    // Never fail silently: report the hand-off result either way.
    messenger
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Text(
            ok ? l10n.launchOpening(name) : l10n.launchFailed(name),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final all = bankPackages.keys.toList();

    return Scaffold(
      appBar: AppBar(title: Text(l10n.bankingTile)),
      body: _checking
          ? const Center(
              child: CircularProgressIndicator(semanticsLabel: 'Loading banks'),
            )
          : ListView.builder(
              itemCount: all.length,
              itemBuilder: (_, i) {
                final name = all[i];
                final installed = _installed.contains(name);
                // The whole row is the tap target (>= 48dp); the pill is the
                // visual affordance.
                return ListTile(
                  title: Text(name),
                  onTap: installed ? () => _launch(name) : null,
                  trailing: installed
                      ? FilledButton(
                          onPressed: () => _launch(name),
                          child: Text(l10n.open),
                        )
                      : Chip(label: Text(l10n.notInstalled)),
                );
              },
            ),
    );
  }
}
