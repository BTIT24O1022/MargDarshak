import { useEffect } from "react";

// ─── useInterval ──────────────────────────────────────────────────────────────
export const useInterval = (fn, ms) => {
  useEffect(() => {
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  }, [fn, ms]);
};