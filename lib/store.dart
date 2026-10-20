import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:miravoice/models.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Stan całej aplikacji: treści, wygląd i sesja administratora.
///
/// Dane zapisują się lokalnie na urządzeniu (SharedPreferences).
/// Żeby zmiany admina widzieli wszyscy użytkownicy, trzeba podłączyć
/// serwer - cała logika zapisu jest w metodzie [change], więc to jedno miejsce.
class AppStore extends ChangeNotifier {
  AppStore._(this._prefs, this.data);

  static const _dataKey = 'miravoice_data_v1';
  static const _hashKey = 'miravoice_pw_hash';
  static const _saltKey = 'miravoice_pw_salt';
  static const _defaultKey = 'miravoice_pw_default';

  /// Hasło startowe - zmień je od razu po pierwszym logowaniu.
  static const defaultPassword = 'miravoice';

  final SharedPreferences _prefs;
  AppData data;
  bool isAdmin = false;

  int _failedLogins = 0;
  DateTime? _lockedUntil;

  static Future<AppStore> open() async {
    final prefs = await SharedPreferences.getInstance();
    AppData data;
    final raw = prefs.getString(_dataKey);
    try {
      data = raw == null
          ? AppData.defaults()
          : AppData.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      data = AppData.defaults();
    }
    final store = AppStore._(prefs, data);
    if (prefs.getString(_hashKey) == null) {
      await store._setPassword(defaultPassword, isDefault: true);
    }
    return store;
  }

  /// Jedyne miejsce, przez które zmieniają się dane: zmiana -> zapis -> odświeżenie UI.
  void change(void Function(AppData d) edit) {
    edit(data);
    _prefs.setString(_dataKey, jsonEncode(data.toJson()));
    notifyListeners();
  }

  // --- Administrator -------------------------------------------------------

  bool get passwordIsDefault => _prefs.getBool(_defaultKey) ?? true;

  String _hash(String salt, String password) =>
      sha256.convert(utf8.encode('$salt:$password')).toString();

  Future<void> _setPassword(String password, {required bool isDefault}) async {
    final rnd = Random.secure();
    final salt =
        base64Url.encode(List<int>.generate(16, (_) => rnd.nextInt(256)));
    await _prefs.setString(_saltKey, salt);
    await _prefs.setString(_hashKey, _hash(salt, password));
    await _prefs.setBool(_defaultKey, isDefault);
  }

  bool _passwordMatches(String password) {
    final salt = _prefs.getString(_saltKey) ?? '';
    return _hash(salt, password) == _prefs.getString(_hashKey);
  }

  /// Zwraca komunikat błędu albo null, gdy logowanie się udało.
  String? login(String password) {
    final now = DateTime.now();
    final lock = _lockedUntil;
    if (lock != null && now.isBefore(lock)) {
      final seconds = lock.difference(now).inSeconds + 1;
      return 'Zbyt wiele prób. Spróbuj za $seconds s.';
    }
    if (_passwordMatches(password)) {
      _failedLogins = 0;
      isAdmin = true;
      notifyListeners();
      return null;
    }
    _failedLogins++;
    if (_failedLogins >= 5) {
      _lockedUntil = now.add(const Duration(seconds: 30));
      _failedLogins = 0;
    }
    return 'Nieprawidłowe hasło.';
  }

  void logout() {
    isAdmin = false;
    notifyListeners();
  }

  /// Zwraca komunikat błędu albo null, gdy hasło zostało zmienione.
  Future<String?> changePassword(String current, String next) async {
    if (!_passwordMatches(current)) return 'Obecne hasło jest nieprawidłowe.';
    if (next.length < 6) return 'Nowe hasło musi mieć co najmniej 6 znaków.';
    await _setPassword(next, isDefault: false);
    notifyListeners();
    return null;
  }
}
