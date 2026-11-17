"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface ProductDesign {
  text: string;
  imageUrl: string;
}

interface DesignContextValue {
  design: ProductDesign | null;
  setDesign: (design: ProductDesign | null) => void;
}

const DesignContext = createContext<DesignContextValue>({ design: null, setDesign: () => {} });

// Shares the selected design between the gallery (big image) and the purchase options (design picker).
export function DesignProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<ProductDesign | null>(null);
  return <DesignContext.Provider value={{ design, setDesign }}>{children}</DesignContext.Provider>;
}

export const useDesign = () => useContext(DesignContext);
