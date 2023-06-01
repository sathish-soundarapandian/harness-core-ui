import { VerificationJobType } from '@cv/constants'

export const deploymentTypesToShowNodes: Array<string> = [
  VerificationJobType.CANARY,
  VerificationJobType.BLUE_GREEN,
  VerificationJobType.ROLLING,
  VerificationJobType.NO_ANALYSIS
]

export const defaultDateFormat = 'MMM D, YYYY h:mm A'
