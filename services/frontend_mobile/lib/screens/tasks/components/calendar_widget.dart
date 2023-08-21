import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../services/ui/text_styles.dart';

class CalendarWidget extends StatefulWidget {
  const CalendarWidget({
    Key? key,
    required this.expiratationDate,
    this.context,
  }) : super(key: key);

  final ValueNotifier<DateTime> expiratationDate;
  final BuildContext? context;

  @override
  State<CalendarWidget> createState() => _CalendarWidgetState();
}

class _CalendarWidgetState extends State<CalendarWidget> {
  DateTime _datePicked = DateTime.now();

  String get labelTextDate {
    widget.expiratationDate.value = _datePicked;
    return DateFormat.yMMMd().format(_datePicked);
  }

  Future<void> showDatePickerDepart() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _datePicked,
      firstDate: DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day),
      lastDate: DateTime(2050),
    );
    if (picked != null && picked != _datePicked) {
      setState(() {
        _datePicked = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: <Widget>[
              const Icon(
                Icons.calendar_today,
              ),
              const SizedBox(
                width: 8,
              ),
              Text(
                labelTextDate,
                style: titleLarge(context),
              ),
            ],
          ),
        ),
//                                SizedBox(height: 16),
        ButtonTheme(
          minWidth: 150,
          child: IconButton(
            icon: const Icon(
              Icons.edit,
            ),
            onPressed: () async {
              showDatePickerDepart();
            },
          ),
        ),
      ],
    );
  }
}
