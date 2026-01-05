import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UnsplashImage } from '../services/unsplash';

interface UserState {
    username: string;
    color: string;
    selectedImage: UnsplashImage | null;
    setSelectedImage: (image: UnsplashImage | null) => void;
}

const ADJECTIVES = ['Happy', 'Swift', 'Clever', 'Bright', 'Cool', 'Epic', 'Kind', 'Bold'];
const NOUNS = ['Panda', 'Eagle', 'Fox', 'Tiger', 'Whale', 'Lion', 'Wolf', 'Deer'];
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const generateRandomUser = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const number = Math.floor(Math.random() * 1000);
    return {
        username: `${adj}${noun}${number}`,
        color,
    };
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            ...generateRandomUser(),
            selectedImage: null,
            setSelectedImage: (image) => set({ selectedImage: image }),
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({ username: state.username, color: state.color }), // Don't persist selectedImage
        }
    )
);
