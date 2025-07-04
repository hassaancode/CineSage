import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ThemeState = {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default to dark as per UI style
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'cinesage-theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
