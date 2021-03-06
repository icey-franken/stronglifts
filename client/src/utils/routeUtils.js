import React from "react";
import { Route, Redirect, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export const ProtectedRoute = ({ component: Component, ...rest }) => {
  const needLogin = useSelector((state) => !state.auth.id);
	const { hasWorkouts } = useSelector((state) => state.workouts);
	const history = useHistory();
	const path = history.location.pathname.toLowerCase();
  return needLogin ? (
		//not logged in? send to login
    <Redirect to="/login" />
		//no workouts and trying to go anywhere but new lifter form? send to new lifter form
  ) : !hasWorkouts && path !== "/newlifterform" ? (
    <Redirect to="/newLifterForm" />
		//have workouts and trying to go to new lifter form (usually the case is a new user just filled out new lifter form) ? Send to new workout page
  ) : hasWorkouts &&  path === "/newlifterform" ? (
    <Redirect to="/workout/new" />
  ) : (
		//otherwise, send to where you were trying to go
    <Route {...rest} component={Component} />
  );
};

export const AuthRoute = ({ component: Component, ...rest }) => {
  const needLogin = useSelector((state) => !state.auth.id);
	const history = useHistory();
	if(history.location.pathname==='/'){
		history.replace('/login')
	}
	return needLogin ? (
    <Route {...rest} component={Component} />
  ) : (
		//send to graph page after logging in - if new user, protected route will automatically redirect to new lifter form.
    <Redirect to="/progress" />
  );
};
