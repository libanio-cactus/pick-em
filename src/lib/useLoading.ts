"use client";

import { useEffect, useState } from "react";

/**
 * Simula um carregamento inicial (protótipo sem backend) para exercitar
 * os estados de loading/skeleton das telas. Retorna `true` enquanto "carrega".
 */
export function useLoading(ms = 600): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
