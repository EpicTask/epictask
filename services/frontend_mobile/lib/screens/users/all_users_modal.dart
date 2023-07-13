import 'package:epictask/models/task_model/task_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../bloc/generics/generic_bloc.dart';
import '../../bloc/generics/generic_state.dart';
import '../../bloc/generics/generics_event.dart';
import '../../models/user_model/user_model.dart';
import '../../repositories/all_users_repository.dart';
import '../../services/service_config/service_config.dart';
import '../../services/ui/text_styles.dart';
import 'components/loading_widget.dart';

class AllUserPage extends StatelessWidget {
  const AllUserPage({Key? key, required this.task}) : super(key: key);

  final TaskModel task;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        showModalBottomSheet(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          context: context,
          builder: (BuildContext context) {
            return BlocProvider<GenericBloc<UserModel, AllUserRepository>>(
                create: (BuildContext context) =>
                    GenericBloc<UserModel, AllUserRepository>(
                      repository: AllUserRepository(),
                    ),
                child: const UserModalSheet());
          },
        );
      },
      child: Text('Assign', style: titleMedium(context)),
    );
  }
}

class UserModalSheet extends StatefulWidget {
  const UserModalSheet({super.key});

  @override
  State<UserModalSheet> createState() => _UserModalSheetState();
}

class _UserModalSheetState extends State<UserModalSheet> {
  late GenericBloc<UserModel, AllUserRepository> bloc;

  @override
  void initState() {
    bloc = BlocProvider.of<GenericBloc<UserModel, AllUserRepository>>(context);
    bloc.add(LoadingGenericData());
    super.initState();
  }

  @override
  void dispose() {
    bloc.close();
    super.dispose();
  }

  @override
   Widget build(BuildContext context) {
    return BlocBuilder<GenericBloc<UserModel, AllUserRepository>, GenericState>(
      // bloc: blocCurrent,
      builder: (BuildContext context, GenericState state) {
        if (state is LoadingState) {
          return const Loading();
        } else if (state is HasDataState) {
          final List<UserModel> allUsersList = state.data as List<UserModel>;
          return SizedBox(
            height: SizeConfig.screenHeight * 0.75,
            child: Column(
              children: <Widget>[
                 SearchBar(
                  hintText: 'Search',
                  textStyle: MaterialStatePropertyAll<TextStyle>(titleMedium(context)!),
                ),
                
                
              ],
            ),
          );
        }
        return Container(); // Return an empty container if no data or loading state
      },
    );
  }
}
