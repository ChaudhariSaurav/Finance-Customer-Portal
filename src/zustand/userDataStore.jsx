import { create } from "zustand";
import { persist } from "zustand/middleware";

const useDataStore = create(
    persist(
        (set) => ({
            isLoggedIn: false,
            data: [],
            user: null,
            setUser: (userData) => set({ user: userData,isLoggedIn: true }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: "UserData",
            localStorage: () => localStorage,
        }
    )
);

export default useDataStore;