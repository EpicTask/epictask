import 'package:epictask/screens/tasks/logic/logic.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../bloc/generics/generic_bloc.dart';
import '../../bloc/generics/generic_state.dart';
import '../../bloc/generics/generics_event.dart';
import '../../models/leaderboard_model/leaderboard_model.dart';
import '../../repositories/leaderboard_repository.dart';
import '../../services/ui/text_styles.dart';
import '../home/home_screen.dart';
import 'components/loading_shimmer.dart';

// Leaderboard Screen
class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<GenericBloc<LeaderboardModel, LeaderboardRepository>>(
      create: (context) => GenericBloc<LeaderboardModel, LeaderboardRepository>(
          repository: LeaderboardRepository()),
      child: const LeaderboardScreenState(),
    );
  }
}

class LeaderboardScreenState extends StatefulWidget {
  const LeaderboardScreenState({super.key});

  @override
  LeaderboardScreenStateState createState() => LeaderboardScreenStateState();
}

class LeaderboardScreenStateState extends State<LeaderboardScreenState> {
  late GenericBloc<LeaderboardModel, LeaderboardRepository> bloc;
  final ScrollController _scrollController = ScrollController();
  @override
  void initState() {
    bloc =
        BlocProvider.of<GenericBloc<LeaderboardModel, LeaderboardRepository>>(
            context);
    bloc.add(LoadingGenericData());
    _scrollController.addListener(scrollListener);
    paginator3.value = 10;
    super.initState();
  }

  @override
  void dispose() {
    bloc.close();
    _scrollController.dispose();
    super.dispose();
  }

  void scrollListener() {
    if (_scrollController.position.atEdge) {
      if (_scrollController.position.pixels == 0) {
        // Reached the top of the scroll view
        paginator3.value = 10;
        if (kDebugMode) {
          print('Reached the top');
        }
      } else {
        paginator3.value = paginator3.value + 10;
        if (kDebugMode) {
          print(paginator.value);
        }
        bloc.add(LoadingGenericData());
        if (kDebugMode) {
          print('Reached the bottom');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 24, right: 24, bottom: 24),
      child: BlocBuilder<GenericBloc<LeaderboardModel, LeaderboardRepository>,
          GenericState>(
        bloc: bloc,
        builder: (BuildContext context, GenericState state) {
          if (state is LoadingState) {
            return loadingShimmer();
          } else if (state is HasDataState) {
            final List<LeaderboardModel> leaderList =
                state.data as List<LeaderboardModel>;
            // Sort the leaderboard entries by the number of task completed.
            leaderList
                .sort((a, b) => b.tasks_completed.compareTo(a.tasks_completed));
            return SizedBox(
              height: SizeConfig.screenHeight,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      'Leaderboard',
                      style: headlineMedium(context),
                    ),
                  ),
                  Container(height: 2, color: Colors.blueAccent),
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollController,
                      itemCount: leaderList.length,
                      itemBuilder: (context, index) {
                        final entry = leaderList[index];
                        return FutureBuilder<Object>(
                            future: getUserDisplayName(entry.user_id),
                            builder: (context, snapshot) {
                              if (snapshot.hasData) {
                                String name = snapshot.data as String;
                                return ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor: Colors.blueAccent,
                                    child: Text(
                                      '${index + 1}',
                                      style: headlineSmall(context),
                                    ),
                                  ),
                                  title: Text(
                                    name,
                                    style: titleLarge(context),
                                  ),
                                  subtitle: Text(
                                    '${entry.tasks_completed} Completed • ${entry.xrp_earned} XRP Earned',
                                    style: titleMedium(context),
                                  ),
                                  onTap: () {
                                    // Handle tapping on a leaderboard entry if needed
                                  },
                                );
                              }
                              return ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: Colors.amber,
                                ),
                                title: Text(
                                    'User: ${entry.user_id.substring(0, 5)}'),
                                subtitle: Text(
                                  '${entry.tasks_completed} Completed • ${entry.xrp_earned} XRP Earned • ${entry.eTask_earned} ETask Earned',
                                  style: titleMedium(context),
                                ),
                                onTap: () {
                                  // Handle tapping on a leaderboard entry if needed
                                },
                              );
                            });
                      },
                    ),
                  ),
                ],
              ),
            );
          } else {
            return Container();
          }
        },
      ),
    );
  }
}
