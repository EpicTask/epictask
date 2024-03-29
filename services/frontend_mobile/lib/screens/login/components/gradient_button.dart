import 'package:flutter/material.dart';

// UI Widget for Login Screen Buttons
class GradientButton extends StatelessWidget {
  const GradientButton(
      {super.key,
      this.width,
      this.height,
      this.onPressed,
      this.text,
      this.icon});
  final double? width;
  final double? height;
  final Function()? onPressed;
  final Text? text;
  final Icon? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(80),
        gradient: const LinearGradient(
          colors: <Color>[
            Colors.blueAccent,
            Colors.white,
          ],
          // colors: [Colors.greenAccent, Color(0xff8f93ea)],
        ),
      ),
      child: MaterialButton(
          onPressed: onPressed,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          shape: const StadiumBorder(),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                text!,
                icon!,
              ],
            ),
          )),
    );
  }
}
