import 'package:flutter/material.dart';
import 'package:responsive_framework/responsive_framework.dart';


///Responsive wrapper
Widget responsiveWrapperBuilder(BuildContext context, Widget widget){
  return ResponsiveBreakpoints.builder(
    child: widget,
    breakpoints: <Breakpoint>[
      const Breakpoint(start: 0,end: 450, name: MOBILE),
      const Breakpoint(start:451,end: 900, name: TABLET),
      const Breakpoint(start:901,end: double.infinity, name: DESKTOP),
    ],
  );
}
