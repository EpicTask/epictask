import 'package:epictask/repositories/assigned_task_repository.dart';
import 'package:epictask/repositories/task_repository.dart';
import 'package:epictask/screens/home/components/assigned_tasks.dart';
import 'package:epictask/screens/home/components/open_tasks.dart';
import 'package:epictask/screens/tasks/create_task.dart';
import 'package:epictask/screens/menu/menu_drawer.dart';
import 'package:epictask/screens/tasks/logic/logic.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:epictask/services/service_config/service_config.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../bloc/generics/generic_bloc.dart';
import '../../models/task_model/task_model.dart';
import '../dashboard/dashboard.dart';

ValueNotifier<int> paginator = ValueNotifier<int>(10);

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final List<Widget> _widgetOptions = <Widget>[
    const HomeWidget(),
    const CreateTaskWidget(),
    const DashboardWidget(),
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
          ),
        ),
        drawer: const MenuDrawer(),
        body: SizedBox(
          height: SizeConfig.screenHeight,
          width: SizeConfig.screenWidth,
          child: _widgetOptions.elementAt(_selectedIndex),
        ),
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
      ),
    );
  }
}

class HomeWidget extends StatelessWidget {
  const HomeWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2, // Number of tabs
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                FutureBuilder<Object>(
                    future: getUserDisplayName(currentUserID),
                    builder: (context, snapshot) {
                      if (snapshot.hasData) {
                        String displayName = snapshot.data as String;
                        return Text(
                          "Welcome, $displayName!",
                          style: headlineSmall(context),
                        );
                      } else {
                        return Text(
                          "Welcome! ",
                          style: headlineSmall(context),
                        );
                      }
                    }),
                Text(
                  "Manage your tasks.",
                  style: titleMedium(context),
                ),
              ],
            ),
          ),
          Container(
            height: 2,
            color: Colors.grey,
          ),
          Padding(
            padding: const EdgeInsets.only(top: 16.0),
            child: TabBar(
              tabs: const <Tab>[
                Tab(
                  text: 'Open Tasks',
                ),
                Tab(text: 'Assigned Tasks'),
              ],
              labelStyle: titleLarge(context),
            ),
          ),
          Expanded(
            // Adjust the height as needed
            child: TabBarView(
              children: [
                BlocProvider(
                  create: (BuildContext context) =>
                      GenericBloc<TaskModel, TaskRepository>(
                    repository: TaskRepository(),
                  ),
                  child: const OpenTasksWidget(),
                ),
                BlocProvider(
                  create: (BuildContext context) =>
                      GenericBloc<TaskModel, AssignedTaskRepository>(
                    repository: AssignedTaskRepository(),
                  ),
                  child: const AssignedTasksWidget(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
