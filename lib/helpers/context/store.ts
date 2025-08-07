// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { MonitorAPI } from "../api/MonitorService";
import { RemoteMonitorsAPI } from "../api/RemoteService";

export const store = configureStore({
  reducer: {
    [MonitorAPI.reducerPath]: MonitorAPI.reducer,
    [RemoteMonitorsAPI.reducerPath]: RemoteMonitorsAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(MonitorAPI.middleware)
      .concat(RemoteMonitorsAPI.middleware),
});

// For typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
