import 'package:flutter/material.dart';

import 'package:app_mobile/app/routes.dart';

/// Phone + OTP covers both sign-in and sign-up; the historic sign-up route
/// stays in the router so any deep link keeps working, but the screen just
/// forwards to the unified phone auth flow.
class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!context.mounted) return;
      Navigator.pushReplacementNamed(context, AppRoutes.signIn);
    });
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
