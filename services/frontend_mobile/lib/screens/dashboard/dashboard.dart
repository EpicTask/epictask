import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/screens/dashboard/components/item_card.dart';
import 'package:epictask/screens/dashboard/logic/logic.dart';
import 'package:epictask/screens/users/components/loading_widget.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/material.dart';

import '../../services/service_config/service_config.dart';
import '../tasks/logic/logic.dart';

//  Dashboard Widget for task metrics
class DashboardWidget extends StatelessWidget {
  const DashboardWidget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: FutureBuilder<List>(
          future: getMyTasks(),
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              List<TaskModel> tasks = snapshot.data as List<TaskModel>;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dashboard',
                    style: headlineMedium(context),
                  ),
                  Container(height: 2, color: Colors.blueAccent),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: SizeConfig.screenHeight * .15,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        itemCard(tasks.length.toString(), 'Active', context),
                        SizedBox(
                          width: SizeConfig.screenWidth * .2,
                        ),
                        itemCard(tasks.length.toString(), 'Marked\nCompleted',
                            context),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: SizeConfig.screenHeight * .15,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        itemCard(sumRewardAmount(tasks).toString(),
                            'Pending (XRP)', context),
                        SizedBox(
                          width: SizeConfig.screenWidth * .2,
                        ),
                        FutureBuilder<double?>(
                            future: getUSDValue(),
                            builder: (context, snapshot) {
                              if (snapshot.hasData) {
                                double value = snapshot.data as double;
                                double val = value * sumRewardAmount(tasks);
                                return itemCard(
                                    val.toStringAsFixed(2), '(USD)', context);
                              } else {
                                return itemCard('N/A', '(USD)', context);
                              }
                            }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: SizeConfig.screenWidth,
                    child: Card(
                      color: Colors.blueAccent,
                      shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(20),
                              topRight: Radius.circular(20))),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Upcoming Due Dates',
                              style: headlineSmall(context),
                            ),
                            if (tasks.isEmpty)
                              const Text('No tasks due.'),
                            ...tasks
                                .map((element) => Text(
                                      formatDate(
                                          DateTime.fromMillisecondsSinceEpoch(
                                              element.expiration_date * 1000)),
                                      style: titleLarge(context),
                                    ))
                                .toList(),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              );
            } else {
              return const Loading();
            }
          },
        ),
      ),
    );
  }
}
