import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'

const rootReducer = combineReducers({ auth: authReducer, ui: uiReducer })
const KEY = 'cms_auth'
function load() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return undefined
    const a = JSON.parse(raw)
    return { auth: { ...a, isLoading: false, error: null } }
  } catch {
    return undefined
  }
}

export const store = configureStore({
  preloadedState: load() as any,
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

store.subscribe(() => {
  try {
    const { user, accessToken, refreshToken, isAuthenticated } = store.getState().auth
    if (isAuthenticated) sessionStorage.setItem(KEY, JSON.stringify({ user, accessToken, refreshToken, isAuthenticated }))
    else sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
})
