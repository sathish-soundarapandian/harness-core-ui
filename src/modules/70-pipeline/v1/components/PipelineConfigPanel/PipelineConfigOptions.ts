import type { IconProps } from '@harness/icons'

export interface PipelineConfigOptionInterface {
  entity: PipelineEntity
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
  {
    entity: PipelineEntity.Stage,
    label: 'Stages',
    iconProps: { name: 'add-stage', size: 20 },
    description: 'Add a stage'
  },
  {
    entity: PipelineEntity.Trigger,
    label: 'Triggers',
    iconProps: { name: 'yaml-builder-trigger', size: 20 },
    description: 'Add a trigger'
  },
  {
    entity: PipelineEntity.Notification,
    label: 'Notifications',
    iconProps: { name: 'notifications', size: 20 },
    description: 'Add a notification'
  },
  {
    entity: PipelineEntity.Input,
    label: 'Inputs',
    iconProps: { name: 'template-inputs', size: 20 },
    description: 'Add an input'
  }
]

export const AdditionalConfigOptions: PipelineConfigOptionInterface[] = [
  {
    entity: PipelineEntity.Barrier,
    label: 'Barriers',
    iconProps: { name: 'command-barrier', size: 20 },
    description: 'Add a barrier'
  },
  {
    entity: PipelineEntity.Clone,
    label: 'Clone',
    iconProps: { name: 'code-clone', size: 20 },
    description: 'Add a codebase clone'
  },
  {
    entity: PipelineEntity.Delegate,
    label: 'Delegates',
    iconProps: { name: 'main-delegates', size: 20 },
    description: 'Add a delegate'
  },
  {
    entity: PipelineEntity.EnvVariable,
    label: 'Environment Variables',
    iconProps: { name: 'pipeline-variables', size: 20 },
    description: 'Add an environment variable'
  },
  {
    entity: PipelineEntity.Registry,
    label: 'Registry',
    iconProps: { name: 'azure-container-registry', size: 20 },
    description: 'Add a registry'
  }
]
