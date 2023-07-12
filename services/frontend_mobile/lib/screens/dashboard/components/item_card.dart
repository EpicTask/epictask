import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';

Widget itemCard(String value, String title, BuildContext context) {
  return Expanded(
    child: Card(
      color: Colors.blueAccent,
      elevation: 10,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
        Text(value,style: headlineMedium(context),),
        Text(title,style: titleMedium(context),textAlign: TextAlign.center,)
      ]),
    ),
  );
}
