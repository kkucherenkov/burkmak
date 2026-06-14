import 'dart:async';

import 'package:flutter/material.dart';

import 'package:app_mobile/features/library/presentation/bloc/library_state.dart';
import 'package:app_mobile/i18n/strings.g.dart';

class FilterBar extends StatefulWidget {
  const FilterBar({
    super.key,
    required this.segment,
    required this.query,
    required this.tag,
    required this.onSegment,
    required this.onQuery,
    required this.onTag,
  });

  final LibrarySegment segment;
  final String query;
  final String? tag;
  final ValueChanged<LibrarySegment> onSegment;
  final ValueChanged<String> onQuery;
  final ValueChanged<String?> onTag;

  @override
  State<FilterBar> createState() => _FilterBarState();
}

class _FilterBarState extends State<FilterBar> {
  late final TextEditingController _searchController;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.query);
  }

  @override
  void didUpdateWidget(FilterBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Sync controller only when external state changes (e.g. cleared by cubit).
    if (widget.query != oldWidget.query &&
        widget.query != _searchController.text) {
      _searchController.text = widget.query;
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      widget.onQuery(value);
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.library;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Segment chips row
        SizedBox(
          height: 48,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            children: LibrarySegment.values.map((seg) {
              final label = switch (seg) {
                LibrarySegment.unread => t.seg.unread,
                LibrarySegment.read => t.seg.read,
                LibrarySegment.archived => t.seg.archived,
                LibrarySegment.favorite => t.seg.favorite,
              };
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(label),
                  selected: widget.segment == seg,
                  onSelected: (_) => widget.onSegment(seg),
                ),
              );
            }).toList(),
          ),
        ),
        // Search field
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
          child: TextField(
            controller: _searchController,
            onChanged: _onSearchChanged,
            decoration: InputDecoration(
              hintText: t.search,
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        widget.onQuery('');
                      },
                    )
                  : null,
              isDense: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
