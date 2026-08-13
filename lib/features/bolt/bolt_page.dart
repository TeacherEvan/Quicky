import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/bolt/bolt_service.dart';

/// Bolt launcher page: single button; shows "Not installed" if absent.
class BoltPage extends ConsumerStatefulWidget {
  const BoltPage({super.key});

  @override
  ConsumerState<BoltPage> createState() => _BoltPageState();
}

class _BoltPageState extends ConsumerState<BoltPage> {
  bool _checking = true;
  bool _installed = false;
  bool _launched = false;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    final installed = await BoltService().isInstalled();
    if (mounted) setState(() => _installed = installed);
    _checking = false;
  }

  Future<void> _launch() async {
    final ok = await BoltService().launch();
    if (mounted) setState(() => _launched = ok);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.boltTile)),
      body: Center(
        child: _checking
            ? const CircularProgressIndicator()
            : !_installed
            ? Text(l10n.notInstalled)
            : FilledButton.icon(
                onPressed: _launch,
                icon: const Icon(Icons.electric_bolt),
                label: Text(_launched ? 'Launched' : 'Launch BOLT'),
              ),
      ),
    );
  }
}
