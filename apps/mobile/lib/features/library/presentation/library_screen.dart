import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/app/routes.dart';
import 'package:app_mobile/features/library/presentation/bloc/library_cubit.dart';
import 'package:app_mobile/features/library/presentation/bloc/library_state.dart';
import 'package:app_mobile/features/library/presentation/widgets/filter_bar.dart';
import 'package:app_mobile/features/library/presentation/widgets/item_card.dart';
import 'package:app_mobile/i18n/strings.g.dart';
import 'package:app_mobile/shared/di/injector.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<LibraryCubit>(
      create: (_) => getIt<LibraryCubit>()
        ..load()
        ..subscribe(),
      child: const _LibraryView(),
    );
  }
}

class _LibraryView extends StatelessWidget {
  const _LibraryView();

  @override
  Widget build(BuildContext context) {
    final t = context.t.library;
    return Scaffold(
      appBar: AppBar(title: Text(t.title)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.addLink),
        child: const Icon(Icons.add),
      ),
      body: BlocBuilder<LibraryCubit, LibraryState>(
        builder: (context, state) {
          final cubit = context.read<LibraryCubit>();
          return Column(
            children: [
              FilterBar(
                segment: state.segment,
                query: state.query,
                tag: state.tag,
                onSegment: cubit.setSegment,
                onQuery: cubit.setQuery,
                onTag: cubit.setTag,
              ),
              Expanded(
                child: switch (state.status) {
                  LibraryStatus.loading => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  LibraryStatus.ready when state.items.isEmpty => Center(
                    child: Text(t.empty),
                  ),
                  LibraryStatus.error => _ErrorView(
                    message: state.errorMessage,
                    onRetry: cubit.load,
                  ),
                  _ => ListView.builder(
                    itemCount: state.items.length,
                    itemBuilder: (context, i) {
                      final item = state.items[i];
                      return ItemCard(
                        item: item,
                        onOpen: () => Navigator.pushNamed(
                          context,
                          AppRoutes.itemDetail,
                          arguments: item.id,
                        ),
                        onFavorite: () => cubit.toggleFavorite(item),
                        onArchive: () =>
                            cubit.setReadState(item, ReadState.archived),
                        onDelete: () => cubit.remove(item.id),
                      );
                    },
                  ),
                },
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({this.message, required this.onRetry});

  final String? message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 12),
            if (message != null)
              Text(
                message!,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium,
              ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: Text(context.t.library.retry),
            ),
          ],
        ),
      ),
    );
  }
}
