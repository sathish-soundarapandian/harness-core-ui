/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor, queryByAttribute } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import * as CDNG from 'services/cd-ng'
import { SshWinRmAwsInfrastructureSpec, ConnectorRefRegex, SshKeyRegex } from '../SshWinRmAwsInfrastructureSpec'
import { ConnectorsResponse } from './mock/ConnectorsResponse.mock'
import { ConnectorResponse } from './mock/ConnectorResponse.mock'
import { mockListSecrets, mockSecret } from './mock/Secrets.mock'
import { regionsResponse, tagsResponse } from './mock/Aws.mock'

const getYaml = (): string => `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: SshWinRmAws
                          spec:
                              connectorRef: account.connectorRef`

const infraDefPath = 'pipeline.stages[0].stage.spec.infrastructure.infrastructureDefinition'
const accountIdParams = { accountId: 'accountId1' }

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(ConnectorsResponse.data)),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockListSecrets)),
  useRegionsForAws: jest.fn(() => regionsResponse),
  useTags: jest.fn(() => tagsResponse),
  useTagsV2: jest.fn(() => tagsResponse)
}))

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

const getRuntimeInputsValues = () => ({
  credentialsRef: RUNTIME_INPUT_VALUE
})

const getInitialValues = () => ({
  connectorRef: 'connectorId1',
  credentialsRef: 'credentialsRef',
  region: 'region1',
  awsInstanceFilter: {
    vpcs: [],
    tags: {}
  }
})

const getEmptyInitialValues = () => ({
  credentialsRef: ''
})

const checkForFormInit = async (container: HTMLElement) => {
  const form = container.querySelector('form')
  return await waitFor(() => {
    expect(form!).toBeDefined()
  })
}

const submitForm = async (getByText: any) => {
  await act(async () => {
    fireEvent.click(getByText('Submit'))
  })
}

describe('Test SshWinRmAwsInfrastructureSpec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new SshWinRmAwsInfrastructureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.SshWinRmAws}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )
    await checkForFormInit(container)
    await submitForm(getByText)
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.SshWinRmAws}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )
    await checkForFormInit(container)
    await submitForm(getByText)
    expect(onUpdateHandler).not.toHaveBeenCalled()
  })
})

describe('Test SshWinRmAwsEdit form', () => {
  beforeEach(() => {
    factory.registerStep(new SshWinRmAwsInfrastructureSpec())
  })

  test('Render and basic flow on edit form', async () => {
    const onUpdateHandler = jest.fn()
    const { container, getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.SshWinRmAws}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
      />
    )

    const regionIdSelect = getByPlaceholderText('pipeline.regionPlaceholder')
    regionIdSelect.focus()
    await waitFor(() => expect(regionsResponse.refetch).toBeCalled())

    const tagsSelect = queryByAttribute('name', container, 'tags')
    tagsSelect!.focus()
    await waitFor(() => expect(tagsResponse.refetch).toBeCalled())
  })
})

describe('Test SshWinRmAws InputVariable component', () => {
  beforeEach(() => {
    factory.registerStep(new SshWinRmAwsInfrastructureSpec())
  })

  test('Render component with as type InputVariable', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.SshWinRmAws}
        stepViewType={StepViewType.InputVariable}
        onUpdate={onUpdateHandler}
        customStepProps={{
          variablesData: {
            infrastructureDefinition: {
              spec: {
                credentialsRef: 'credRef1'
              }
            }
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('invocation map test', () => {
  test('invocation map, empty yaml', () => {
    const yaml = ''
    const invocationMap = factory.getStep(StepType.SshWinRmAws)?.getInvocationMap?.()
    invocationMap?.get(ConnectorRefRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.getConnectorListV2Promise).not.toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.listSecretsV2Promise).not.toBeCalled()
  })

  test('invocation map, wrong yaml', () => {
    const yaml = {} as string
    const invocationMap = factory.getStep(StepType.SshWinRmAws)?.getInvocationMap?.()
    invocationMap?.get(ConnectorRefRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.getConnectorListV2Promise).not.toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.listSecretsV2Promise).not.toBeCalled()
  })

  test('invocation map should call template list', () => {
    jest.spyOn(CDNG, 'listSecretsV2Promise').mockImplementationOnce(() => Promise.resolve(mockListSecrets as any))
    jest
      .spyOn(CDNG, 'getConnectorListV2Promise')
      .mockImplementationOnce(() => Promise.resolve(ConnectorsResponse.data as any))

    const yaml = getYaml()

    const invocationMap = factory.getStep(StepType.SshWinRmAws)?.getInvocationMap?.()
    invocationMap?.get(ConnectorRefRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.getConnectorListV2Promise).toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.listSecretsV2Promise).toBeCalled()
  })
})
