import { useState, useEffect } from "react";

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Abort if window is not available, e.g. during server-side rendering
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Function to update state based on whether the query matches
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set the initial state
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener("change", handleChange);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]); // Re-run the effect if the query string changes

  return matches;
};
