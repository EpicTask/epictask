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
  _LoginFormState createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
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

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text(message),
            const Icon(Icons.error),
          ],
        ),
        backgroundColor: Colors.blueGrey[200],
      ),
    );
  }

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
      controller: _emailController,
      decoration: const InputDecoration(
        icon: Icon(Icons.email),
        labelText: 'email',
      ),
      keyboardType: TextInputType.emailAddress,
      autocorrect: false,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: (_) {
        return state.isEmailValid
            ? null
            :'Invalid email!';
      },
      autofocus: true,
    );
  }

  Widget buildPasswordFormField(BuildContext context, LoginState state) {
    return TextFormField(
      key: const Key('password'),
      controller: _passwordController,
      decoration: const InputDecoration(
        icon: Icon(Icons.lock),
        labelText: 'Password',
      ),
      obscureText: true,
      autocorrect: false,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: (_) {
        return state.isPasswordValid
            ? null
            : 'Invalid Password!';
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<LoginBloc, LoginState>(
      listener: (BuildContext context, LoginState state) {
        _handleAuthenticationState(state);
      },
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          child: BlocBuilder<LoginBloc, LoginState>(
            bloc: _loginBloc,
            builder: (BuildContext context, LoginState state) {
              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  buildEmailFormField(context, state),
                  buildPasswordFormField(context, state),
                  const SizedBox(height: 25),
                  buildLoginButton(context, state),
                  buildForgotPasswordButton(context),
                  const SizedBox(height: 15),
                  buildSignInButtons(context, state),
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
          const SizedBox(height:30),
          buildAppleLoginButton(context, state),
        ],
      ),
    );
  }

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
      // style: ElevatedButtonTheme.of(context).style!.copyWith(
      //       backgroundColor: MaterialStateProperty.all(canvasColor),
      //     ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 15),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            const Image(
              image: AssetImage(google_logo),
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
    return GradientButton(
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
    );
  }

  Widget buildForgotPasswordButton(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 8, 8.0, 16),
        child: TextButton(
          child: const Text('Forgot Password'),
          onPressed: () {
  
          },
        ),
      ),
    );
  }

  // Widget buildSignUpLink(BuildContext context) {
  //   return Align(
  //     alignment: Alignment.bottomCenter,
  //     child: Padding(
  //       padding: const EdgeInsets.all(8.0),
  //       child: Row(
  //         children: <Widget>[
  //           Text(AppLocalizations.of(context)!.dont_have_an_account),
  //           TextButton(
  //             child: Text(AppLocalizations.of(context)!.sign_up),
  //             onPressed: () {
  //               navigationService.navigateTo(SignUpScreenRoute);
  //             },
  //           ),
  //         ],
  //       ),
  //     ),
  //   );
  // }
}
