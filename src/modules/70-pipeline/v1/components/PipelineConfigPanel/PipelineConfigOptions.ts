import type { IconProps } from '@harness/icons'

export interface PipelineConfigOptionInterface {
  label: string
  iconProps: IconProps
  description: string
  drillDown: { hasSubTypes: boolean; subTypes?: PipelineConfigOptionInterface[] }
}

export const enum StudioEntity {
  Pipeline = 'PIPELINE',
  Stage = 'STAGE',
  Step = 'STEP',
  Trigger = 'TRIGGER',
  Notification = 'NOTIFICATION',
  Input = 'INPUT',
  Barrier = 'BARRIER',
  Clone = 'CLONE',
  Delegate = 'DELEGATE',
  EnvVariable = 'ENVIRONMENT_VARIABLE',
  Registry = 'REGISTRY'
}

export const MainConfigOptionsMap = new Map<StudioEntity, PipelineConfigOptionInterface>([
  [
    StudioEntity.Stage,
    {
      label: 'Stages',
      iconProps: { name: 'add-stage', size: 20 },
      description: 'Add a stage',
      drillDown: {
        hasSubTypes: true,
        subTypes: [
          {
            label: 'Continuous Integration',
            iconProps: { name: 'ci-main', size: 25 },
            description: 'Add a CI stage',
            drillDown: { hasSubTypes: false }
          },
          {
            label: 'Continuous Deployment',
            iconProps: { name: 'cd-main', size: 25 },
            description: 'Add a CD stage',
            drillDown: { hasSubTypes: false }
          }
        ]
      }
    }
  ],
  [
    StudioEntity.Trigger,
    {
      label: 'Triggers',
      iconProps: { name: 'yaml-builder-trigger', size: 20 },
      description: 'Add a trigger',
      drillDown: { hasSubTypes: true, subTypes: [] }
    }
  ],
  [
    StudioEntity.Notification,
    {
      label: 'Notifications',
      iconProps: { name: 'notifications', size: 20 },
      description: 'Add a notification',
      drillDown: { hasSubTypes: true, subTypes: [] }
    }
  ],
  [
    StudioEntity.Input,
    {
      label: 'Inputs',
      iconProps: { name: 'template-inputs', size: 20 },
      description: 'Add an input',
      drillDown: { hasSubTypes: false }
    }
  ]
])

const AdditionalConfigOptionsMap = new Map<StudioEntity, PipelineConfigOptionInterface>([
  [
    StudioEntity.Barrier,
    {
      label: 'Barriers',
      iconProps: { name: 'command-barrier', size: 20 },
      description: 'Add a barrier',
      drillDown: { hasSubTypes: true, subTypes: [] }
    }
  ],
  [
    StudioEntity.Clone,
    {
      label: 'Clone',
      iconProps: { name: 'code-clone', size: 20 },
      description: 'Add a codebase clone',
      drillDown: { hasSubTypes: false }
    }
  ],
  [
    StudioEntity.Delegate,
    {
      label: 'Delegates',
      iconProps: { name: 'main-delegates', size: 20 },
      description: 'Add a delegate',
      drillDown: { hasSubTypes: true, subTypes: [] }
    }
  ],
  [
    StudioEntity.EnvVariable,
    {
      label: 'Environment Variables',
      iconProps: { name: 'pipeline-variables', size: 20 },
      description: 'Add an environment variable',
      drillDown: { hasSubTypes: false }
    }
  ],
  [
    StudioEntity.Registry,
    {
      label: 'Registry',
      iconProps: { name: 'azure-container-registry', size: 20 },
      description: 'Add a registry',
      drillDown: { hasSubTypes: true, subTypes: [] }
    }
  ]
])

export const ConfigOptionsMapWithAdditionalOptions = new Map([
  ...Array.from(MainConfigOptionsMap.entries()),
  ...Array.from(AdditionalConfigOptionsMap.entries())
])
