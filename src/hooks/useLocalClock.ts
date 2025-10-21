import { useEffect, useState } from "react";

export function useLocalClock(updateMs = 60_000) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), updateMs);
    return () => clearInterval(id);
  }, [updateMs]);

  return now;
}
