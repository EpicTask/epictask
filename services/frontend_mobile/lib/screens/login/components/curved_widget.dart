import 'package:flutter/material.dart';

// UI Widget for Login Screen background
class CurvedWidget extends StatelessWidget {
  const CurvedWidget(
      {super.key,
      this.curvedDistance = 80,
      this.curvedHeight = 80,
      this.child});
  final Widget? child;
  final double curvedDistance;
  final double curvedHeight;

  @override
  Widget build(BuildContext context) {
    return ClipPath(
      clipper: CurvedWidgetBackgroundClipper(
        curvedDistance: curvedDistance,
        curvedHeight: curvedHeight,
      ),
      child: child,
    );
  }
}

class CurvedWidgetBackgroundClipper extends CustomClipper<Path> {
  CurvedWidgetBackgroundClipper(
      {required this.curvedDistance, required this.curvedHeight});
  final double curvedDistance;
  final double curvedHeight;

  @override
  Path getClip(Size size) {
    final Path clippedPath = Path();
    clippedPath.lineTo(size.width, 0);
    clippedPath.lineTo(size.width, size.height - curvedDistance - curvedHeight);
    clippedPath.quadraticBezierTo(size.width, size.height - curvedHeight,
        size.width - curvedDistance, size.height - curvedHeight);
    clippedPath.lineTo(curvedDistance, size.height - curvedHeight);
    clippedPath.quadraticBezierTo(
        0, size.height - curvedHeight, 0, size.height);
    clippedPath.lineTo(0, 0);
    return clippedPath;
  }

  @override
  bool shouldReclip(CustomClipper<dynamic> oldClipper) {
    return false;
  }
}
