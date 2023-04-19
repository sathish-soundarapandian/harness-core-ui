import type { IconProps } from '@harness/icons'

export interface PipelineConfigOptionInterface {
  name: string
  iconProps: IconProps
  description: string
}

export const MainConfigOptions: PipelineConfigOptionInterface[] = [
  { name: 'Stages', iconProps: { name: 'add-stage', size: 20 }, description: 'Add a stage' },
  { name: 'Triggers', iconProps: { name: 'yaml-builder-trigger', size: 20 }, description: 'Add a trigger' },
  { name: 'Notifications', iconProps: { name: 'notifications', size: 20 }, description: 'Add a notification' },
  { name: 'Inputs', iconProps: { name: 'template-inputs', size: 20 }, description: 'Add an input' }
]

export const AdditionalConfigOptions: PipelineConfigOptionInterface[] = [
  { name: 'Barriers', iconProps: { name: 'command-barrier', size: 20 }, description: 'Add a barrier' },
  { name: 'Clone', iconProps: { name: 'code-clone', size: 20 }, description: 'Add a codebase clone' },
  { name: 'Delegates', iconProps: { name: 'main-delegates', size: 20 }, description: 'Add a delegate' },
  {
    name: 'Environment Variables',
    iconProps: { name: 'pipeline-variables', size: 20 },
    description: 'Add an environment variable'
  },
  { name: 'Registry', iconProps: { name: 'azure-container-registry', size: 20 }, description: 'Add a registry' }
]
