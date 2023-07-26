import 'package:epictask/bloc/generics/generics_event.dart';
import 'package:epictask/repositories/task_repository.dart';
import 'package:epictask/screens/home/components/shimmer_widget.dart';
import 'package:epictask/screens/tasks/task_card.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/generics/generic_bloc.dart';
import '../../../bloc/generics/generic_state.dart';
import '../../../models/task_model/task_model.dart';
import '../../../services/service_config/service_config.dart';
import '../home_screen.dart';

// Open Tasks Widget
class OpenTasksWidget extends StatefulWidget {
  const OpenTasksWidget({super.key});

  @override
  State<OpenTasksWidget> createState() => _OpenTasksWidgetState();
}

class _OpenTasksWidgetState extends State<OpenTasksWidget> {
  late final GenericBloc<TaskModel, TaskRepository> bloc;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    bloc = BlocProvider.of<GenericBloc<TaskModel, TaskRepository>>(context);
    bloc.add(LoadingGenericData());
    _scrollController.addListener(scrollListener);
    paginator.value = 10;
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
        paginator.value = 10;
        if (kDebugMode) {
          print('Reached the top');
        }
      } else {
        paginator.value = paginator.value + 10;
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
    return BlocBuilder<GenericBloc<TaskModel, TaskRepository>, GenericState>(
        bloc: bloc,
        builder: (BuildContext context, GenericState state) {
          if (state is LoadingState) {
            return FutureBuilder<void>(
              future: Future.delayed(const Duration(seconds: 5)),
              builder: (context, snapshot) {
                return const TaskCardShimmer();
              },
            );
          }
          if (state is HasDataState) {
            final List<TaskModel> taskData = state.data as List<TaskModel>;
            return kIsWeb
                ? CustomScrollView(slivers: [
                    SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3),
                      delegate: SliverChildBuilderDelegate(
                          (BuildContext context, int index) {
                        return TaskCard(task: taskData[index]);
                      }, childCount: taskData.length),
                    )
                  ])
                : SingleChildScrollView(
                    child: SizedBox(
                      height: SizeConfig.screenHeight * .8,
                      width: (kIsWeb)
                          ? SizeConfig.screenWidth * .75
                          : SizeConfig.screenWidth,
                      child: kIsWeb
                          ? SliverGrid(
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 3),
                              delegate: SliverChildBuilderDelegate(
                                  (BuildContext context, int index) {
                                return TaskCard(task: taskData[index]);
                              }, childCount: taskData.length),
                            )
                          : ListView.builder(
                              controller: _scrollController,
                              itemCount: taskData.length + 1,
                              itemBuilder: (context, index) {
                                if (index == taskData.length) {
                                  return SizedBox(
                                    height: SizeConfig.screenHeight * .2,
                                  );
                                } else {
                                  return TaskCard(task: taskData[index]);
                                }
                              },
                            ),
                    ),
                  );
          } else {
            return const TaskCardShimmer();
          }
        });
  }
}
