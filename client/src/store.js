import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import { createSlice } from "@reduxjs/toolkit";

// ✅ Call slice to store incoming call data
const callSlice = createSlice({
  name: "call",
  initialState: { incomingCall: null },
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },
  },
});

export const { setIncomingCall, clearIncomingCall } = callSlice.actions;

export const store = configureStore({
  reducer: {
    user: userReducer,
    call: callSlice.reducer,
  },
});


export default store;
