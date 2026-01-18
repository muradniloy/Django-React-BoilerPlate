import React, { createContext, useContext, useReducer } from "react";
import axios from "axios";

// Create context
export const Context = createContext();

// Initial state
export const initialstate = {
    profile: null,   // user info
    access: localStorage.getItem("access") || null,
    refresh: localStorage.getItem("refresh") || null,
};

// Reducer
const reducer = (state, action) => {
    switch (action.type) {
        case "SET_PROFILE":
            return { ...state, profile: action.profile };
        case "SET_TOKENS":
            localStorage.setItem("access", action.access);
            localStorage.setItem("refresh", action.refresh);
            return { ...state, access: action.access, refresh: action.refresh };
        case "LOGOUT":
            localStorage.clear();
            return { profile: null, access: null, refresh: null };
        default:
            return state;
    }
};

// Provider
export const Globalstate = ({ children }) => {
    const value = useReducer(reducer, initialstate);
    return <Context.Provider value={value}>{children}</Context.Provider>;
};

// Custom hook
export const useGlobalState = () => useContext(Context);

export default reducer;
