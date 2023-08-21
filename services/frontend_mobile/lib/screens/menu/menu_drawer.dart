import 'package:epictask/services/navigation/navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../bloc/authentication_bloc/authentication_bloc.dart';
import '../../bloc/authentication_bloc/authentication_event.dart';
import '../../services/constants.dart';
import '../../services/functions/firebase_functions.dart';
import '../../services/service_config/service_config.dart';
import '../../services/ui/text_styles.dart';
import '../profile/logic/logic.dart';


// Menu Drawer
class MenuDrawer extends StatelessWidget {
  const MenuDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).requestFocus(FocusNode());
      },
      child: Drawer(
          child: ListView(
        children: <Widget>[
          DrawerHeader(
              child: Stack(
            children: <Widget>[
              Align(
                child: CircleAvatar(
                  radius: SizeConfig.screenWidth / 4.0,
                  backgroundImage: const AssetImage(epicTaskLogo),
                ),
              ),
            ],
          )),
          ListTile(
            leading: const Icon(
              Icons.home,
              color: Colors.blueAccent,
            ),
            title: Text('Home', style: titleMedium(context)),
            onTap: () {
              router.pop();
            },
          ),
          ListTile(
            leading: const Icon(Icons.wallet, color: Colors.blueAccent),
            title: Text('Connect Wallet', style: titleMedium(context)),
            onTap: () async {
              bool validAddress = await checkPublicAddress(currentUserID);
              if (validAddress) {
                String xrplUrl = '$xummSignIn/$currentUserID';
                final response = await dio.get(xrplUrl);
                launchUrl(Uri.parse(response.data));
              } else {
                Future.delayed(Duration.zero, () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        title: const Text(
                          "Unable To Connect",
                        ),
                        titleTextStyle: headlineSmall(context)
                            ?.copyWith(color: Colors.black),
                        contentTextStyle:
                            titleLarge(context)?.copyWith(color: Colors.black),
                        content: const Text(
                          "Missing Public Address. Please update profile with Public Wallet Address",
                        ),
                        actions: <Widget>[
                          TextButton(
                            child: const Text('Close'),
                            onPressed: () {
                              router.pop();
                            },
                          ),
                        ],
                      );
                    },
                  );
                });
              }
            },
          ),
          ListTile(
            leading:
                const Icon(Icons.monetization_on, color: Colors.blueAccent),
            title: Text('Rewards', style: titleMedium(context)),
            onTap: () {
              // Navigate to rewards Screen
            },
          ),
          ListTile(
            leading: const Icon(Icons.person, color: Colors.blueAccent),
            title: Text('Profile', style: titleMedium(context)),
            onTap: () {
              router.pop();
              router.goNamed('profile');
            },
          ),
          ListTile(
            leading: const Icon(Icons.exit_to_app, color: Colors.blueAccent),
            title: Text('Logout', style: titleMedium(context)),
            onTap: () {
              BlocProvider.of<AuthenticationBloc>(context)
                  .add(AuthenticationLoggedOut());
            },
          ),
        ],
      )),
    );
  }
}
