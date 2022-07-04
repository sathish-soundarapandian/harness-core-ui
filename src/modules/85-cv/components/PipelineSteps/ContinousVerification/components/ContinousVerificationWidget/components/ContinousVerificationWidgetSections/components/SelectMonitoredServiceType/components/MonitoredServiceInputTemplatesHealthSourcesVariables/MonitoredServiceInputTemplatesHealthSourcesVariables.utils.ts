import type {
  ContinousVerificationData,
  MonitoredServiceTemplateVariable
} from '@cv/components/PipelineSteps/ContinousVerification/types'

export function getHealthSourcesVariables(formikValues: ContinousVerificationData): MonitoredServiceTemplateVariable[] {
  return formikValues?.spec?.monitoredService?.spec?.templateInputs?.variables || []
}
