"use client";

import { useContext } from "react";
import AdetoBoafoContext from "./AdetoBoafoContext";

export default function useAdetoBoafo() {
  const context = useContext(AdetoBoafoContext);

  if (!context) {
    throw new Error(
      "useAdetoBoafo must be used inside AdetoBoafoProvider"
    );
  }

  return context;
}