import 'package:flutter/material.dart';

import 'package:app_mobile/features/add_link/presentation/add_link_screen.dart';
import 'package:app_mobile/features/quick_save/presentation/quick_save_screen.dart';
import 'package:app_mobile/features/auth/presentation/sign_in_screen.dart';
import 'package:app_mobile/features/auth/presentation/sign_up_screen.dart';
import 'package:app_mobile/features/auth/presentation/welcome_screen.dart';
import 'package:app_mobile/features/item_detail/presentation/item_detail_screen.dart';
import 'package:app_mobile/features/library/presentation/library_screen.dart';
import 'package:app_mobile/features/settings/presentation/settings_screen.dart';

/// Named route constants.
abstract class AppRoutes {
  static const welcome = '/';
  static const signIn = '/sign-in';
  static const signUp = '/sign-up';
  static const settings = '/settings';
  static const library = '/library';
  static const itemDetail = '/item';
  static const addLink = '/add-link';
  static const quickSave = '/quick-save';
}

/// Route factory — maps route names to screen widgets.
Route<dynamic>? onGenerateRoute(RouteSettings settings) {
  final name = settings.name;

  if (name == AppRoutes.welcome) {
    return MaterialPageRoute<void>(
      builder: (_) => const WelcomeScreen(),
      settings: settings,
    );
  }

  if (name == AppRoutes.signIn) {
    return MaterialPageRoute<void>(
      builder: (_) => const SignInScreen(),
      settings: settings,
    );
  }

  if (name == AppRoutes.signUp) {
    return MaterialPageRoute<void>(
      builder: (_) => const SignUpScreen(),
      settings: settings,
    );
  }

  if (name == AppRoutes.settings) {
    return MaterialPageRoute<void>(
      builder: (_) => const SettingsScreen(),
      settings: settings,
    );
  }

  if (name == AppRoutes.library) {
    return MaterialPageRoute<void>(
      builder: (_) => const LibraryScreen(),
      settings: settings,
    );
  }

  if (name == AppRoutes.addLink) {
    return MaterialPageRoute<void>(
      builder: (_) => const AddLinkScreen(),
      settings: settings,
    );
  }

  if (name == AppRoutes.itemDetail) {
    final id = settings.arguments as String;
    return MaterialPageRoute<void>(
      builder: (_) => ItemDetailScreen(id: id),
      settings: settings,
    );
  }

  if (name == AppRoutes.quickSave) {
    final url = settings.arguments as String;
    return MaterialPageRoute<void>(
      builder: (_) => QuickSaveScreen(url: url),
      settings: settings,
    );
  }

  return null;
}
