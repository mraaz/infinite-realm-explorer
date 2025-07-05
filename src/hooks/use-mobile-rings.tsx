
import { useState, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

export function useMobileRings() {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset to collapsed when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return {
    isMobile,
    isExpanded,
    toggleExpanded,
    shouldShowRings: !isMobile || isExpanded,
  };
}
