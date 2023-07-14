import 'package:epictask/screens/users/components/loading_widget.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'components/bloc/bloc.dart';
import 'components/bloc/event.dart';
import 'components/bloc/state.dart';

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
    print(state.profile);
    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: CircleAvatar(
                  backgroundImage: NetworkImage(state.profile.imageUrl ?? ''),
                  radius: SizeConfig.screenWidth * .3,
                ),
              ),
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: IconButton(onPressed: (){}, icon: const Icon(Icons.edit)),
                ),
              ),
              SizedBox(height: SizeConfig.blockSizeHorizontal,),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      state.profile.displayName ?? '',
                      style: titleLarge(context),
                    ),
                    IconButton(onPressed: (){}, icon: const Icon(Icons.edit)),
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
                      child: Text(
                        state.profile.publicAddress ?? '',
                        style: titleLarge(context),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(onPressed: (){}, icon: const Icon(Icons.edit)),
                  ],
                ),
              ),

              
            ],
          ),
        ),
      ),
    );
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
