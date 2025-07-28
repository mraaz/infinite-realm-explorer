import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserDataStatus, getUserSettings } from '@/services/apiService'

// Query keys for caching
export const authQueryKeys = {
  userDataStatus: (token: string) => ['userDataStatus', token],
  userSettings: (token: string) => ['userSettings', token],
}

// Hook for user data status (pulse check, future self data)
export const useUserDataStatus = (token: string | null) => {
  return useQuery({
    queryKey: authQueryKeys.userDataStatus(token || ''),
    queryFn: () => getUserDataStatus(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for user settings
export const useUserSettings = (token: string | null) => {
  return useQuery({
    queryKey: authQueryKeys.userSettings(token || ''),
    queryFn: () => getUserSettings(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to invalidate auth-related queries (for logout)
export const useInvalidateAuthQueries = () => {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.removeQueries({ queryKey: ['userDataStatus'] })
    queryClient.removeQueries({ queryKey: ['userSettings'] })
  }
}