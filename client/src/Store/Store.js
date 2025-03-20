import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../Slices/AuthSlice.js";

// Load persisted auth state from localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem("auth");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    console.error("Error loading auth state:", err);
    return undefined;
  }
};

// Initialize store with persisted state
export const Store = configureStore({
  reducer: {
    user: authSlice,
  },
  preloadedState: { user: loadAuthState() }, // Load persisted user state
});

// Save state to localStorage whenever it changes
Store.subscribe(() => {
  try {
    const state = Store.getState().user;
    localStorage.setItem("auth", JSON.stringify(state));
  } catch (err) {
    console.error("Error saving auth state:", err);
  }
});