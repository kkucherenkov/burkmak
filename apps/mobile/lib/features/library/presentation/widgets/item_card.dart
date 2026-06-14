import 'package:flutter/material.dart';

import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/i18n/strings.g.dart';

class ItemCard extends StatelessWidget {
  const ItemCard({
    super.key,
    required this.item,
    required this.onOpen,
    required this.onFavorite,
    required this.onArchive,
    required this.onDelete,
  });

  final Item item;
  final VoidCallback onOpen;
  final VoidCallback onFavorite;
  final VoidCallback onArchive;
  final VoidCallback onDelete;

  String _initial() {
    final src = item.siteName ?? item.url;
    return src.isNotEmpty ? src[0].toUpperCase() : '?';
  }

  Color _avatarColor(BuildContext context) {
    final seed = (item.siteName ?? item.url).codeUnits.fold(0, (a, b) => a + b);
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.teal,
      Colors.red,
      Colors.indigo,
    ];
    return colors[seed % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = context.t.library;
    final isPending = item.status == ItemStatus.pending;
    final isFailed = item.status == ItemStatus.failed;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Favicon initial avatar
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _avatarColor(context),
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  _initial(),
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title row + status chip
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            item.title ?? item.url,
                            style: theme.textTheme.titleMedium,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (isPending || isFailed) ...[
                          const SizedBox(width: 8),
                          _StatusChip(pending: isPending),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    // Site / meta line
                    if (item.siteName != null)
                      Text(
                        item.siteName!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 4),
                    // Excerpt or pending placeholder
                    if (isPending)
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _ShimmerLine(width: double.infinity),
                          SizedBox(height: 4),
                          _ShimmerLine(width: 160),
                        ],
                      )
                    else if (item.excerpt != null)
                      Text(
                        item.excerpt!,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    // Tags
                    if (item.tags.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 4,
                        runSpacing: 2,
                        children: item.tags
                            .map(
                              (tag) => Chip(
                                label: Text(tag),
                                labelStyle: theme.textTheme.labelSmall,
                                padding: EdgeInsets.zero,
                                materialTapTargetSize:
                                    MaterialTapTargetSize.shrinkWrap,
                              ),
                            )
                            .toList(),
                      ),
                    ],
                  ],
                ),
              ),
              // Actions
              PopupMenuButton<_CardAction>(
                onSelected: (action) {
                  switch (action) {
                    case _CardAction.favorite:
                      onFavorite();
                    case _CardAction.archive:
                      onArchive();
                    case _CardAction.delete:
                      onDelete();
                  }
                },
                itemBuilder: (_) => [
                  PopupMenuItem(
                    value: _CardAction.favorite,
                    child: Row(
                      children: [
                        Icon(
                          item.favorite ? Icons.star : Icons.star_border,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(t.act.favorite),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: _CardAction.archive,
                    child: Row(
                      children: [
                        const Icon(Icons.archive_outlined, size: 20),
                        const SizedBox(width: 8),
                        Text(t.act.archive),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: _CardAction.delete,
                    child: Row(
                      children: [
                        Icon(
                          Icons.delete_outline,
                          size: 20,
                          color: Theme.of(context).colorScheme.error,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          t.act.delete,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

enum _CardAction { favorite, archive, delete }

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.pending});

  final bool pending;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: pending
            ? theme.colorScheme.secondaryContainer
            : theme.colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        pending ? 'Pending' : 'Failed',
        style: theme.textTheme.labelSmall?.copyWith(
          color: pending
              ? theme.colorScheme.onSecondaryContainer
              : theme.colorScheme.onErrorContainer,
        ),
      ),
    );
  }
}

class _ShimmerLine extends StatelessWidget {
  const _ShimmerLine({required this.width});

  final double width;

  @override
  Widget build(BuildContext context) {
    return LinearProgressIndicator(
      minHeight: 10,
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
    );
  }
}
