import React from "react";
import { Navigate } from "react-router-dom";
import { useGlobalState } from "./provider";

const PrivateRoute = ({ children }) => {
    const [{ access }] = useGlobalState();
    return access ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
