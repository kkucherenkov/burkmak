import 'package:app_api_client/app_api_client.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_html/flutter_html.dart';

import 'package:app_mobile/features/item_detail/domain/highlight_inject.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_cubit.dart';
import 'package:app_mobile/features/item_detail/presentation/bloc/detail_state.dart';
import 'package:app_mobile/i18n/strings.g.dart';
import 'package:app_mobile/shared/config/app_config.dart';
import 'package:app_mobile/shared/di/injector.dart';

class ItemDetailScreen extends StatelessWidget {
  const ItemDetailScreen({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<DetailCubit>(
      create: (_) => getIt<DetailCubit>()
        ..load(id)
        ..subscribe(),
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
              const SizedBox(height: 24),
              // ── Reader section ──────────────────────────────────────────
              _ReaderSection(state: state, cubit: cubit),
            ],
          );
        },
      ),
    );
  }
}

/// Renders the reader section based on the current [extractStatus].
class _ReaderSection extends StatelessWidget {
  const _ReaderSection({required this.state, required this.cubit});

  final DetailState state;
  final DetailCubit cubit;

  @override
  Widget build(BuildContext context) {
    final r = context.t.reader;

    switch (state.extractStatus) {
      case ExtractStatus.none:
        return _ExtractPitch(
          pitch: r.pitch,
          buttonLabel: r.extract,
          onExtract: cubit.extract,
        );

      case ExtractStatus.extracting:
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 32),
          child: Column(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(r.extracting),
            ],
          ),
        );

      case ExtractStatus.failed:
        return _ExtractPitch(
          pitch: r.failed,
          buttonLabel: r.retry,
          onExtract: cubit.extract,
        );

      case ExtractStatus.ready:
        if (state.article == null) {
          return const Center(child: CircularProgressIndicator());
        }
        return _ArticleView(
          contentHtml: state.article!.contentHtml,
          highlights: state.highlights,
        );

      default:
        // Unreachable — ExtractStatus is a sealed enum from built_value.
        return const SizedBox.shrink();
    }
  }
}

class _ExtractPitch extends StatelessWidget {
  const _ExtractPitch({
    required this.pitch,
    required this.buttonLabel,
    required this.onExtract,
  });

  final String pitch;
  final String buttonLabel;
  final VoidCallback onExtract;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(pitch, style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 12),
        FilledButton(onPressed: onExtract, child: Text(buttonLabel)),
      ],
    );
  }
}

class _ArticleView extends StatelessWidget {
  const _ArticleView({required this.contentHtml, required this.highlights});

  final String contentHtml;
  final List<Highlight> highlights;

  /// Converts [Highlight]s to [HlAnchor]s for the inject utility.
  List<HlAnchor> _toAnchors(List<Highlight> highlights) => highlights
      .map(
        (h) => HlAnchor(
          quote: h.quote,
          prefix: h.prefix,
          suffix: h.suffix,
          color: h.color.name, // EnumClass.name == wireName string
        ),
      )
      .toList();

  /// Rewrites root-relative `<img src="/…">` with the backend origin so the
  /// image URL is absolute and reachable from the device.
  String _prefixImageSrcs(String html) {
    final config = getIt<AppConfig>();
    // Extract the origin from apiBaseUrl (scheme + host + port, no path).
    final uri = Uri.tryParse(config.apiBaseUrl);
    if (uri == null) return html;
    final origin = '${uri.scheme}://${uri.host}:${uri.port}';
    // Replace root-relative src="/..." with absolute origin-prefixed src.
    return html.replaceAllMapped(
      RegExp(r'src="(\/[^"]+)"'),
      (m) => 'src="$origin${m[1]}"',
    );
  }

  @override
  Widget build(BuildContext context) {
    final anchors = _toAnchors(highlights);
    final html = _prefixImageSrcs(injectHighlights(contentHtml, anchors));

    return Html(
      data: html,
      style: {
        // Reading body styling.
        'body': Style(
          fontFamily: 'serif',
          lineHeight: LineHeight.number(1.75),
          fontSize: FontSize(17),
        ),
        'p': Style(
          margin: Margins.symmetric(vertical: 8),
        ),
        // Highlight mark colors.
        'mark.hl-yellow': Style(
          backgroundColor: const Color(0xFFFFF176), // yellow[200]
        ),
        'mark.hl-green': Style(
          backgroundColor: const Color(0xFFA5D6A7), // green[200]
        ),
        'mark.hl-blue': Style(
          backgroundColor: const Color(0xFF90CAF9), // blue[200]
        ),
        'mark.hl-pink': Style(
          backgroundColor: const Color(0xFFF48FB1), // pink[200]
        ),
      },
    );
  }
}
