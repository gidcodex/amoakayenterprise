import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

let debounceTimer = null;

export const uploadCart = createAsyncThunk(
  "cart/uploadCart",
  async ({ getToken }, thunkAPI) => {
    try {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(async () => {
        const { cartItems } = thunkAPI.getState().cart;
        const token = await getToken();

        await axios.post(
          "/api/cart",
          { cart: cartItems },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }, 1000);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { error: error.message }
      );
    }
  }
);

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { error: error.message }
      );
    }
  }
);

const getCartKey = (productId, variantId) =>
  variantId ? `${productId}-${variantId}` : productId;

const normalizeCartItem = (cartKey, item) => {
  if (typeof item === "number") {
    return {
      productId: cartKey,
      variantId: null,
      variant: null,
      quantity: item,
    };
  }

  return {
    productId: item.productId,
    variantId: item.variantId || null,
    variant: item.variant || null,
    quantity: item.quantity || 0,
  };
};

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    total: 0,
    cartItems: {},
  },

  reducers: {
    addToCart: (state, action) => {
      const { productId, variantId = null, variant = null } = action.payload;
      const cartKey = getCartKey(productId, variantId);

      if (state.cartItems[cartKey]) {
        const existingItem = normalizeCartItem(
          cartKey,
          state.cartItems[cartKey]
        );

        existingItem.quantity += 1;
        state.cartItems[cartKey] = existingItem;
      } else {
        state.cartItems[cartKey] = {
          productId,
          variantId,
          variant,
          quantity: 1,
        };
      }

      state.total += 1;
    },

    removeFromCart: (state, action) => {
      const { productId, variantId = null } = action.payload;
      const cartKey = getCartKey(productId, variantId);

      if (!state.cartItems[cartKey]) return;

      const existingItem = normalizeCartItem(cartKey, state.cartItems[cartKey]);
      existingItem.quantity -= 1;

      if (existingItem.quantity <= 0) {
        delete state.cartItems[cartKey];
      } else {
        state.cartItems[cartKey] = existingItem;
      }

      state.total = Math.max(state.total - 1, 0);
    },

    deleteItemFromCart: (state, action) => {
      const { productId, variantId = null } = action.payload;
      const cartKey = getCartKey(productId, variantId);

      if (!state.cartItems[cartKey]) return;

      const existingItem = normalizeCartItem(cartKey, state.cartItems[cartKey]);

      state.total = Math.max(state.total - existingItem.quantity, 0);
      delete state.cartItems[cartKey];
    },

    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      const rawCart = action.payload.cart || {};
      const normalizedCart = {};

      Object.entries(rawCart).forEach(([cartKey, item]) => {
        normalizedCart[cartKey] = normalizeCartItem(cartKey, item);
      });

      state.cartItems = normalizedCart;

      state.total = Object.values(normalizedCart).reduce(
        (acc, item) => acc + (item.quantity || 0),
        0
      );
    });
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  deleteItemFromCart,
} = cartSlice.actions;

export default cartSlice.reducer;