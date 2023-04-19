import type { IconProps } from '@harness/icons'

export interface PipelineConfigOptionInterface {
  label: string
  iconProps: IconProps
  description: string
}

export const enum Entity {
  Pipeline = 'PIPELINE',
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

export const MainConfigOptionsMap = new Map<Entity, PipelineConfigOptionInterface>([
  [
    Entity.Stage,
    {
      label: 'Stages',
      iconProps: { name: 'add-stage', size: 20 },
      description: 'Add a stage'
    }
  ],
  [
    Entity.Trigger,
    { label: 'Triggers', iconProps: { name: 'yaml-builder-trigger', size: 20 }, description: 'Add a trigger' }
  ],
  [
    Entity.Notification,
    { label: 'Notifications', iconProps: { name: 'notifications', size: 20 }, description: 'Add a notification' }
  ],
  [Entity.Input, { label: 'Inputs', iconProps: { name: 'template-inputs', size: 20 }, description: 'Add an input' }]
])

const AdditionalConfigOptionsMap = new Map<Entity, PipelineConfigOptionInterface>([
  [
    Entity.Barrier,
    {
      label: 'Barriers',
      iconProps: { name: 'command-barrier', size: 20 },
      description: 'Add a barrier'
    }
  ],
  [
    Entity.Clone,
    {
      label: 'Clone',
      iconProps: { name: 'code-clone', size: 20 },
      description: 'Add a codebase clone'
    }
  ],
  [
    Entity.Delegate,
    {
      label: 'Delegates',
      iconProps: { name: 'main-delegates', size: 20 },
      description: 'Add a delegate'
    }
  ],
  [
    Entity.EnvVariable,
    {
      label: 'Environment Variables',
      iconProps: { name: 'pipeline-variables', size: 20 },
      description: 'Add an environment variable'
    }
  ],
  [
    Entity.Registry,
    {
      label: 'Registry',
      iconProps: { name: 'azure-container-registry', size: 20 },
      description: 'Add a registry'
    }
  ]
])

export const ConfigOptionsMapWithAdditionalOptions = new Map([
  ...Array.from(MainConfigOptionsMap.entries()),
  ...Array.from(AdditionalConfigOptionsMap.entries())
])
