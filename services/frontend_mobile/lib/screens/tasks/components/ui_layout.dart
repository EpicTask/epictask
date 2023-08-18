import 'package:flutter/material.dart';

import '../../../services/service_config/service_config.dart';

class BodyCard extends StatelessWidget {
  const BodyCard({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) {
    return Card(
        color: Colors.blue.shade800,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 10,
        child: child);
  }
}

class TaskCardShape extends StatelessWidget {
  const TaskCardShape({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Card(
        elevation: 10,
        color: Colors.grey[850],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(padding: const EdgeInsets.all(16.0), child: child),
      ),
    );
  }
}

class DefaultTaskDetailPadding extends StatelessWidget {
  const DefaultTaskDetailPadding({super.key, required this.child});

  final Widget child;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
          top: SizeConfig.safeBlockVertical * 2,
          bottom: SizeConfig.safeBlockVertical * 2),
      child: child,
    );
  }
}
class DefaultTaskDetailPadding4 extends StatelessWidget {
  const DefaultTaskDetailPadding4({super.key, required this.child});

  final Widget child;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
          top: SizeConfig.safeBlockVertical * 4,
          bottom: SizeConfig.safeBlockVertical * 4),
      child: child,
    );
  }
}

