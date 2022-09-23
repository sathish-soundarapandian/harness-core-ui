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
import { AzureArmVariableView } from '../AzureArmVariableView'
import metaData from './MetaDataMap'
import variablesData from './VariablesData'

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <AzureArmVariableView
        initialValues={props.initialValues}
        {...{
          stageIdentifier: 'qaStage',
          metadataMap: props.metadataMap,
          variablesData: props.variablesData
        }}
        onUpdate={jest.fn()}
        stepType={StepType.CreateAzureARMResource}
      />
    </TestWrapper>
  )
}

describe('Azure Blueprint Variable view ', () => {
  test('render variavle view', () => {
    const data = {
      initialValues: {
        type: 'AzureCreateARMResource',
        name: 'arm',
        identifier: 'arm',
        spec: {
          provisionerIdentifier: 'arm',
          configuration: {
            connectorRef: 'account.TestAzure',
            template: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: 'account.git9march',
                  gitFetchType: 'Branch',
                  branch: 'main',
                  paths: ['test/path']
                }
              }
            },
            scope: {
              type: 'ResourceGroup',
              spec: {
                subscription: '<+input>',
                resourceGroup: '<+input>',
                mode: 'Complete'
              }
            },
            parameters: {
              store: {
                type: 'Github',
                spec: {
                  connectorRef: 'account.vikyathGithub',
                  gitFetchType: 'Branch',
                  branch: 'main',
                  paths: ['param/path']
                }
              }
            }
          }
        },
        timeout: '10m'
      },
      variablesData: variablesData,
      metadataMap: metaData
    }
    const { getByText, getAllByText } = renderComponent(data)

    const azureRef = getByText('account.TestAzure')
    expect(azureRef).toBeInTheDocument()

    const gitRef = getByText('account.TestAzure')
    expect(gitRef).toBeInTheDocument()

    const githubRef = getByText('account.vikyathGithub')
    expect(githubRef).toBeInTheDocument()

    const branchName = getAllByText('main')
    expect(branchName.length).toEqual(2)

    const paramPath = getByText('param/path')
    expect(paramPath).toBeInTheDocument()

    const templatePath = getByText('test/path')
    expect(templatePath).toBeInTheDocument()
  })
})
