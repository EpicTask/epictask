import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../bloc/authentication_bloc/authentication_bloc.dart';
import '../../bloc/authentication_bloc/authentication_event.dart';
import '../../bloc/signup_bloc/signup_bloc.dart';
import '../../bloc/signup_bloc/signup_event.dart';
import '../../bloc/signup_bloc/signup_state.dart';
import '../../repositories/user_repository.dart';
import '../../services/service_config/service_config.dart';
import '../../services/ui/text_styles.dart';
import '../login/components/gradient_button.dart';


class SignupForm extends StatefulWidget {
  const SignupForm({Key? key}) : super(key: key);

  @override
  State<SignupForm> createState() => _SignupFormState();
}

class _SignupFormState extends State<SignupForm> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _displayNameController = TextEditingController();
  late SignupBloc _signupBloc;

  bool isButtonEnabled(SignupState state) =>
      state.isFormValid! && isPopulated && !state.isSubmitting;

  bool get isPopulated =>
      _emailController.text.isNotEmpty && _passwordController.text.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _signupBloc = BlocProvider.of<SignupBloc>(context);
    _emailController.addListener(_onEmailChange);
    _passwordController.addListener(_onPasswordChange);
    _displayNameController.addListener(_onDisplayNameChange);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _displayNameController.dispose();
    _signupBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<SignupBloc, SignupState>(
      listener: (BuildContext context, SignupState state) {
        if (state.isFailure) {
          showSnack(context, 'Signup Failure', Icons.error);
        }

        if (state.isSubmitting) {
          showSnack(context, 'Registering...', null, progressIndicator: true);
        }

        if (state.isSuccess) {
          BlocProvider.of<AuthenticationBloc>(context).add(
            AuthenticationLoggedIn(),
          );
          Navigator.pop(context);
        }
      },
      child: BlocBuilder<SignupBloc, SignupState>(
        builder: (BuildContext context, SignupState state) {
          return Padding(
            padding: const EdgeInsets.all(20.0),
            child: Form(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  buildTextFormField(
                    controller: _emailController,
                    icon: Icons.email,
                    labelText: 'Email',
                    keyboardType: TextInputType.emailAddress,
                    state: state,
                    isValidated: state.isEmailValid,
                  ),
                  buildTextFormField(
                    controller: _passwordController,
                    icon: Icons.lock,
                    labelText: 'Password',
                    obscureText: true,
                    state: state,
                    isValidated: state.isEmailValid,
                  ),
                   buildTextFormField(
                    controller: _displayNameController,
                    icon: Icons.person,
                    labelText: 'Display Name',
                    state: state,
                    isValidated: false,
                  ),
                  SizedBox(
                    height: SizeConfig.screenHeight * .05,
                  ),
                  // buildSignInButtons(context, state),
                  // buildAgreementSection(context),
                  const SizedBox(height: 30),
                  GradientButton(
                    width: 150,
                    height: 45,
                    onPressed: () {
                      if (isButtonEnabled(state)) {
                        _onFormSubmitted();
                      }
                    },
                    text: Text(
                      'Sign up!',
                      style: titleMedium(context),
                    ),
                    icon: const Icon(Icons.check, color: Colors.black),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  TextFormField buildTextFormField({
    required TextEditingController controller,
    required IconData icon,
    required String labelText,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    required SignupState state,
    required bool isValidated,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        icon: Icon(icon),
        labelText: labelText,
      ),
      keyboardType: keyboardType,
      obscureText: obscureText,
      autocorrect: false,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: (_) {
        if (labelText == 'Password') {
          return !state.isPasswordValid
              ? 'Invalid Password'
              : null;
        } else {
          return !state.isEmailValid
              ? 'Invalid Email'
              : null;
        }
      },
    );
  }

  Widget buildSignInButtons(BuildContext context, SignupState state) {
    return IntrinsicWidth(
      child: Column(
        children: <Widget>[
          buildGoogleSignupButton(context, state),
          const SizedBox(height: 30),
          buildAppleSignupButton(context, state),
        ],
      ),
    );
  }

  Widget buildAppleSignupButton(BuildContext context, SignupState state) {
    if (UserRepository().appleSignInAvailable) {
      return SignInWithAppleButton(onPressed: () {
        if (isAppleSignupButtonEnabled(state)) {
          _onPressedAppleSignIn();
        }
      });
    } else {
      return const SizedBox.shrink();
    }
  }

  Widget buildGoogleSignupButton(BuildContext context, SignupState state) {
    return ElevatedButton(
      onPressed: () {
        if (isGoogleSignupButtonEnabled(state)) {
          _onPressedGoogleSignIn();
        }
      },
      style: ElevatedButtonTheme.of(context).style,
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 15),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            // const Image(
            //   image: AssetImage(google_logo),
            //   height: 20.0,
            // ),
            // Text(
            //   signInWithGoogle,
            //   style: titleMedium(context),
            // ),
          ],
        ),
      ),
    );
  }

  void _onEmailChange() {
    _signupBloc.add(SignupEmailChanged(email: _emailController.text));
  }

  void _onPasswordChange() {
    _signupBloc.add(SignupPasswordChanged(password: _passwordController.text));
  }

  void _onDisplayNameChange() {
    _signupBloc.add(SignupDisplayNameChanged(displayName: _displayNameController.text));
  }

  void _onPressedAppleSignIn() {
    _signupBloc.add(SignupWithApplePressed());
  }

  void _onPressedGoogleSignIn() {
    _signupBloc.add(SignupWithGooglePressed());
  }

  void _onFormSubmitted() {
    _signupBloc.add(SignupSubmitted(
      email: _emailController.text,
      password: _passwordController.text,
      displayName: _displayNameController.text
    ));
  }

  void showSnack(BuildContext context, String content, IconData? icon,
      {bool progressIndicator = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text(content),
            if (progressIndicator)
              const CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white))
            else
              Icon(icon),
          ],
        ),
        backgroundColor: Colors.blueGrey[200],
      ),
    );
  }

  Widget buildAgreementSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
      // child: Column(
      //   mainAxisSize: MainAxisSize.min,
      //   mainAxisAlignment: MainAxisAlignment.center,
      //   children: <Widget>[
      //     Text(
      //       agreementMessage,
      //       style: titleMedium(context),
      //       textAlign: TextAlign.center,
      //     ),
      //     TextButton(
      //       onPressed: () {
      //         TCFunctions().launchURL(urlToTerms);
      //       },
      //       child: Text(AppLocalizations.of(context)!.terms_of_service,
      //           style: const TextStyle(
      //               fontFamily: 'Cantata One',
      //               fontWeight: FontWeight.bold,
      //               fontSize: 18)),
      //     ),
      //     TextButton(
      //       onPressed: () {
      //         TCFunctions().launchURL(urlToPrivacyPolicy);
      //       },
      //       child: Text(AppLocalizations.of(context)!.privacy_policy,
      //           style: const TextStyle(
      //               fontFamily: 'Cantata One',
      //               fontWeight: FontWeight.bold,
      //               fontSize: 18)),
      //     )
      //   ],
      // ),
    );
  }

  bool isAppleSignupButtonEnabled(SignupState state) =>
      !_signupBloc.state.isSubmitting;

  bool isGoogleSignupButtonEnabled(SignupState state) =>
      !_signupBloc.state.isSubmitting;
}
