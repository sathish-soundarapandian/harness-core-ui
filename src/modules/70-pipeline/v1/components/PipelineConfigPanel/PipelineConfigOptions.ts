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
