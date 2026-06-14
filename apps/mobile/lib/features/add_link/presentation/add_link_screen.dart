import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app_mobile/features/add_link/presentation/bloc/add_link_cubit.dart';
import 'package:app_mobile/features/add_link/presentation/bloc/add_link_state.dart';
import 'package:app_mobile/i18n/strings.g.dart';
import 'package:app_mobile/shared/di/injector.dart';

class AddLinkScreen extends StatelessWidget {
  const AddLinkScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<AddLinkCubit>(
      create: (_) => getIt<AddLinkCubit>(),
      child: const _AddLinkView(),
    );
  }
}

class _AddLinkView extends StatefulWidget {
  const _AddLinkView();

  @override
  State<_AddLinkView> createState() => _AddLinkViewState();
}

class _AddLinkViewState extends State<_AddLinkView> {
  final _urlController = TextEditingController();
  bool _looksLikeUrl = false;

  static final _urlRegex = RegExp(r'^https?://.+', caseSensitive: false);

  @override
  void initState() {
    super.initState();
    _urlController.addListener(_onTextChanged);
  }

  void _onTextChanged() {
    final looks = _urlRegex.hasMatch(_urlController.text.trim());
    if (looks != _looksLikeUrl) setState(() => _looksLikeUrl = looks);
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  void _submit(BuildContext context) {
    final url = _urlController.text.trim();
    if (url.isEmpty) return;
    context.read<AddLinkCubit>().save(url);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.addLink;

    return BlocListener<AddLinkCubit, AddLinkState>(
      listenWhen: (prev, curr) => curr.status == AddLinkStatus.saved,
      listener: (context, _) => Navigator.pop(context),
      child: BlocBuilder<AddLinkCubit, AddLinkState>(
        builder: (context, state) {
          final isSaving = state.status == AddLinkStatus.saving;
          final hasError = state.status == AddLinkStatus.error;
          final canSubmit = _looksLikeUrl && !isSaving;

          return Scaffold(
            appBar: AppBar(
              title: Text(t.title),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(t.cancel),
                ),
              ],
            ),
            body: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (hasError)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Material(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          child: Text(
                            t.errorGeneric,
                            style: TextStyle(
                              color: Theme.of(
                                context,
                              ).colorScheme.onErrorContainer,
                            ),
                          ),
                        ),
                      ),
                    ),
                  TextField(
                    controller: _urlController,
                    keyboardType: TextInputType.url,
                    textInputAction: TextInputAction.done,
                    autofocus: true,
                    enabled: !isSaving,
                    decoration: InputDecoration(
                      labelText: t.urlLabel,
                      hintText: t.placeholder,
                    ),
                    onSubmitted: (_) {
                      if (canSubmit) _submit(context);
                    },
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: canSubmit ? () => _submit(context) : null,
                    child: isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(t.save),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
