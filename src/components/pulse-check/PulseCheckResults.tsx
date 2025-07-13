import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RadarChart from "@/components/pulse-check/RadarChart";
import Header from "@/components/Header";
import PulseCheckActions from "@/components/pulse-check/PulseCheckActions";
import { useToast } from "@/hooks/use-toast";
import YourJourneySidebar from "@/components/YourJourneySidebar"; // Import the sidebar component
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"; // Import Drawer components
import { Menu } from "lucide-react"; // Import Menu icon
import { Button } from "@/components/ui/button"; // Import Button component

interface PulseCheckData {
  careerScore: number;
  financesScore: number;
  healthScore: number;
  connectionsScore: number;
  careerInsight: string;
  financesInsight: string;
  healthInsight: string;
  connectionsInsight: string;
  createdAt: string;
  publicId: string;
  userId?: string;
}

const PulseCheckResults = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [results, setResults] = useState<PulseCheckData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false); // State for mobile drawer

  useEffect(() => {
    const fetchResults = async () => {
      const params = new URLSearchParams(location.search);
      const publicId = params.get("id");

      if (!publicId) {
        setError("No public ID found in URL.");
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Results link is incomplete.",
          variant: "destructive",
        });
        return;
      }

      try {
        const publicResultsEndpoint = `https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod/pulse-check-data/public/${publicId}`;

        const response = await fetch(publicResultsEndpoint);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch results.");
        }

        const data: PulseCheckData = await response.json();
        setResults({
          ...data,
          Career: data.careerScore,
          Finances: data.financesScore,
          Health: data.healthScore,
          Connections: data.connectionsScore,
          insights: {
            Career: data.careerInsight,
            Finances: data.financesInsight,
            Health: data.healthInsight,
            Connections: data.connectionsInsight,
          },
        } as any);
      } catch (err: any) {
        console.error("Error fetching public Pulse Check results:", err);
        setError(err.message || "Failed to load results. Please try again.");
        toast({
          title: "Error",
          description: err.message || "Failed to load results.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [location.search, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#16161a] text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
        <p className="text-gray-300">Loading your Pulse Check results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#16161a] text-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Error Loading Results
        </h1>
        <p className="text-gray-300 mb-6">{error}</p>
        <button
          onClick={() => (window.location.href = "/pulse-check")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-base"
        >
          Take Pulse Check
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-[#16161a] text-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-gray-400 mb-4">
          Results Not Found
        </h1>
        <p className="text-gray-300 mb-6">
          The Pulse Check results you are looking for could not be found.
        </p>
        <button
          onClick={() => (window.location.href = "/pulse-check")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-base"
        >
          Take Pulse Check
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16161a] text-white overflow-hidden flex">
      {" "}
      {/* Changed from flex-col to flex */}
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-4 md:p-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-6xl mx-auto text-center relative">
            {" "}
            {/* Added relative for hamburger position */}
            <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Pulse Check Results
            </h1>
            {/* Mobile Menu Trigger (Hamburger) - copied from PulseCheck.tsx */}
            <div className="md:hidden absolute top-4 right-4 z-20">
              <Drawer
                direction="right"
                open={isSidebarDrawerOpen}
                onOpenChange={setIsSidebarDrawerOpen}
              >
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-lg"
                  >
                    <Menu
                      size={24}
                      style={{
                        background:
                          "linear-gradient(to right, #a855f7, #ec4899)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-80 bg-gray-800 border-l border-gray-700 h-full mt-0 fixed bottom-0 right-0 rounded-none overflow-y-auto flex flex-col">
                  <DrawerHeader>
                    <DrawerTitle className="sr-only">
                      Your Journey Menu
                    </DrawerTitle>
                    <DrawerDescription className="sr-only">
                      Navigation for your journey steps
                    </DrawerDescription>
                  </DrawerHeader>
                  <YourJourneySidebar />
                </DrawerContent>
              </Drawer>
            </div>
            {/* Radar Chart */}
            <div className="mb-6 md:mb-8">
              <RadarChart
                data={{
                  Career: results.careerScore,
                  Finances: results.financesScore,
                  Health: results.healthScore,
                  Connections: results.connectionsScore,
                }}
                insights={{
                  Career: results.careerInsight,
                  Finances: results.financesInsight,
                  Health: results.healthInsight,
                  Connections: results.connectionsInsight,
                }}
              />
            </div>
            {/* Actions (Download PDF, Share) */}
            <div className="flex justify-center mb-6 md:mb-8">
              <PulseCheckActions
                data={{
                  Career: results.careerScore,
                  Finances: results.financesScore,
                  Health: results.healthScore,
                  Connections: results.connectionsScore,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Sidebar - copied from PulseCheck.tsx */}
      <div className="hidden md:block w-80 bg-gray-800 border-l border-gray-700 flex flex-col justify-end">
        <YourJourneySidebar />
      </div>
    </div>
  );
};

export default PulseCheckResults;
