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
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

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
  test('initial render', () => {
    const values = {
      type: StepType.AzureBlueprint,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
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
      metadataMap: {
        yamlProperties: 'provisionerIdentifier',
        yamlOutputProperties: 'provisionerIdentifier',
        test: 'provisionerIdentifier'
      },
      variablesData: values
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('initial render inline with no values', () => {
    const values = {
      type: StepType.AzureBlueprint,
      name: '',
      identifier: '',
      timeout: '10m',
      spec: {
        provisionerIdentifier: '',
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

  test('should render with inline template', () => {
    const values = {
      type: StepType.AzureBlueprint,
      name: 'azureBlueprint',
      identifier: 'azureBlueprint',
      timeout: '10m',
      spec: {
        provisionerIdentifier: 'azureBlueprint',
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
