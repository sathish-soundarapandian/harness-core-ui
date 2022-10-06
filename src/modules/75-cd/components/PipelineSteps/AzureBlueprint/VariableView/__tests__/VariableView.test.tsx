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

import metaData from './MetaDataMap'
import variablesData from './VariablesData'

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <AzureBlueprintVariableView
        initialValues={props.initialValues}
        {...{
          stageIdentifier: 'qaStage',
          metadataMap: props.metadataMap,
          variablesData: props.variablesData
        }}
        onUpdate={jest.fn()}
        stepType={StepType.AzureBlueprint}
      />
    </TestWrapper>
  )
}

describe('Azure Blueprint Variable view ', () => {
  test('should render with inline template', () => {
    const values = {
      type: StepType.AzureBlueprint,
      name: 'blue',
      identifier: 'blue',
      timeout: '10m',
      spec: {
        configuration: {
          connectorRef: 'azureRef',
          assignmentName: 'testName',
          scope: ScopeTypes.Subscription,
          template: {
            store: {
              type: 'Github',
              spec: {
                gitFetchType: 'Branch',
                connectorRef: 'cftest',
                branch: 'master',
                path: ['template/path']
              }
            }
          }
        }
      }
    }
    const data = {
      initialValues: values,
      variablesData: variablesData,
      metadataMap: metaData
    }
    const { getByText } = renderComponent(data)
    const assignmentName = getByText('assignmentName')
    expect(assignmentName).toBeInTheDocument()

    const testName = getByText('testName')
    expect(testName).toBeInTheDocument()

    const connectorRef = getByText('azureRef')
    expect(connectorRef).toBeInTheDocument()

    const templateFile = getByText('cd.cloudFormation.templateFile')
    expect(templateFile).toBeInTheDocument()

    const branch = getByText('branch')
    expect(branch).toBeInTheDocument()

    const master = getByText('master')
    expect(master).toBeInTheDocument()
  })
})
