/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { TestWrapper } from '@common/utils/testUtils'
import { AzureBlueprintVariableView } from '../VariableView'
import { ScopeTypes } from '../../AzureBlueprintTypes.types'

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <AzureBlueprintVariableView
        {...props}
        stageIdentifier="qaStage"
        onUpdate={jest.fn()}
        stepType={StepType.AzureBlueprint}
      />
    </TestWrapper>
  )
}

describe('Azure Blueprint Variable view ', () => {
  test('initial render inline with no values', () => {
    const values = {
      type: StepType.AzureBlueprint,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: '',
          assignmentName: '',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    }
    const data = {
      initialValues: values,
      metadataMap: {},
      variablesData: values
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('render with values', () => {
    const values = {
      type: StepType.AzureBlueprint,
      name: 'blueprint',
      identifier: 'blueprint',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: 'testRef',
          assignmentName: 'name',
          scope: ScopeTypes.Subscription,
          template: {}
        }
      }
    }
    const data = {
      initialValues: values,
      metadataMap: {
        'step-name': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.name',
            localName: 'step.blueprint.name'
          }
        },
        'step-timeout': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.timeout',
            localName: 'step.blueprint.timeout'
          }
        },
        'step-connectorRef': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.connectorRef',
            localName: 'step.blueprint.spec.configuration.connectorRef'
          }
        },
        'step-assignmentName': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.assignmentName',
            localName: 'step.blueprint.spec.configuration.assignmentName'
          }
        },
        'step-scope': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.scope',
            localName: 'step.blueprint.spec.configuration.scope'
          }
        },
        'step-type': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.template.store.type',
            localName: 'step.blueprint.spec.configuration.template.store.type'
          }
        },
        'step-gitFetchType': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.template.store.spec.gitFetchType',
            localName: 'step.blueprint.spec.configuration.template.store.spec.gitFetchType'
          }
        },
        'step-template-connectorRef': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.template.store.spec.connectorRef',
            localName: 'step.blueprint.spec.configuration.template.store.spec.connectorRef'
          }
        },
        'step-branch': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.template.store.spec.branch',
            localName: 'step.blueprint.spec.configuration.template.store.spec.branch'
          }
        },
        'step-path': {
          yamlProperties: {
            fqn: 'pipeline.stages.qaStage.execution.steps.blueprint.spec.configuration.template.store.spec.path',
            localName: 'step.blueprint.spec.configuration.template.store.spec.path'
          }
        }
      },
      variablesData: {}
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render with inline template', () => {
    const values = {
      type: StepType.AzureBlueprint,
      name: 'azureBlueprint',
      identifier: 'azureBlueprint',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: 'testRef',
          assignmentName: 'testName',
          scope: ScopeTypes.Subscription,
          template: {
            store: {
              type: 'Github',
              spec: {
                gitFetchType: 'Branch',
                connectorRef: 'cftest',
                branch: 'master',
                path: ['path_to_the_folder']
              }
            }
          }
        }
      }
    }
    const data = {
      initialValues: values,
      metadataMap: {},
      variablesData: values
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })
})
