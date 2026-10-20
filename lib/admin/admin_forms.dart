import 'package:flutter/material.dart';
import 'package:miravoice/images.dart';

/// Wąska kolumna wyśrodkowana na dużych ekranach (PC).
class Narrow extends StatelessWidget {
  const Narrow({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 760),
        child: child,
      ),
    );
  }
}

Future<bool> confirmDialog(BuildContext context, String question) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      content: Text(question),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text('Anuluj'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: const Text('Tak'),
        ),
      ],
    ),
  );
  return ok ?? false;
}

// ---------------------------------------------------------------------------
// Kolory
// ---------------------------------------------------------------------------

String colorHex(Color c) =>
    '#${(c.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0').toUpperCase()}';

Color? parseHex(String input) {
  final s = input.trim().replaceAll('#', '');
  if (s.length != 6) return null;
  final v = int.tryParse('FF$s', radix: 16);
  return v == null ? null : Color(v);
}

const _swatches = <Color>[
  Color(0xFFFFFFFF),
  Color(0xFFF7FCF8),
  Color(0xFFE5E7EB),
  Color(0xFF10261A),
  Color(0xFF0A1F14),
  Color(0xFF000000),
  Color(0xFF16A34A),
  Color(0xFF22C55E),
  Color(0xFF4ADE80),
  Color(0xFF86EFAC),
  Color(0xFF0B5D2A),
  Color(0xFF14532D),
  Color(0xFF39FF14),
  Color(0xFFA3E635),
  Color(0xFFFACC15),
  Color(0xFFF97316),
  Color(0xFFEF4444),
  Color(0xFFEC4899),
  Color(0xFFA855F7),
  Color(0xFF3B82F6),
];

Future<Color?> pickColor(BuildContext context, Color initial) async {
  final controller = TextEditingController(
    text: colorHex(initial).replaceAll('#', ''),
  );
  final result = await showDialog<Color>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Wybierz kolor'),
      content: SizedBox(
        width: 320,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final c in _swatches)
                    GestureDetector(
                      onTap: () => Navigator.pop(ctx, c),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: c,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.black26),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                decoration: const InputDecoration(
                  labelText: 'Własny kod HEX (np. 16A34A)',
                  prefixText: '#',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Anuluj'),
        ),
        FilledButton(
          onPressed: () {
            final c = parseHex(controller.text);
            if (c != null) Navigator.pop(ctx, c);
          },
          child: const Text('Zastosuj'),
        ),
      ],
    ),
  );
  controller.dispose();
  return result;
}

// ---------------------------------------------------------------------------
// Pole wyboru z listy
// ---------------------------------------------------------------------------

class ChoiceBox extends StatelessWidget {
  const ChoiceBox({
    super.key,
    required this.label,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  final String label;
  final String value;
  final Map<String, String> options;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return InputDecorator(
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: options.containsKey(value) ? value : null,
          items: [
            for (final e in options.entries)
              DropdownMenuItem<String>(value: e.key, child: Text(e.value)),
          ],
          onChanged: (v) {
            if (v != null) onChanged(v);
          },
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Uniwersalny formularz: lista pól -> mapa wartości
// ---------------------------------------------------------------------------

enum FieldKind { text, multiline, url, image, choice }

class FieldSpec {
  const FieldSpec(
    this.key,
    this.label, {
    this.kind = FieldKind.text,
    this.options = const {},
    this.required = false,
  });

  final String key;
  final String label;
  final FieldKind kind;
  final Map<String, String> options;
  final bool required;
}

class FieldsForm extends StatefulWidget {
  const FieldsForm({
    super.key,
    required this.specs,
    required this.initial,
    required this.onSubmit,
    this.submitLabel = 'Zapisz',
  });

  final List<FieldSpec> specs;
  final Map<String, String> initial;
  final void Function(Map<String, String> values) onSubmit;
  final String submitLabel;

  @override
  State<FieldsForm> createState() => _FieldsFormState();
}

class _FieldsFormState extends State<FieldsForm> {
  final _formKey = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _controllers;
  late final Map<String, String> _values;

  bool _isText(FieldKind k) =>
      k == FieldKind.text || k == FieldKind.multiline || k == FieldKind.url;

  @override
  void initState() {
    super.initState();
    _values = Map<String, String>.of(widget.initial);
    _controllers = {
      for (final s in widget.specs)
        if (_isText(s.kind))
          s.key: TextEditingController(text: widget.initial[s.key] ?? ''),
    };
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final out = Map<String, String>.of(_values);
    for (final e in _controllers.entries) {
      out[e.key] = e.value.text.trim();
    }
    widget.onSubmit(out);
  }

  Widget _field(FieldSpec s) {
    switch (s.kind) {
      case FieldKind.image:
        return ImageField(
          label: s.label,
          value: _values[s.key] ?? '',
          onChanged: (v) => setState(() => _values[s.key] = v),
        );
      case FieldKind.choice:
        return ChoiceBox(
          label: s.label,
          value: _values[s.key] ?? '',
          options: s.options,
          onChanged: (v) => setState(() => _values[s.key] = v),
        );
      case FieldKind.text:
      case FieldKind.multiline:
      case FieldKind.url:
        final multiline = s.kind == FieldKind.multiline;
        return TextFormField(
          controller: _controllers[s.key],
          minLines: multiline ? 4 : 1,
          maxLines: multiline ? 12 : 1,
          keyboardType: s.kind == FieldKind.url
              ? TextInputType.url
              : (multiline ? TextInputType.multiline : TextInputType.text),
          decoration: InputDecoration(
            labelText: s.label,
            alignLabelWithHint: true,
            border: const OutlineInputBorder(),
          ),
          validator: s.required
              ? (v) => (v == null || v.trim().isEmpty) ? 'Pole wymagane' : null
              : null,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final s in widget.specs) ...[
            _field(s),
            const SizedBox(height: 16),
          ],
          FilledButton.icon(
            onPressed: _submit,
            icon: const Icon(Icons.save),
            label: Text(widget.submitLabel),
          ),
        ],
      ),
    );
  }
}

/// Otwiera formularz na osobnym ekranie. Zwraca wartości albo null (anulowano).
Future<Map<String, String>?> openEditor(
  BuildContext context, {
  required String title,
  required List<FieldSpec> specs,
  Map<String, String> initial = const {},
}) {
  return Navigator.of(context).push<Map<String, String>>(
    MaterialPageRoute(
      builder: (ctx) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: Narrow(
          child: FieldsForm(
            specs: specs,
            initial: initial,
            onSubmit: (values) => Navigator.of(ctx).pop(values),
          ),
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Lista z dodawaniem / edycją / usuwaniem / zmianą kolejności
// ---------------------------------------------------------------------------

class CrudTab<T> extends StatelessWidget {
  const CrudTab({
    super.key,
    required this.items,
    required this.idOf,
    required this.title,
    required this.onAdd,
    required this.onEdit,
    required this.onDelete,
    required this.onReorder,
    this.subtitle,
    this.image,
    this.addLabel = 'Dodaj',
  });

  final List<T> items;
  final String Function(T) idOf;
  final String Function(T) title;
  final String Function(T)? subtitle;
  final String Function(T)? image;
  final VoidCallback onAdd;
  final void Function(T) onEdit;
  final void Function(T) onDelete;
  final void Function(int oldIndex, int newIndex) onReorder;
  final String addLabel;

  @override
  Widget build(BuildContext context) {
    return Narrow(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: FilledButton.icon(
                onPressed: onAdd,
                icon: const Icon(Icons.add),
                label: Text(addLabel),
              ),
            ),
          ),
          Expanded(
            child: items.isEmpty
                ? const Center(child: Text('Pusto. Dodaj pierwszy element.'))
                : ReorderableListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    buildDefaultDragHandles: false,
                    itemCount: items.length,
                    onReorder: onReorder,
                    itemBuilder: (context, i) {
                      final item = items[i];
                      final sub = subtitle?.call(item) ?? '';
                      final img = image;
                      return Card(
                        key: ValueKey(idOf(item)),
                        child: ListTile(
                          onTap: () => onEdit(item),
                          leading: img == null
                              ? null
                              : SizedBox(
                                  width: 56,
                                  height: 56,
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: AppImage(img(item)),
                                  ),
                                ),
                          title: Text(
                            title(item),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: sub.isEmpty
                              ? null
                              : Text(
                                  sub,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                tooltip: 'Edytuj',
                                icon: const Icon(Icons.edit_outlined),
                                onPressed: () => onEdit(item),
                              ),
                              IconButton(
                                tooltip: 'Usuń',
                                icon: const Icon(Icons.delete_outline),
                                onPressed: () async {
                                  final ok = await confirmDialog(
                                    context,
                                    'Usunąć „${title(item)}”?',
                                  );
                                  if (ok) onDelete(item);
                                },
                              ),
                              ReorderableDragStartListener(
                                index: i,
                                child: const Padding(
                                  padding: EdgeInsets.all(8),
                                  child: Icon(Icons.drag_handle),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
