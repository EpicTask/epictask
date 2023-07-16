import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

import '../../../services/service_config/service_config.dart';


class Loading extends StatelessWidget{
  const Loading({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: SizeConfig.screenHeight,
      width: SizeConfig.screenWidth,
      color: Colors.black,
      child: const Center(
        child: SpinKitChasingDots(
          color: Colors.blue,
          duration: Duration(seconds: 5),
        ),
      ),
    );
  }
}