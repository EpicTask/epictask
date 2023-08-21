import 'package:epictask/screens/users/components/loading_widget.dart';
import 'package:epictask/services/constants.dart';
import 'package:epictask/services/navigation/navigation.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'components/bloc/bloc.dart';
import 'components/bloc/event.dart';
import 'components/bloc/state.dart';

// Profile Page
class ProfilePage extends StatelessWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ProfileBloc(),
      child: BlocConsumer<ProfileBloc, ProfileState>(
        listener: (context, state) {
          if (state is ProfileError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage),
              ),
            );
          }
        },
        builder: (context, state) {
          final profileBloc = BlocProvider.of<ProfileBloc>(context);

          if (state is ProfileInitial) {
            profileBloc.add(FetchUserProfile());
            return const Loading();
          } else if (state is ProfileLoading) {
            return const Loading();
          } else if (state is ProfileLoaded) {
            return buildProfilePage(state, profileBloc, context);
          } else if (state is ProfileError) {
            return buildErrorPage(state);
          }

          return Container();
        },
      ),
    );
  }

  Widget buildProfilePage(
      ProfileLoaded state, ProfileBloc bloc, BuildContext context) {
    // Use state to populate the profile page UI
    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Container(
          margin: const EdgeInsets.all(24.0),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              kIsWeb
                  ? CircleAvatar(
                      backgroundImage:
                          NetworkImage(state.profile.imageUrl ?? ''),
                      radius: kIsWeb
                          ? SizeConfig.screenWidth * .1
                          : SizeConfig.screenWidth * .3,
                    )
                  : Center(
                      child: CircleAvatar(
                        backgroundImage:
                            NetworkImage(state.profile.imageUrl ?? ''),
                        radius: kIsWeb
                            ? SizeConfig.screenWidth * .1
                            : SizeConfig.screenWidth * .3,
                      ),
                    ),
              SizedBox(
                height: SizeConfig.blockSizeHorizontal,
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                  (state.profile.displayName?.isNotEmpty ?? false) ? Text(
                      state.profile.displayName ?? '',
                      style: titleLarge(context),
                    ):Text(
                      'Update Display Name',
                      style: titleLarge(context),
                    ),
                    IconButton(
                        onPressed: () {
                          buildAlertDialog(context, displayNameDiaglog, bloc);
                        },
                        icon: const Icon(Icons.edit)),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  state.profile.email ?? '',
                  style: titleLarge(context),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                   Text('Public Address: ', style: titleLarge(context)),
                    Expanded(
                      child: (state.profile.publicAddress?.isNotEmpty ?? false) ? TextField(
                        enabled: false,
                        decoration: const InputDecoration(
                          hintText: '*************',
                        ),
                        style: titleLarge(context),
                        obscureText: true,
                        controller: TextEditingController(
                            text: state.profile.publicAddress ?? ''),
                      ): Text('Update Address', style: titleLarge(context)),
                    ),
                    IconButton(
                        onPressed: () {
                          buildAlertDialog(context, publicAddressDiaglog, bloc);
                        },
                        icon: const Icon(Icons.edit)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

// Alert dialog to update field
  Future<void> buildAlertDialog(
      BuildContext context, String title, ProfileBloc profileBloc) {
    String inputText = '';

    return showDialog<void>(
        context: context,
        builder: (context) {
          return AlertDialog(
            backgroundColor: Colors.blueAccent.shade700,
            title: Text(title, style: titleLarge(context)),
            content: TextField(
              textCapitalization: TextCapitalization.words,
              onChanged: (value) {
                inputText = value;
              },
            ),
            actions: [
              TextButton(
                onPressed: () {
                  router.pop(context);
                  if (title == displayNameDiaglog) {
                    profileBloc.add(UpdateDisplayName(inputText));
                  } else {
                    profileBloc.add(UpdatePublicAddress(inputText));
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Updating profile...',
                          style: titleMedium(context)),
                    ),
                  );
                },
                child: Text(
                  'Update',
                  style: titleMedium(context),
                ),
              ),
              TextButton(
                onPressed: () {
                  router.pop(context);
                },
                child: Text('Cancel', style: titleMedium(context)),
              ),
            ],
          );
        });
  }

  Widget buildErrorPage(ProfileError state) {
    // Show error message
    return Scaffold(
      appBar: AppBar(
        title: const Text("Profile"),
      ),
      body: Center(
        child: Text(state.errorMessage),
      ),
    );
  }
}
