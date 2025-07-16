import axiosInstance from "@/lib/helpers/axiosInstance";
import { ServiceEntitySchema } from "../schema/service";
import { z } from "zod";

// Fetch all system monitors
export const getAllMonitors = async (): Promise<BaseMonitor[]> => {
  const res = await axiosInstance.get("/systemmonitor");
  return res.data;
};

export const getSingleMonitor = async (id: string): Promise<BaseMonitor> => {
  const res = await axiosInstance.get(`/systemmonitor/${id}`);
  return res.data;
};

export const getMonitorPlugins = async (): Promise<MonitorPlugin[]> => {
  const res = await axiosInstance.get(`/v1/Plugins`);
  return res.data;
};

export const getMonitoringResultsById = async (id: string): Promise<MonitoringResult[]> => {
  const res = await axiosInstance.get(`/v1/MonitorResults/${id}`);
  return res.data;
};

// Create a new monitor
export const createServiceMonitor = async (
  data: z.infer<typeof ServiceEntitySchema>
) => {
  const res = await axiosInstance.post("/systemmonitor", data);
  return res.data;
};

// Update a monitor
export const updateServiceMonitor = async (
  id: string,
  data: z.infer<typeof ServiceEntitySchema>
) => {
  const res = await axiosInstance.put(`/systemmonitor/${id}`, data);
  return res.data;
};

// Delete a service monitor
export const deleteServiceMonitor = async (id: string) => {
  await axiosInstance.delete(`/systemmonitor/${id}`);
};
