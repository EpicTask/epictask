
/// Static functions to validate some specific string patterns.

RegExp _emailRegExp = RegExp(
  // r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
  r'^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$',
);
RegExp _passwordRegExp = RegExp(
  r'^(?=[^\d_])\w(\w|[!@#$%]){7,20}',
);

bool isValidEmail(String email) {
  return _emailRegExp.hasMatch(email);
  // return email.length ==4;
}

bool isValidPassword(String password) {
  return _passwordRegExp.hasMatch(password);
  // return true;
}