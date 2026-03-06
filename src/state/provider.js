import React, { createContext, useContext, useReducer } from "react";
import Cookies from "js-cookie";

export const Context = createContext();

export const initialstate = {
    profile: null,
    access: Cookies.get("access") || null,
    refresh: Cookies.get("refresh") || null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case "ADD_DATA":
        case "SET_TOKENS":
            Cookies.set("access", action.access);
            Cookies.set("refresh", action.refresh);
            return { ...state, access: action.access, refresh: action.refresh };
        case "ADD_PROFILE":
        case "SET_PROFILE":
            return { ...state, profile: action.profile };
        case "LOGOUT":
            Cookies.remove("access");
            Cookies.remove("refresh");
            localStorage.clear();
            return { ...state, profile: null, access: null, refresh: null };
        default:
            return state;
    }
};

export const Globalstate = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialstate);
    return <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>;
};

export const useGlobalState = () => useContext(Context);
export default Globalstate;