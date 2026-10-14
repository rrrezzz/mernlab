import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from "../services/api";

const CartContext = createContext(null);

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch cart from backend whenever authenticated user is present
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCartItems(data.cart || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
      const status = err?.response?.status;
      if (status === 401) {
        setCartItems([]);
      } else {
        setError("Unable to load your cart. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ─── ADD TO CART ────────────────────────────────────────────────────────────
  const addToCart = async (productId) => {
    setActionLoadingId(productId);
    try {
      const data = await apiAddToCart(productId);
      if (data.cart) {
        setCartItems(data.cart);
      } else {
        // Fallback: re-fetch
        await refreshCart();
      }
      return { success: true, message: data.message || "Added to cart" };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to add product to cart. Please try again.";
      throw new Error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── UPDATE QUANTITY ────────────────────────────────────────────────────────
  const updateQuantity = async (productId, quantity) => {
    setActionLoadingId(productId);
    try {
      const data = await apiUpdateCartQuantity(productId, quantity);
      if (data.cart) {
        setCartItems(data.cart);
      } else {
        await refreshCart();
      }
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to update quantity. Please try again.";
      throw new Error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── REMOVE FROM CART ───────────────────────────────────────────────────────
  const removeFromCart = async (productId) => {
    setActionLoadingId(productId);
    try {
      const data = await apiRemoveFromCart(productId);
      if (data.cart) {
        setCartItems(data.cart);
      } else {
        setCartItems((prev) =>
          prev.filter(
            (item) => (item.product?._id || item.product) !== productId
          )
        );
      }
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to remove item from cart. Please try again.";
      throw new Error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── DERIVED TOTALS ─────────────────────────────────────────────────────────
  // Total quantity of all items in cart (used for Navbar counter)
  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  // Subtotal in INR: Σ(product.price * quantity)
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * (item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    actionLoadingId,
    totalItems,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
