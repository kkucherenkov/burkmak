import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_cubit.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_state.dart';
import 'package:app_mobile/i18n/strings.g.dart';
import 'package:app_mobile/shared/di/injector.dart';

class ItemDetailScreen extends StatelessWidget {
  const ItemDetailScreen({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<DetailCubit>(
      create: (_) => getIt<DetailCubit>()..load(id),
      child: const _DetailView(),
    );
  }
}

class _DetailView extends StatefulWidget {
  const _DetailView();

  @override
  State<_DetailView> createState() => _DetailViewState();
}

class _DetailViewState extends State<_DetailView> {
  final _tagController = TextEditingController();

  @override
  void dispose() {
    _tagController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.itemDetail;
    return Scaffold(
      appBar: AppBar(
        title: Text(t.back),
        actions: [
          IconButton(
            icon: const Icon(Icons.archive_outlined),
            tooltip: t.archive,
            onPressed: () =>
                context.read<DetailCubit>().setReadState(ReadState.archived),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: t.delete,
            onPressed: () async {
              await context.read<DetailCubit>().delete();
              if (context.mounted) Navigator.pop(context);
            },
          ),
        ],
      ),
      body: BlocBuilder<DetailCubit, DetailState>(
        builder: (context, state) {
          if (state.status == DetailStatus.loading || state.item == null) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == DetailStatus.error) {
            return Center(child: Text(t.error));
          }
          final item = state.item!;
          final cubit = context.read<DetailCubit>();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                item.title ?? item.url,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                item.siteName ?? item.url,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              if (item.excerpt != null) ...[
                const SizedBox(height: 16),
                Text(
                  item.excerpt!,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                children: [
                  for (final tag in item.tags)
                    Chip(
                      label: Text(tag),
                      onDeleted: () => cubit.removeTag(tag),
                    ),
                ],
              ),
              TextField(
                controller: _tagController,
                decoration: InputDecoration(labelText: t.addTag),
                onSubmitted: (v) {
                  final trimmed = v.trim();
                  if (trimmed.isNotEmpty) {
                    cubit.addTag(trimmed);
                    _tagController.clear();
                  }
                },
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                children: [
                  OutlinedButton(
                    onPressed: () => cubit.setReadState(ReadState.unread),
                    child: Text(t.read.unread),
                  ),
                  OutlinedButton(
                    onPressed: () => cubit.setReadState(ReadState.read),
                    child: Text(t.read.read),
                  ),
                  OutlinedButton(
                    onPressed: () => cubit.setReadState(ReadState.archived),
                    child: Text(t.read.archived),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: cubit.toggleFavorite,
                    icon: Icon(item.favorite ? Icons.star : Icons.star_border),
                    label: Text(t.favorite),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}
