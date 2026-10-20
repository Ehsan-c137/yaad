import { getCurrentTime } from "@yaad/core/store/use-calendar-store";
import { useEffect, useState } from "react";

export function useCurrentTime() {
  const [time, setTime] = useState(() => getCurrentTime());

  useEffect(() => {
    // Update immediately on mount
    setTime(getCurrentTime());

    // Update every 30 seconds to keep time-indicator needle accurate
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return time;
}
