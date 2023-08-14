import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:responsive_framework/responsive_breakpoints.dart';


import '../../bloc/signup_bloc/signup_bloc.dart';
import '../../repositories/user_repository.dart';
import '../../services/service_config/service_config.dart';
import '../login/components/curved_widget.dart';
import 'signup_form.dart';

class SignupScreen extends StatelessWidget {

  const SignupScreen({Key? key, UserRepository? userRepository})
      : _userRepository = userRepository,
        super(key: key);
  final UserRepository? _userRepository;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(
          color: Color(0xff6a515e),
        ),
      ),
      body: BlocProvider<SignupBloc>(
        create: (BuildContext context) => SignupBloc(userRepository: _userRepository),
        child: Container(
          height: SizeConfig.screenHeight,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: <Color>[Colors.white, Colors.grey.shade900],
            ),
          ),
          child: SingleChildScrollView(
            child: Stack(
              children: <Widget>[
                CurvedWidget(
                  child: Container(
                    padding: const EdgeInsets.only(top: 100, left: 50),
                    width: double.infinity,
                    height: 300,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: <Color>[Colors.white, Colors.white.withOpacity(0.4)],
                        // colors: [canvasColor, Colors.blueAccent.shade100],
                      ),
                    ),
                    child: const Text(
                      'Signup',
                      style: TextStyle(
                        fontSize: 40,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                ),
                 Center(
                  child: Container(
                    margin:  EdgeInsets.only(top: SizeConfig.screenHeight*.45),
                    width: ResponsiveBreakpoints.of(context).largerOrEqualTo(TABLET) ? SizeConfig.screenWidth*.4 : null,
                    child: const SignupForm(),
                ))
              ],
            ),
          ),
        ),
      ),
    );
  }
}