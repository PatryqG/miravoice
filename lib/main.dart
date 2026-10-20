import 'package:flutter/material.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/screens/home_shell.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/theme_builder.dart';
import 'package:provider/provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppPaths.init();
  final store = await AppStore.open();
  runApp(
    ChangeNotifierProvider<AppStore>.value(
      value: store,
      child: const MiraVoiceApp(),
    ),
  );
}

class MiraVoiceApp extends StatelessWidget {
  const MiraVoiceApp({super.key});

  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppStore>().data;
    return MaterialApp(
      title: data.appName,
      debugShowCheckedModeBanner: false,
      theme: buildTheme(data.theme),
      home: const HomeShell(),
    );
  }
}
