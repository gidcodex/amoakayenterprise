"use client";

import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useDispatch } from "react-redux";
import { fetchWishlist } from "@/lib/features/wishlist/wishlistSlice";

export default function WishlistInitializer() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    dispatch(
      fetchWishlist({
        getToken,
      })
    );

  }, [user, getToken, dispatch]);


  return null;
}