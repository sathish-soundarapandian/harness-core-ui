import type { HealthSource } from 'services/cv'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'

export function getHealthSources(formikValues: ContinousVerificationData): HealthSource[] {
  return formikValues?.spec?.monitoredService?.spec?.templateInputs?.sources?.healthSources || []
}
