import React from 'react'
import type { IconProps } from '@harness/icons'
import { FontVariation, FormInput, Layout, Text } from '@harness/uicore'

export interface PipelineConfigOptionInterface {
  label: string
  iconProps: IconProps
  description: string
  drillDown: { hasSubTypes: boolean; subTypes?: PipelineConfigOptionInterface[]; nodeView?: React.ReactElement }
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
            drillDown: {
              hasSubTypes: false,
              nodeView: (
                <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge' }} spacing="xsmall">
                  <FormInput.Text
                    name={'name'}
                    label={<Text font={{ variation: FontVariation.FORM_INPUT_TEXT }}>Name</Text>}
                    placeholder={'stage name'}
                    key={'name'}
                  />
                  <FormInput.Text
                    name={'description'}
                    label={<Text font={{ variation: FontVariation.FORM_INPUT_TEXT }}>Description</Text>}
                    placeholder={'stage description'}
                    key={'description'}
                  />
                </Layout.Vertical>
              )
            }
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
    StudioEntity.Step,
    {
      label: 'Steps',
      iconProps: { name: 'plugin-ci-step', size: 20 },
      description: 'Add a step',
      drillDown: {
        hasSubTypes: true,
        subTypes: [
          {
            label: 'Run Script',
            iconProps: { name: 'run-ci-step', size: 25 },
            description: 'Runs a shell script',
            drillDown: {
              hasSubTypes: false,
              nodeView: (
                <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge' }} spacing="xsmall">
                  <FormInput.Text
                    name={'run'}
                    label={<Text font={{ variation: FontVariation.FORM_INPUT_TEXT }}>Run</Text>}
                    placeholder={'enter command'}
                    key={'run'}
                  />
                </Layout.Vertical>
              )
            }
          },
          {
            label: 'Run a Function',
            iconProps: { name: 'plugin-step', size: 25 },
            description: 'Runs a pipeline function from the Harness function marketplace (slack, docker, etc)',
            drillDown: {
              hasSubTypes: false,
              nodeView: (
                <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge' }} spacing="xsmall">
                  <FormInput.Text
                    name={'uses'}
                    label={<Text font={{ variation: FontVariation.FORM_INPUT_TEXT }}>Uses</Text>}
                    placeholder={''}
                    key={'uses'}
                  />
                  <FormInput.Text
                    name={'repo'}
                    label={<Text font={{ variation: FontVariation.FORM_INPUT_TEXT }}>Repo</Text>}
                    placeholder={'enter repository'}
                    key={'repo'}
                  />
                  <FormInput.Text
                    name={'connector'}
                    label={<Text font={{ variation: FontVariation.FORM_INPUT_TEXT }}>Connector</Text>}
                    placeholder={'specify connector'}
                    key={'connector'}
                  />
                </Layout.Vertical>
              )
            }
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
