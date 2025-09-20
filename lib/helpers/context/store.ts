// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { MonitorAPI } from "../api/MonitorService";
import { RemoteMonitorsAPI } from "../api/RemoteService";
import { AgentAPI } from "../api/AgentService";
import { AuthAPI } from "../api/AuthService";
import { RulesAPI } from "../api/RulesService";
import { UsersAPI } from "../api/UserService";

export const store = configureStore({
  reducer: {
    [MonitorAPI.reducerPath]: MonitorAPI.reducer,
    [RemoteMonitorsAPI.reducerPath]: RemoteMonitorsAPI.reducer,
    [AgentAPI.reducerPath]: AgentAPI.reducer,
    [AuthAPI.reducerPath]: AuthAPI.reducer,
    [RulesAPI.reducerPath]: RulesAPI.reducer,
    [UsersAPI.reducerPath]: UsersAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(MonitorAPI.middleware)
      .concat(RemoteMonitorsAPI.middleware)
      .concat(AgentAPI.middleware)
      .concat(AuthAPI.middleware)
      .concat(RulesAPI.middleware)
      .concat(UsersAPI.middleware)
});

// For typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
