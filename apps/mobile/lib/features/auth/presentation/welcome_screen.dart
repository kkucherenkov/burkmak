import 'package:flutter/material.dart';

import 'package:app_mobile/app/routes.dart';
import 'package:app_mobile/i18n/strings.g.dart';

/// Entry point for unauthenticated users.
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.t.auth.welcome;
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Wordmark
              Text(
                'burkmak',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.5,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const Spacer(),
              // Eyebrow
              Text(
                t.eyebrow,
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 20),
              // Headline
              Text(
                t.headline,
                style: theme.textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  height: 1.15,
                  letterSpacing: -0.5,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 16),
              // Lead
              Text(
                t.subtitle,
                style: theme.textTheme.bodyLarge?.copyWith(
                  height: 1.6,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const Spacer(),
              // Primary CTA
              FilledButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.signUp),
                child: Text(t.getStarted),
              ),
              const SizedBox(height: 12),
              // Secondary CTA
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.signIn),
                child: Text(t.signIn),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}
