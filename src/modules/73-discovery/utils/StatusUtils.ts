import { Color } from '@harness/design-system'
import type { DatabaseDelegateTaskStatus } from 'services/servicediscovery'

export enum DAgentTaskStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  PROCESSED = 'PROCESSED'
}

export const useDAgentStatusColorValue = (status?: DatabaseDelegateTaskStatus): string => {
  switch (status) {
    case DAgentTaskStatus.SUCCESS:
      return Color.GREEN_100
    case DAgentTaskStatus.FAILED:
      return Color.RED_100
    case DAgentTaskStatus.ERROR:
      return Color.ORANGE_100
    case DAgentTaskStatus.PROCESSED:
      return Color.RED_100
    default:
      return Color.GREY_100
  }
}

export const useDAgentStatusTextColor = (status?: DatabaseDelegateTaskStatus): string => {
  switch (status) {
    case DAgentTaskStatus.SUCCESS:
      return Color.GREEN_800
    case DAgentTaskStatus.FAILED:
      return Color.RED_800
    case DAgentTaskStatus.ERROR:
      return Color.ORANGE_800
    case DAgentTaskStatus.PROCESSED:
      return Color.RED_800
    default:
      return Color.GREY_800
  }
}
