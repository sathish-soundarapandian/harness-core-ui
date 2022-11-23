import { VerificationJobType } from '@cv/constants'
import type { AdditionalInfo } from 'services/cv'

export const deploymentTypesToShowNodes: Array<AdditionalInfo['type']> = [
  VerificationJobType.CANARY,
  VerificationJobType.BLUE_GREEN,
  VerificationJobType.ROLLING
]
