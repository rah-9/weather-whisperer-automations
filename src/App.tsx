
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback component for missing environment variables
const MissingEnvVarsComponent = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 max-w-md text-center shadow-xl">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h1>
      <p className="text-gray-700 mb-4">
        Supabase environment variables are missing. Please ensure your Lovable project is properly connected to Supabase.
      </p>
      <div className="text-sm text-gray-600">
        <p>Required variables:</p>
        <ul className="list-disc list-inside mt-2">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
      </div>
    </div>
  </div>
);

// Main App component with conditional rendering
const App = () => {
  // Check if environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your Lovable-Supabase integration.');
    return <MissingEnvVarsComponent />;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

export default App;
