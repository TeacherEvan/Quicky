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

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final all = bankPackages.keys.toList();

    return Scaffold(
      appBar: AppBar(title: Text(l10n.bankingTile)),
      body: _checking
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: all.length,
              itemBuilder: (_, i) {
                final name = all[i];
                final installed = _installed.contains(name);
                return ListTile(
                  title: Text(name),
                  trailing: installed
                      ? FilledButton(
                          onPressed: () => BankingService().launch(name),
                          child: const Text('Open'),
                        )
                      : Chip(label: Text(l10n.notInstalled)),
                );
              },
            ),
    );
  }
}
