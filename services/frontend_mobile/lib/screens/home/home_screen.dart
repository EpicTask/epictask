import 'package:epictask/repositories/assigned_task_repository.dart';
import 'package:epictask/repositories/task_repository.dart';
import 'package:epictask/screens/home/components/assigned_tasks.dart';
import 'package:epictask/screens/home/components/open_tasks.dart';
import 'package:epictask/screens/tasks/create_task.dart';
import 'package:epictask/screens/tasks/task_card.dart';
import 'package:epictask/screens/menu/menu_drawer.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../bloc/generics/generic_bloc.dart';
import '../../models/task_model/task_model.dart';
import '../dashboard/dashboard.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final List<Widget> _widgetOptions = <Widget>[
    // const FeedScreen(),
    const HomeWidget(),
     CreateTaskWidget(),
    const Dashboard(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Scaffold(
      appBar: AppBar(
          title: Text(
        'Epic Task',
        style: headlineMedium(context),
      )),
      drawer: const MenuDrawer(),
      body: SizedBox(
          height: SizeConfig.screenHeight,
          width: SizeConfig.screenWidth,
          child: _widgetOptions.elementAt(_selectedIndex),),
      bottomNavigationBar: CurvedNavigationBar(
        backgroundColor: Colors.blue,
        color: const Color(0xFF121212),
        items: const <Widget>[
          Icon(
            Icons.home,
            color: Colors.blueAccent,
          ),
          Icon(Icons.add),
          Icon(Icons.dashboard),
        ],
        onTap: _onItemTapped,
        index: _selectedIndex,
      ),
    ));
  }
}

class HomeWidget extends StatelessWidget {
  const HomeWidget({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Welcome!",
                  style: headlineSmall(context),
                ),
                Text(
                  "Manage your tasks.",
                  style: titleMedium(context),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              "Open Tasks",
              style: headlineSmall(context),
            ),
          ),
          Container(
            height: 2,
            color: Colors.grey,
          ),
          BlocProvider(
            create: (BuildContext context) =>
                GenericBloc<TaskModel,TaskRepository>(
                    repository: TaskRepository()),
            child: const OpenTasksWidget(),
          ),

          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              "Assigned Tasks",
              style: headlineSmall(context),
            ),
          ),
          Container(
            height: 2,
            color: Colors.grey,
          ),
          BlocProvider(
            create: (BuildContext context) =>
                GenericBloc<TaskModel,AssignedTaskRepository>(
                    repository: AssignedTaskRepository()),
            child: const AssignedTasksWidget(),
          ),
        ],
      ),
    );
  }
}
