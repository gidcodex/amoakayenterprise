import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.wishlist;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { error: error.message }
      );
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async ({ productId, getToken }, thunkAPI) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/wishlist",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { productId, ...data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { error: error.message }
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    ids: [],
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.ids = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      state.items = action.payload || [];
      state.ids = state.items.map((item) => item.productId);
    });

    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      const { productId, wished } = action.payload;

      if (wished) {
        if (!state.ids.includes(productId)) {
          state.ids.push(productId);
        }
      } else {
        state.ids = state.ids.filter((id) => id !== productId);
        state.items = state.items.filter((item) => item.productId !== productId);
      }
    });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;