import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/app/routes.dart';
import 'package:app_mobile/features/add_link/presentation/bloc/add_link_cubit.dart';
import 'package:app_mobile/features/add_link/presentation/bloc/add_link_state.dart';
import 'package:app_mobile/i18n/strings.g.dart';
import 'package:app_mobile/shared/di/injector.dart';

class QuickSaveScreen extends StatelessWidget {
  const QuickSaveScreen({required this.url, super.key});

  final String url;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<AddLinkCubit>(
      create: (_) => getIt<AddLinkCubit>()..save(url),
      child: _QuickSaveView(url: url),
    );
  }
}

class _QuickSaveView extends StatelessWidget {
  const _QuickSaveView({required this.url});

  final String url;

  void _openLibrary(BuildContext context) {
    Navigator.pushNamedAndRemoveUntil(context, AppRoutes.library, (r) => false);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.quickSave;

    return Scaffold(
      appBar: AppBar(title: Text(t.title)),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: BlocBuilder<AddLinkCubit, AddLinkState>(
            builder: (context, state) {
              switch (state.status) {
                case AddLinkStatus.idle:
                case AddLinkStatus.saving:
                  return const _Busy();
                case AddLinkStatus.saved:
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle_outline, size: 48),
                      const SizedBox(height: 16),
                      Text(t.saved, textAlign: TextAlign.center),
                      const SizedBox(height: 24),
                      FilledButton(
                        onPressed: () => _openLibrary(context),
                        child: Text(t.openLibrary),
                      ),
                      TextButton(
                        onPressed: () => Navigator.maybePop(context),
                        child: Text(t.dismiss),
                      ),
                    ],
                  );
                case AddLinkStatus.error:
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, size: 48),
                      const SizedBox(height: 16),
                      Text(t.error, textAlign: TextAlign.center),
                      const SizedBox(height: 24),
                      FilledButton(
                        onPressed: () => context.read<AddLinkCubit>().save(url),
                        child: Text(t.retry),
                      ),
                      TextButton(
                        onPressed: () => Navigator.maybePop(context),
                        child: Text(t.dismiss),
                      ),
                    ],
                  );
              }
            },
          ),
        ),
      ),
    );
  }
}

class _Busy extends StatelessWidget {
  const _Busy();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const CircularProgressIndicator(),
        const SizedBox(height: 16),
        Text(context.t.quickSave.saving),
      ],
    );
  }
}
