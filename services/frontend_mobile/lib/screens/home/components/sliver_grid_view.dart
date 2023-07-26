// import 'package:flutter/material.dart';

// import '../../../services/service_config/service_config.dart';

// /// Sliver Grid View for all trips
// class SliverGridView extends StatelessWidget {

//   const SliverGridView({Key? key, }) : super(key: key);


//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       height: SizeConfig.screenHeight,
//       child: CustomScrollView(slivers: <Widget>[
//         SliverStaggeredGrid.countBuilder(
//           crossAxisCount: 4,
//           mainAxisSpacing: 1,
//           crossAxisSpacing: 1,
//           itemCount: trips.length,
//           itemBuilder: (BuildContext context, int index) {
//             return TappableCrewTripGrid(
//               trip: trips[index],
//             );
//           },
//           staggeredTileBuilder: (int index) {
//             if (trips[index].urlToImage?.isNotEmpty ?? false) {
//               return const StaggeredTile.count(2, 2);
//             } else {
//               return const StaggeredTile.count(2, 1);
//             }
//           },
//         )
//       ]),
//     );
//   }
// }