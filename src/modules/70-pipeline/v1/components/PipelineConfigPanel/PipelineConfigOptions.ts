import type { IconProps } from '@harness/icons'

export interface PipelineConfigOptionInterface {
  label: string
  iconProps: IconProps
  description: string
}

export const enum PipelineEntity {
  Stage = 'STAGE',
  Trigger = 'TRIGGER',
  Notification = 'NOTIFICATION',
  Input = 'INPUT',
  Barrier = 'BARRIER',
  Clone = 'CLONE',
  Delegate = 'DELEGATE',
  EnvVariable = 'ENVIRONMENT_VARIABLE',
  Registry = 'REGISTRY'
}

export const MainConfigOptions: PipelineConfigOptionInterface[] = [
  { label: 'Stages', iconProps: { name: 'add-stage', size: 20 }, description: 'Add a stage' },
  { label: 'Triggers', iconProps: { name: 'yaml-builder-trigger', size: 20 }, description: 'Add a trigger' },
  { label: 'Notifications', iconProps: { name: 'notifications', size: 20 }, description: 'Add a notification' },
  { label: 'Inputs', iconProps: { name: 'template-inputs', size: 20 }, description: 'Add an input' }
]

export const AdditionalConfigOptions: PipelineConfigOptionInterface[] = [
  { label: 'Barriers', iconProps: { name: 'command-barrier', size: 20 }, description: 'Add a barrier' },
  { label: 'Clone', iconProps: { name: 'code-clone', size: 20 }, description: 'Add a codebase clone' },
  { label: 'Delegates', iconProps: { name: 'main-delegates', size: 20 }, description: 'Add a delegate' },
  {
    label: 'Environment Variables',
    iconProps: { name: 'pipeline-variables', size: 20 },
    description: 'Add an environment variable'
  },
  { label: 'Registry', iconProps: { name: 'azure-container-registry', size: 20 }, description: 'Add a registry' }
]
