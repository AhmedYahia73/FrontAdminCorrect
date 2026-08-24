import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/settings");
      // Adjust according to the actual SuccessResponse structure which usually returns { data: { settings } } or just the settings.
      return res.data?.data?.settings || res.data?.data || res.data;
    },
    staleTime: 5 * 60 * 1000, 
  });

  return (
    <SettingsContext.Provider value={{ settings: data, isLoading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
