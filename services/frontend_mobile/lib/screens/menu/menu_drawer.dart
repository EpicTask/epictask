import 'package:epictask/services/navigation/navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../bloc/authentication_bloc/authentication_bloc.dart';
import '../../bloc/authentication_bloc/authentication_event.dart';
import '../../services/functions/firebase_functions.dart';
import '../../services/service_config/service_config.dart';
import '../../services/ui/text_styles.dart';

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
                  backgroundImage: const NetworkImage(''),
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
              // navigationService.navigateTo(UsersRoute);
            },
          ),
          ListTile(
            leading: const Icon(Icons.wallet, color: Colors.blueAccent),
            title: Text('Connect Wallet', style: titleMedium(context)),
            onTap: () async {
              String xrplUrl =
                  'https://xrpl-5wpxgn35iq-uc.a.run.app/xummSignInRequest/$currentUserID';
              final response = await dio.get(xrplUrl);
              launchUrl(Uri.parse(response.data));
            },
          ),
          ListTile(
            leading:
                const Icon(Icons.monetization_on, color: Colors.blueAccent),
            title: Text('Rewards', style: titleMedium(context)),
            onTap: () {
              // navigationService.navigateTo(SettingsRoute);
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
          // Align(
          //   alignment: Alignment.bottomCenter,
          //   child: currentVersion(context),
          // )
        ],
      )),
    );
  }

  // Widget currentVersion(BuildContext context) {
  //   return FutureBuilder<String>(
  //     future: DatabaseService().getVersion(),
  //     builder: (BuildContext context, AsyncSnapshot<String> data) {
  //       if (data.hasData) {
  //         final String version = data.data!;
  //         return Text(version, style: titleMedium(context));
  //       } else {
  //         return const Text('');
  //       }
  //     },
  //   );
  // }
}
