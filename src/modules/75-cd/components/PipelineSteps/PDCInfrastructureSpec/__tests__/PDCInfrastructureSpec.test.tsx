/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { PDCInfrastructureSpec } from '../PDCInfrastructureSpec'
import { ConnectorsResponse } from './mock/ConnectorsResponse.mock'
import { ConnectorResponse } from './mock/ConnectorResponse.mock'

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'connectorPass',
      identifier: 'connectorPass',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1606373702954,
    updatedAt: 1606373702954,
    draft: false
  },
  metaData: null,
  correlationId: '0346aa2b-290e-4892-a7f0-4ad2128c9829'
}

const mockListSecrets = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretFile',
          name: 'nfile1',
          identifier: 'nfile1',
          tags: {},
          description: 'desc',
          spec: {
            secretManagerIdentifier: 'vault1'
          }
        },
        createdAt: 1602137372269,
        updatedAt: 1602137372269,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'eae05856-9cc0-450d-9d18-b459320311ff'
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(ConnectorsResponse.data)),
  useValidateSshHosts: jest.fn(() => jest.fn(() => ({ mutate: jest.fn() }))),
  useFilterHostsByConnector: jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ data: { content: [] } })) })),
  useValidateHosts: jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ data: { content: [] } })) })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockListSecrets))
}))

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

const getRuntimeInputsValues = () => ({
  credentialsRef: RUNTIME_INPUT_VALUE
})

const getInitialValues = () => ({
  credentialsRef: 'credentialsRef',
  connectorRef: 'connectorRefId',
  hosts: ['localhost', '1.2.3.4'],
  delegateSelectors: ['tag1'],
  sshKey: 'sshkey1'
})

const getEmptyInitialValues = () => ({
  credentialsRef: ''
})

describe('Test PDCInfrastructureSpec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText } = render(
      <TestStepWidget
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })

  test('open hosts table - empty', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await waitFor(() => {
      expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('cd.steps.pdcStep.previewHosts'))
    })

    expect(getByText('cd.steps.pdcStep.noHosts')).toBeDefined()
  })
})
