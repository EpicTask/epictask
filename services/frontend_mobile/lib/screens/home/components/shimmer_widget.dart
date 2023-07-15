import 'package:fade_shimmer/fade_shimmer.dart';
import 'package:flutter/material.dart';

import '../../../services/service_config/service_config.dart';

class TaskCardShimmer extends StatelessWidget {
  const TaskCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
              padding: const EdgeInsets.only(
                left: 24.0,
                top: 16.0,
                right: 24,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  FadeShimmer(
                    height: 8,
                    width: SizeConfig.screenWidth * .2,
                    radius: 4,
                    highlightColor: Colors.white,
                    baseColor: Theme.of(context).disabledColor,
                  ),
                  SizedBox(
                    height: SizeConfig.screenWidth * .05,
                  ),
                  FadeShimmer(
                    height: 8,
                    width: SizeConfig.screenWidth,
                    radius: 4,
                    highlightColor: Colors.white,
                    baseColor: Theme.of(context).disabledColor,
                  ),
                  SizedBox(
                    height: SizeConfig.screenWidth * .05,
                  ),
                  FadeShimmer(
                    height: 8,
                    width: SizeConfig.screenWidth,
                    radius: 4,
                    highlightColor: Colors.white,
                    baseColor: Theme.of(context).disabledColor,
                  ),
                  SizedBox(
                    height: SizeConfig.screenWidth * .05,
                  ),
                ],
              ))
        ]);
  }
}
