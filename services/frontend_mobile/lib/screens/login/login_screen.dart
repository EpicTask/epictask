
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:responsive_framework/responsive_breakpoints.dart';

import '../../bloc/login_bloc/bloc.dart';


import '../../repositories/user_repository.dart';
import '../../services/service_config/service_config.dart';
import '../../services/ui/text_styles.dart';
import 'login_form.dart';

/// Login screen
class LoginScreen extends StatelessWidget {
  LoginScreen({super.key});

  final UserRepository _userRepository = UserRepository();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocProvider<LoginBloc>(
        create: (BuildContext context) =>
            LoginBloc(userRepository: _userRepository),
        child: Container(
          height: double.infinity,
          decoration: BoxDecoration(
              gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: <Color>[Colors.white, Colors.grey.shade900],
          )),
          child: SingleChildScrollView(
            child: Stack(
              children: <Widget>[
                CurvedWidget(
                  curvedDistance: 80,
                  curvedHeight: 80,
                  child: Center(
                    child: Container(
                      padding: EdgeInsets.only(
                          top: SizeConfig.screenHeight*.1),
                      width: double.infinity,
                      height: SizeConfig.screenHeight*.45,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: <Color>[
                            Colors.white,
                            Colors.white.withOpacity(0.4)
                          ],
                        ),
                      ),
                      child: Text(
                        'Epic Task',
                        style: headlineLarge(context)?.copyWith(color: Colors.black),
                        textScaleFactor: 1.5,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
                // CloudBackgroundImage(),
                Center(
                  child: Container(
                    margin:  EdgeInsets.only(top: SizeConfig.screenHeight*.45),
                    width: ResponsiveBreakpoints.of(context).largerOrEqualTo(TABLET) ? SizeConfig.screenWidth*.4 : null,
                    child: const LoginForm(),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}


class CurvedWidget extends StatelessWidget {
  const CurvedWidget({super.key, required this.curvedDistance, required this.curvedHeight, this.child});

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
      child: Stack(
        children: <Widget>[
          Positioned(
            left: 20,
            top: 20,
            child: CircleAvatar(
              radius: 40,
              backgroundColor: Colors.grey.withOpacity(0.5),
            ),
          ),
          Positioned(
            left: 70,
            top: 70,
            child: CircleAvatar(
              radius: 60,
              backgroundColor: Colors.grey.withOpacity(0.35),
            ),
          ),
          Positioned(
            right: 30,
            top: 50,
            child: CircleAvatar(
              radius: 50,
              backgroundColor: Colors.grey.withOpacity(0.35),
            ),
          ),
          Positioned(
            right: 10,
            bottom: 10,
            child: CircleAvatar(
              radius: 70,
              backgroundColor: Colors.grey.withOpacity(0.35),
            ),
          ),
          child ?? Container(),
        ],
      ),
    );
  }
}

class CurvedWidgetBackgroundClipper extends CustomClipper<Path> {
  CurvedWidgetBackgroundClipper({required this.curvedDistance, required this.curvedHeight});
  final double curvedDistance;
  final double curvedHeight;

  @override
  Path getClip(Size size) {
    final Path clippedPath = Path();
    clippedPath.lineTo(size.width, 0);
    clippedPath.lineTo(size.width, size.height - curvedDistance - curvedHeight);
    clippedPath.quadraticBezierTo(
        size.width, size.height - curvedHeight, size.width - curvedDistance, size.height - curvedHeight);
    clippedPath.lineTo(curvedDistance, size.height - curvedHeight);
    clippedPath.quadraticBezierTo(0, size.height - curvedHeight, 0, size.height);
    clippedPath.lineTo(0, 0);
    return clippedPath;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) {
    return false;
  }
}
