import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'
import { useAuthStore } from '../store/hooks'
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../services/apiClient'
import type { ApiResponse, AuthResponse } from '../types'

export function useLogin() {
  const { setCredentials } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (response: ApiResponse<AuthResponse>) => {
      setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    },
  })
}

export function useRegister() {
  const { setCredentials } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.register(data),
    onSuccess: (response: ApiResponse<AuthResponse>) => {
      setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      logout()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => apiClient.forgotPassword(data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => apiClient.resetPassword(data),
  })
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}