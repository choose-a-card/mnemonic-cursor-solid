import { createContext, useContext, createSignal, type Component, onMount, createEffect, type JSX } from 'solid-js'
import type { CustomStack } from '../types'
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/pwa'

interface CustomStacksContextType {
  customStacks: () => CustomStack[]
  addStack: (stack: Omit<CustomStack, 'id' | 'createdAt' | 'updatedAt'>) => CustomStack
  updateStack: (id: string, updates: Partial<Pick<CustomStack, 'name' | 'cards'>>) => void
  deleteStack: (id: string) => void
  getStackById: (id: string) => CustomStack | undefined
}

const CustomStacksContext = createContext<CustomStacksContextType>()

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export const CustomStacksProvider: Component<{ children: JSX.Element }> = (props) => {
  const [customStacks, setCustomStacks] = createSignal<CustomStack[]>([])

  onMount(() => {
    const saved = loadFromLocalStorage<CustomStack[]>('mnemonic-custom-stacks', [])
    setCustomStacks(saved)
  })

  createEffect(() => {
    saveToLocalStorage('mnemonic-custom-stacks', customStacks())
  })

  const addStack = (stackData: Omit<CustomStack, 'id' | 'createdAt' | 'updatedAt'>): CustomStack => {
    const now = Date.now()
    const newStack: CustomStack = {
      ...stackData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    setCustomStacks(prev => [...prev, newStack])
    return newStack
  }

  const updateStack = (id: string, updates: Partial<Pick<CustomStack, 'name' | 'cards'>>) => {
    setCustomStacks(prev => prev.map(stack => {
      if (stack.id !== id) return stack
      return {
        ...stack,
        ...updates,
        updatedAt: Date.now()
      }
    }))
  }

  const deleteStack = (id: string) => {
    setCustomStacks(prev => prev.filter(stack => stack.id !== id))
  }

  const getStackById = (id: string): CustomStack | undefined => {
    return customStacks().find(stack => stack.id === id)
  }

  const contextValue: CustomStacksContextType = {
    customStacks,
    addStack,
    updateStack,
    deleteStack,
    getStackById
  }

  return (
    <CustomStacksContext.Provider value={contextValue}>
      {props.children}
    </CustomStacksContext.Provider>
  )
}

export const useCustomStacks = () => {
  const context = useContext(CustomStacksContext)
  if (!context) {
    throw new Error('useCustomStacks must be used within a CustomStacksProvider')
  }
  return context
}

