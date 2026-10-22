import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Auth hooks
export const useAuthStore = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken, refreshToken, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  )

  const setCredentials = (credentials: { user: RootState['auth']['user']; accessToken: string; refreshToken: string }) => {
    dispatch({ type: 'auth/setCredentials', payload: credentials })
  }

  const setUser = (user: RootState['auth']['user']) => {
    dispatch({ type: 'auth/setUser', payload: user })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'auth/setLoading', payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: 'auth/setError', payload: error })
  }

  const logout = () => {
    dispatch({ type: 'auth/logout' })
  }

  const updateProfile = (profile: Partial<RootState['auth']['user']>) => {
    dispatch({ type: 'auth/updateProfile', payload: profile })
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    setCredentials,
    setUser,
    setLoading,
    setError,
    logout,
    updateProfile,
  }
}

// UI hooks
export const useUIStore = () => {
  const dispatch = useAppDispatch()
  const { sidebarOpen, mobileMenuOpen, theme, notifications } = useAppSelector(
    (state) => state.ui
  )

  const toggleSidebar = () => {
    dispatch({ type: 'ui/toggleSidebar' })
  }

  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: 'ui/setSidebarOpen', payload: open })
  }

  const toggleMobileMenu = () => {
    dispatch({ type: 'ui/toggleMobileMenu' })
  }

  const setMobileMenuOpen = (open: boolean) => {
    dispatch({ type: 'ui/setMobileMenuOpen', payload: open })
  }

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'ui/setTheme', payload: theme })
  }

  const addNotification = (notification: RootState['ui']['notifications'][0]) => {
    dispatch({ type: 'ui/addNotification', payload: notification })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: 'ui/removeNotification', payload: id })
  }

  const clearNotifications = () => {
    dispatch({ type: 'ui/clearNotifications' })
  }

  return {
    sidebarOpen,
    mobileMenuOpen,
    theme,
    notifications,
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    setTheme,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}