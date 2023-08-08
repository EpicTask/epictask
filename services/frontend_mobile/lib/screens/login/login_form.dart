import 'package:epictask/services/navigation/navigation.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../bloc/authentication_bloc/authentication_bloc.dart';
import '../../bloc/authentication_bloc/authentication_event.dart';
import '../../bloc/login_bloc/bloc.dart';
import '../../bloc/login_bloc/event.dart';
import '../../bloc/login_bloc/state.dart';
import '../../repositories/user_repository.dart';

import '../../services/constants.dart';
import '../../services/ui/text_styles.dart';
import 'components/gradient_button.dart';

/// Form for login screen
class LoginForm extends StatefulWidget {
  const LoginForm({Key? key}) : super(key: key);

  @override
  LoginFormState createState() => LoginFormState();
}

class LoginFormState extends State<LoginForm> {
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  late LoginBloc _loginBloc;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _loginBloc = BlocProvider.of<LoginBloc>(context);
    _emailController.addListener(_onEmailChange);
    _passwordController.addListener(_onPasswordChange);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool get isPopulated =>
      _emailController.text.isNotEmpty && _passwordController.text.isNotEmpty;

  bool get isEmailPopulated => _emailController.text.isNotEmpty;

  bool get isPasswordPopulated => _passwordController.text.isNotEmpty;

  bool isLoginWithEmailAndPasswordButtonEnabled(LoginState state) {
    return state.isFormValid && isPopulated && !state.isSubmitting;
  }

  bool isAppleLoginButtonEnabled(LoginState state) {
    return !state.isSubmitting;
  }

  bool isGoogleLoginButtonEnabled(LoginState state) {
    return !state.isSubmitting;
  }

  void _onEmailChange() {
    if (isEmailPopulated) {
      _loginBloc.add(LoginEmailChange(email: _emailController.text));
    }
  }

  void _onPasswordChange() {
    if (isPasswordPopulated) {
      _loginBloc.add(LoginPasswordChanged(password: _passwordController.text));
    }
  }

  void _onFormSubmitted() {
    _loginBloc.add(LoginWithCredentialsPressed(
        email: _emailController.text, password: _passwordController.text));
  }

  void _onPressedAppleSignIn() {
    _loginBloc.add(LoginWithApplePressed());
  }

  void _onPressedGoogleSignIn() {
    _loginBloc.add(LoginWithGooglePressed());
  }

  // void _onPressedAnonymousSignIn() {
  //   _loginBloc.add(LoginAnonymousPressed());
  // }

  // void _showSnackBar(BuildContext context, String message) {
  //   ScaffoldMessenger.of(context).showSnackBar(
  //     SnackBar(
  //       content: Row(
  //         mainAxisAlignment: MainAxisAlignment.spaceBetween,
  //         children: <Widget>[
  //           Text(message),
  //           const Icon(Icons.error),
  //         ],
  //       ),
  //       backgroundColor: Colors.blueGrey[200],
  //     ),
  //   );
  // }

  void _showLoggingInSnackBar(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text('Logging in'),
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            )
          ],
        ),
        backgroundColor: Colors.blueGrey[200],
      ),
    );
  }

  void _showLoginFailedSnackBar(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text('Login failed!'),
            Icon(Icons.error),
          ],
        ),
        backgroundColor: Color(0xffffae88),
      ),
    );
  }

  void _handleAuthenticationState(LoginState state) {
    if (state.isFailure) {
      _showLoginFailedSnackBar(context);
    } else if (state.isSubmitting) {
      _showLoggingInSnackBar(context);
    } else if (state.isSuccess) {
      BlocProvider.of<AuthenticationBloc>(context).add(
        AuthenticationLoggedIn(),
      );
    }
  }

  Widget buildEmailFormField(BuildContext context, LoginState state) {
    return TextFormField(
      key: const Key('email'),
      style: titleLarge(context)?.copyWith(color: Colors.black),
      controller: _emailController,
      decoration: InputDecoration(
        icon: const Icon(Icons.email),
        labelText: 'Email',
        labelStyle: titleLarge(context)?.copyWith(color: Colors.black),
      ),
      keyboardType: TextInputType.emailAddress,
      autocorrect: false,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: (_) {
        return state.isEmailValid ? null : 'Invalid email!';
      },
      autofocus: true,
    );
  }

  Widget buildPasswordFormField(BuildContext context, LoginState state) {
    return TextFormField(
      key: const Key('password'),
      style: titleLarge(context)?.copyWith(color: Colors.black),
      controller: _passwordController,
      decoration: InputDecoration(
        icon: const Icon(Icons.lock),
        labelText: 'Password',
        labelStyle: titleLarge(context)?.copyWith(color: Colors.black),
      ),
      obscureText: true,
      autocorrect: false,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: (_) {
        return state.isPasswordValid ? null : 'Invalid Password!';
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<LoginBloc, LoginState>(
      listener: (context, state) {
        _handleAuthenticationState(state);
      },
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          child: BlocBuilder<LoginBloc, LoginState>(
            bloc: _loginBloc,
            builder: (context, state) {
              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  buildEmailFormField(context, state),
                  buildPasswordFormField(context, state),
                  const SizedBox(height: 25),
                  buildLoginButton(context, state),
                  const SizedBox(height: 15),
                  buildForgotPasswordButton(context),
                  const SizedBox(height: 15),
                  if (!kIsWeb) buildSignInButtons(context, state),
                  // buildAnonymousLoginButton(context, state),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget buildSignInButtons(BuildContext context, LoginState state) {
    return IntrinsicWidth(
      child: Column(
        children: <Widget>[
          buildGoogleLoginButton(context, state),
          const SizedBox(height: 30),
          buildAppleLoginButton(context, state),
        ],
      ),
    );
  }

  // Widget buildAnonymousLoginButton(context, state) {
  //   return Align(
  //     alignment: Alignment.bottomCenter,
  //     child: Padding(
  //       padding: const EdgeInsets.fromLTRB(8, 8, 8.0, 16),
  //       child: TextButton(
  //         child: Text(
  //           'Sign up as guest.',
  //           style: titleLarge(context)
  //               ?.copyWith(color: Colors.blue, fontStyle: FontStyle.italic),
  //         ),
  //         onPressed: () {
  //           _onPressedAnonymousSignIn();
  //         },
  //       ),
  //     ),
  //   );
  // }

  Widget buildAppleLoginButton(BuildContext context, LoginState state) {
    if (UserRepository().appleSignInAvailable) {
      return SignInWithAppleButton(onPressed: () {
        if (isAppleLoginButtonEnabled(state)) {
          _onPressedAppleSignIn();
        }
      });
    } else {
      return const SizedBox.shrink();
    }
  }

  Widget buildGoogleLoginButton(BuildContext context, LoginState state) {
    return ElevatedButton(
      onPressed: () {
        if (isGoogleLoginButtonEnabled(state)) {
          _onPressedGoogleSignIn();
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 15),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            const Image(
              image: AssetImage(googleLogo),
              height: 20.0,
            ),
            Text(
              signInWithGoogle,
              style: titleMedium(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildLoginButton(BuildContext context, LoginState state) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GradientButton(
          width: 150,
          height: 45,
          onPressed: () {
            if (isLoginWithEmailAndPasswordButtonEnabled(state)) {
              _onFormSubmitted();
            }
          },
          text: Text(
            'Login',
            style: titleMedium(context),
          ),
          icon: const Icon(
            Icons.check,
            color: Colors.black,
          ),
        ),
        GradientButton(
          width: 150,
          height: 45,
          text: Text(
            'Sign up.',
            style: titleMedium(context),
          ),
          onPressed: () {
            router.goNamed('signup');
          },
          icon: const Icon(
            Icons.arrow_forward,
            color: Colors.black,
          ),
        ),
      ],
    );
  }

  Widget buildForgotPasswordButton(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 8, 8.0, 16),
        child: TextButton(
          child: const Text('Forgot Password'),
          onPressed: () {},
        ),
      ),
    );
  }
}
