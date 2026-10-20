import 'package:flutter/material.dart';
import 'package:miravoice/admin/admin_tabs.dart';
import 'package:miravoice/store.dart';
import 'package:provider/provider.dart';

class AdminLogin extends StatefulWidget {
  const AdminLogin({super.key});

  @override
  State<AdminLogin> createState() => _AdminLoginState();
}

class _AdminLoginState extends State<AdminLogin> {
  final _password = TextEditingController();
  bool _hidden = true;
  String? _error;

  @override
  void dispose() {
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    final error = context.read<AppStore>().login(_password.text);
    if (error == null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AdminPanel()),
      );
    } else {
      setState(() => _error = error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Logowanie administratora')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.lock_outline,
                  size: 48,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _password,
                  obscureText: _hidden,
                  autofocus: true,
                  onSubmitted: (_) => _submit(),
                  decoration: InputDecoration(
                    labelText: 'Hasło',
                    errorText: _error,
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _hidden ? Icons.visibility : Icons.visibility_off,
                      ),
                      onPressed: () => setState(() => _hidden = !_hidden),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _submit,
                    child: const Text('Zaloguj'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class AdminPanel extends StatelessWidget {
  const AdminPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    if (!store.isAdmin) {
      return const Scaffold(body: Center(child: Text('Wylogowano.')));
    }
    return DefaultTabController(
      length: 7,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Panel administratora'),
          actions: [
            IconButton(
              tooltip: 'Wyloguj',
              icon: const Icon(Icons.logout),
              onPressed: () {
                Navigator.of(context).pop();
                store.logout();
              },
            ),
          ],
          bottom: const TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: [
              Tab(text: 'Treść'),
              Tab(text: 'Odcinki'),
              Tab(text: 'Aktorzy'),
              Tab(text: 'Historia'),
              Tab(text: 'Miraculous'),
              Tab(text: 'Wygląd'),
              Tab(text: 'Konto'),
            ],
          ),
        ),
        body: Column(
          children: [
            if (store.passwordIsDefault)
              Container(
                width: double.infinity,
                color: Colors.amber.shade200,
                padding: const EdgeInsets.all(12),
                child: const Text(
                  'Używasz hasła domyślnego. Zmień je w zakładce „Konto”.',
                  style: TextStyle(color: Colors.black),
                ),
              ),
            const Expanded(
              child: TabBarView(
                children: [
                  ContentTab(),
                  EpisodesTab(),
                  ActorsTab(),
                  HistoryTab(),
                  MiraTab(),
                  AppearanceTab(),
                  AccountTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
