"use client"

import { create } from "zustand"
import { mockUser } from "@/lib/mock-data"

export const useAuth = create((set, get) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  login: (email, password) => {
    // Mock login - always succeeds with demo user
    set({ user: mockUser })
    return Promise.resolve({ success: true, user: mockUser })
  },
  register: (userData) => {
    // Mock register - always succeeds with new user data
    const newUser = { ...mockUser, ...userData, id: Date.now() }
    set({ user: newUser })
    return Promise.resolve({ success: true, user: newUser })
  },
  logout: () => {
    set({ user: null })
    return Promise.resolve()
  },
  checkAuth: () => {
    // For demo, no persistent auth
    set({ isLoading: false })
    return Promise.resolve()
  },
}))
