import { useState } from 'react'
import { usePolling } from '@common/hooks/usePolling'
import { RestResponseDelegateHeartbeatDetails, useGetDelegatesHeartbeatDetailsV2 } from 'services/portal'
import { DELETAGE_POLL_COUNT_INTERVAL_MS, MAX_DELETAGE_POLL_COUNT } from './Constants'
interface PollStatusParams {
  accountId: string
  projectId: string
  orgId: string
  delegateName?: string
  debounce?: number
}
interface PollHookReturnType {
  data: RestResponseDelegateHeartbeatDetails | null
  loading: boolean
  cancelPoll: () => void
  startPoll: () => void
  isPolling: boolean
}
export function usePollDelagateStatus({
  accountId,
  projectId,
  orgId,
  delegateName,
  debounce = 200
}: PollStatusParams): PollHookReturnType {
  const [pollCount, setPollCount] = useState(0)
  const {
    data,
    loading,
    refetch: verifyHeartBeat
  } = useGetDelegatesHeartbeatDetailsV2({
    queryParams: {
      accountId,
      projectId,
      orgId,
      delegateName
    },
    lazy: true
  })

  const cancelPoll = (): void => {
    setPollCount(-1)
  }
  const startPoll = (): void => {
    setPollCount(1)
  }
  const fetchDelegate = async (): Promise<void> => {
    verifyHeartBeat()
    setPollCount(pollCount + 1)
  }
  const isPolling = usePolling(fetchDelegate, {
    startPolling: Boolean(delegateName) && pollCount > 0 && pollCount < MAX_DELETAGE_POLL_COUNT,
    pollingInterval: DELETAGE_POLL_COUNT_INTERVAL_MS
  })

  return { data, loading, cancelPoll, startPoll, isPolling }
}
