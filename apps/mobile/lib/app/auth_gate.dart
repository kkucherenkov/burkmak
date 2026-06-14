import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/app/routes.dart';
import 'package:app_mobile/features/auth/presentation/bloc/auth_cubit.dart';
import 'package:app_mobile/features/auth/presentation/bloc/auth_state.dart';
import 'package:app_mobile/features/auth/presentation/welcome_screen.dart';
import 'package:app_mobile/features/library/presentation/library_screen.dart';
import 'package:app_mobile/i18n/strings.g.dart';
import 'package:app_mobile/shared/di/injector.dart';
import 'package:app_mobile/shared/navigation/app_navigator.dart';
import 'package:app_mobile/shared/share/pending_share_store.dart';

/// Root gate: bootstraps the [AuthCubit], checks the stored session, then
/// routes to either the unauthenticated stack (Welcome) or the authenticated
/// home screen.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<AuthCubit>(
      create: (_) => getIt<AuthCubit>()..checkSession(),
      child: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) {
          switch (state.status) {
            case AuthStatus.unauthenticated:
            case AuthStatus.error:
              return const WelcomeScreen();
            case AuthStatus.authenticating:
            case AuthStatus.otpSent:
              return const _SplashScreen();
            case AuthStatus.authenticated:
              WidgetsBinding.instance.addPostFrameCallback((_) {
                final pending = getIt<PendingShareStore>().take();
                if (pending != null) {
                  appNavigatorKey.currentState?.pushNamed(
                    AppRoutes.quickSave,
                    arguments: pending,
                  );
                }
              });
              return const LibraryScreen();
          }
        },
      ),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text(
          context.t.common.appTitle,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
    );
  }
}
