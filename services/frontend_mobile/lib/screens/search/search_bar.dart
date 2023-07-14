import 'package:epictask/models/user_model/user_model.dart';
import 'package:epictask/services/ui/text_styles.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../services/service_config/service_config.dart';

class CustomSearchBar extends StatefulWidget {
  const CustomSearchBar({
    super.key,
    required this.users,
  });

  final List<UserModel> users;
  @override
  CustomSearchBarState createState() => CustomSearchBarState();
}

class CustomSearchBarState extends State<CustomSearchBar> {
  final TextEditingController _controller = TextEditingController();
  List<UserModel> _results = <UserModel>[];
  bool _isSearching = false;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: SizeConfig.screenHeight * 0.5,
      child: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30.0),
                color: Colors.grey[300],
              ),
              child: Row(
                children: <Widget>[
                  const Padding(
                    padding: EdgeInsets.only(left: 8.0),
                    child: Icon(Icons.search),
                  ),
                  Expanded(
                    child: TextField(
                      style:
                          titleMedium(context)?.copyWith(color: Colors.black),
                      controller: _controller,
                      onChanged: (String value) async {
                        if (value.length >= 2) {
                          setState(() {
                            _isSearching = true;
                          });

                          setState(() {
                            try {
                              _results = widget.users
                                  .where((UserModel result) => result
                                      .displayName!
                                      .toLowerCase()
                                      .contains(_controller.text.toLowerCase()))
                                  .toList();
                            } catch (e) {
                              if (kDebugMode) {
                                print(e);
                              }
                            }
                          });
                        } else {
                          setState(() {
                            _isSearching = false;
                          });
                        }
                      },
                      onSubmitted: (String value) async {
                        try {} catch (e) {
                          if (kDebugMode) {
                            print(e);
                          }
                        }
                      },
                      decoration: const InputDecoration(
                        hintText: 'Search',
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  if (_isSearching)
                    IconButton(
                      icon: const Icon(Icons.cancel),
                      onPressed: () {
                        setState(() {
                          _controller.clear();
                          _results.clear();
                          _isSearching = false;
                          // Remove focus from TextField
                          FocusScope.of(context).unfocus();
                        });
                      },
                    )
                  else
                    const SizedBox.shrink(),
                ],
              ),
            ),
          ),
          if (_results.isNotEmpty)
            Expanded(
              child: ListView.builder(
                itemCount: _results.length,
                itemBuilder: (BuildContext context, int index) {
                  final UserModel result = _results[index];
                  return ListTile(
                    title: Text(result.displayName ?? ''),
                    onTap: () {
                      setState(() {});
                    },
                  );
                },
              ),
            )
        ],
      ),
    );
  }
}
