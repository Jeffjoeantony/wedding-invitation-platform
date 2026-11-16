'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

type CartContextValue = {
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ count: 0 }), [])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) {
    throw new Error('useCart must be used within CartProvider')
  }
  return cart
}
