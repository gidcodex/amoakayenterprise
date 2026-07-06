"use client";

import { useEffect } from "react";

export default function MarkDeliveriesSeen() {
  useEffect(() => {
    const markSeen = async () => {
      try {
        await fetch("/api/admin/deliveries/mark-seen", {
          method: "PATCH",
        });
      } catch (error) {
        console.error(error);
      }
    };

    markSeen();
  }, []);

  return null;
}