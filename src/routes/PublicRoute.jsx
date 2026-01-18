import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const isAuth = !!localStorage.getItem("access_token");
  return isAuth ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
