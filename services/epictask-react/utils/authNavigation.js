const LOGIN_ROUTES = {
  parent: "/(parent)/auth/login",
  child: "/(kid)/auth/login",
};

/**
 * Clear authenticated navigation history and show the appropriate login
 * screen after a full sign-out.
 */
export const navigateToLogin = (router, role) => {
  // Some route groups are backed by a navigator with no dismissible stack.
  // Guarding this avoids the POP_TO_TOP warning in those groups.
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(LOGIN_ROUTES[role] || LOGIN_ROUTES.parent);
};
