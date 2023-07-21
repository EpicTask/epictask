import 'package:fade_shimmer/fade_shimmer.dart';
import 'package:flutter/material.dart';

import '../../../services/service_config/service_config.dart';

Widget loadingShimmer() {
  return ListView.builder(
      itemCount: 10,
      itemBuilder: (BuildContext context, int index) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 8.0, top: 32, bottom: 32),
              child: FadeShimmer(
                height: 8,
                width: SizeConfig.screenWidth * .4,
                radius: 4,
                highlightColor: Colors.white,
                baseColor: Theme.of(context).disabledColor,
              ),
            ),
            // const SizedBox(height: 8),
            Container(height: 2, color: Colors.grey[400]),
          ],
        );
      });
}