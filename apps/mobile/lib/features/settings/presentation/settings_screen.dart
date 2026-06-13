import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/app/routes.dart';
import 'package:app_mobile/features/auth/presentation/bloc/auth_cubit.dart';
import 'package:app_mobile/i18n/strings.g.dart';
import 'package:app_mobile/shared/di/injector.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<AuthCubit>(
      create: (_) => getIt<AuthCubit>(),
      child: const _SettingsView(),
    );
  }
}

class _SettingsView extends StatelessWidget {
  const _SettingsView();

  @override
  Widget build(BuildContext context) {
    final t = context.t.settings;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.title)),
      body: ListView(
        children: [
          // Account section
          _SectionHeader(label: t.accountSection),
          ListTile(
            leading: Icon(Icons.logout, color: theme.colorScheme.error),
            title: Text(
              t.signOut,
              style: TextStyle(color: theme.colorScheme.error),
            ),
            onTap: () => _confirmSignOut(context),
          ),
          const Divider(),

          // App section
          _SectionHeader(label: t.appSection),
          ListTile(
            leading: const Icon(Icons.language_outlined),
            title: Text(t.languageLabel),
            trailing: DropdownButton<String>(
              value: LocaleSettings.currentLocale.languageCode,
              underline: const SizedBox.shrink(),
              items: const [
                DropdownMenuItem(value: 'en', child: Text('English')),
                DropdownMenuItem(value: 'ru', child: Text('Русский')),
                DropdownMenuItem(value: 'el', child: Text('Ελληνικά')),
                DropdownMenuItem(value: 'uk', child: Text('Українська')),
              ],
              onChanged: (String? code) {
                if (code == null) return;
                final locale = AppLocale.values.firstWhere(
                  (l) => l.languageCode == code,
                  orElse: () => AppLocale.en,
                );
                LocaleSettings.setLocale(locale);
              },
            ),
          ),
          const Divider(),

          // About section
          _SectionHeader(label: t.aboutSection),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text(t.version),
            trailing: Text(
              '0.1.0',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: Text(t.privacyPolicy),
            trailing: const Icon(Icons.open_in_new, size: 16),
            onTap: () => _showUrlSnackBar(
              context,
              'https://example.com/privacy',
            ),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: Text(t.termsOfService),
            trailing: const Icon(Icons.open_in_new, size: 16),
            onTap: () => _showUrlSnackBar(
              context,
              'https://example.com/terms',
            ),
          ),
        ],
      ),
    );
  }

  void _showUrlSnackBar(BuildContext context, String url) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(url),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _confirmSignOut(BuildContext context) async {
    final t = context.t.settings;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t.signOut),
        content: Text(t.signOutConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(t.signOutCancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              t.signOutConfirmButton,
              style: TextStyle(color: Theme.of(ctx).colorScheme.error),
            ),
          ),
        ],
      ),
    );
    if ((confirmed ?? false) && context.mounted) {
      await context.read<AuthCubit>().signOut();
      if (context.mounted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          AppRoutes.welcome,
          (_) => false,
        );
      }
    }
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        label,
        style: theme.textTheme.labelSmall?.copyWith(
          fontWeight: FontWeight.w500,
          color: theme.colorScheme.onSurfaceVariant,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
