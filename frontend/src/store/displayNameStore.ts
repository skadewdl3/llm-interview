import { create } from 'zustand'

export const useDisplayNameStore = create((set) => ({
  displayName: '',
  setDisplayName: (name: string) => set({ displayName: name })
}))
