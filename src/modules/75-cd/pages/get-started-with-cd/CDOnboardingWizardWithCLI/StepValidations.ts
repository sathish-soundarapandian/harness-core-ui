import { isEmpty } from 'lodash-es'
import { CDOnboardingSteps, WhatToDeployType } from './types'

function validateWhatToDeployStep(data: WhatToDeployType): boolean {
  return !isEmpty(data.svcType?.id) && !isEmpty(data.artifactType?.id)
}
export const STEP_VALIDATION_MAP: { [key: string]: (data: WhatToDeployType) => boolean } = {
  [CDOnboardingSteps.WHAT_TO_DEPLOY]: validateWhatToDeployStep
}
