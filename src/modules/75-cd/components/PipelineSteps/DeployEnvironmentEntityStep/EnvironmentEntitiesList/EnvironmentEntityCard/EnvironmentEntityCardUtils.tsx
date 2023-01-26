import type { StringKeys } from 'framework/strings'

export function getToggleTextStringKey(
  showInputs: boolean,
  showEnvironmentInputs: boolean,
  showServiceOverrideInputs: boolean
): StringKeys {
  if (showInputs) {
    if (showEnvironmentInputs && showServiceOverrideInputs) {
      return 'cd.pipelineSteps.environmentTab.hideEnvironmentServiceOverrideInputs'
    } else if (showEnvironmentInputs) {
      return 'cd.pipelineSteps.environmentTab.hideEnvironmentInputs'
    } else {
      return 'cd.pipelineSteps.environmentTab.hideServiceOverrideInputs'
    }
  } else {
    if (showEnvironmentInputs && showServiceOverrideInputs) {
      return 'cd.pipelineSteps.environmentTab.viewEnvironmentServiceOverrideInputs'
    } else if (showEnvironmentInputs) {
      return 'cd.pipelineSteps.environmentTab.viewEnvironmentInputs'
    } else {
      return 'cd.pipelineSteps.environmentTab.viewServiceOverrideInputs'
    }
  }
}
