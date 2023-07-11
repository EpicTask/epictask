import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';


ThemeData themeDataBuilderDark() {
  return ThemeData(
    primaryColor: const Color(0xFF121212),
    canvasColor: const Color(0xFF212121),
    scaffoldBackgroundColor: Colors.black,
    appBarTheme: const AppBarTheme(backgroundColor: Colors.black,iconTheme: IconThemeData(color: Colors.grey)),
    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle(
            shape: MaterialStateProperty.all(RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),)))),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: ButtonStyle(
            shape: MaterialStateProperty.all(RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),)))),
    disabledColor: Colors.grey,
    iconButtonTheme:  IconButtonThemeData(style:ButtonStyle(iconColor: MaterialStateProperty.all(Colors.blueAccent))),
    iconTheme: const IconThemeData(color: Colors.grey),
    textTheme: GoogleFonts.openSansTextTheme( TextTheme(
      displayLarge: TextStyle(color: Colors.grey.shade300),
      displayMedium: TextStyle(color: Colors.grey.shade300),
      displaySmall: TextStyle(
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade300,
          fontStyle: FontStyle.italic),
      headlineLarge: TextStyle(color: Colors.grey.shade300),
      headlineMedium: TextStyle(
        fontWeight: FontWeight.bold,
        color: Colors.grey.shade300,
      ),
      headlineSmall: TextStyle(color: Colors.grey.shade300),
      titleLarge: TextStyle(color: Colors.grey.shade300),
      titleMedium: TextStyle(color: Colors.grey.shade300),
      titleSmall: TextStyle(
          fontWeight: FontWeight.w600,
          fontStyle: FontStyle.italic,
          fontSize: 14,
          color: Colors.grey.shade300),
    )),
  );
}
