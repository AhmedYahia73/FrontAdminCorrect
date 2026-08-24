import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes'; // Import the router configuration
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/ThemeProvider';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider } from './context/SettingsContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemeProvider defaultTheme="theme-sunny">
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;