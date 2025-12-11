<<<<<<< HEAD
import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ element: Component, roles }) {

  const token = localStorage.getItem("token");
  const rola = localStorage.getItem("rola");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(rola)) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
}

export default PrivateRoute;
=======
import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ element: Component, roles }) {

  const token = localStorage.getItem("token");
  const rola = localStorage.getItem("rola");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(rola)) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
}

export default PrivateRoute;
>>>>>>> def9ccd (Poprawki)
