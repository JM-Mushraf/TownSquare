import { configureStore } from "@reduxjs/toolkit";
import authSlice from '../Slices/AuthSlice.js'

export const Store= configureStore({
    reducer:{
        user:authSlice,
    }
})