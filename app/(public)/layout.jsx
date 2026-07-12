'use client'

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth, useUser } from "@clerk/nextjs";

import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MaintenanceGuard from "@/components/MaintenanceGuard";

import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";
import { fetchWishlist } from "@/lib/features/wishlist/wishlistSlice";

export default function PublicLayout({ children }) {
  const dispatch = useDispatch();

  const { user } = useUser();
  const { getToken } = useAuth();

  const { cartItems } = useSelector((state) => state.cart);

  // Load products
  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Load user data
useEffect(() => {
  if (user) {
    dispatch(fetchCart({ getToken }));
    dispatch(fetchAddress({ getToken }));
    dispatch(fetchUserRatings({ getToken }));
    dispatch(fetchWishlist({ getToken }));
  }
}, [user, dispatch, getToken]);

  // Sync cart
  useEffect(() => {
    if (user) {
      dispatch(uploadCart({ getToken }));
    }
  }, [cartItems, user, dispatch, getToken]);

  return (
  <MaintenanceGuard
    banner={<Banner />}
    navbar={<Navbar />}
    footer={<Footer />}
    >
    {children}
  </MaintenanceGuard>
);
}