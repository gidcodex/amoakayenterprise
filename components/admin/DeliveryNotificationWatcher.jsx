"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Truck } from "lucide-react";

export default function DeliveryNotificationWatcher() {
  const [count, setCount] = useState(0);
  const previousCount = useRef(null);

  useEffect(() => {
    const checkDeliveries = async () => {
      try {
        const res = await fetch("/api/admin/delivery-count");
        const data = await res.json();

        if (previousCount.current === null) {
          previousCount.current = data.count;
          setCount(data.count);
          return;
        }

        if (data.count > previousCount.current) {
          toast.success(`New order received. You have ${data.count} unseen order(s).`, {
            duration: 6000,
            icon: "🚚",
          });
        }

        previousCount.current = data.count;
        setCount(data.count);
      } catch (error) {
        console.error(error);
      }
    };

    checkDeliveries();

    const interval = setInterval(checkDeliveries, 15000);

    return () => clearInterval(interval);
  }, []);

  return null;
}