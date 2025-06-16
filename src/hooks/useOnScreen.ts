
import { useState, useEffect, RefObject } from 'react';

function useOnScreen(ref: RefObject<HTMLElement>, options?: IntersectionObserverInit): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Update our state when observer callback fires
      setIntersecting(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]); // Re-run effect if ref or options change

  return isIntersecting;
}

export default useOnScreen;
