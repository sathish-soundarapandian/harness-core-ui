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
import * as CDNG from 'services/cd-ng'
import { PDCInfrastructureSpec, PdcRegex, SshKeyRegex, parseAttributes } from '../PDCInfrastructureSpec'
import { ConnectorsResponse } from './mock/ConnectorsResponse.mock'
import { ConnectorResponse } from './mock/ConnectorResponse.mock'
import { mockListSecrets, mockSecret } from './mock/Secrets.mock'

const getYaml = (): string => `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: Pdc
                          spec:
                              connectorRef: account.connectorRef`

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const validateHosts = jest.fn().mockImplementation(() => Promise.resolve({ data: { content: [] } }))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(ConnectorsResponse.data)),
  useValidateSshHosts: jest.fn(() => jest.fn(() => ({ mutate: jest.fn() }))),
  useFilterHostsByConnector: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({ data: { content: [{ hostname: '1.2.3.4' }] } }))
  })),
  useValidateHosts: jest.fn(() => ({ mutate: validateHosts })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockListSecrets))
}))

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

const getRuntimeInputsValues = () => ({
  credentialsRef: RUNTIME_INPUT_VALUE
})

const getInitialValuesNoPreconfigured = () => ({
  credentialsRef: 'credentialsRef',
  hosts: ['localhost', '1.2.3.4'],
  delegateSelectors: ['tag1'],
  sshKey: 'sshkey1'
})

const getInitialValuesPreconfigured = () => ({
  ...getInitialValuesNoPreconfigured(),
  connectorRef: 'connectorRef1'
})

const getInitialValuesPreconfiguredWithAttributes = () => ({
  ...getInitialValuesPreconfigured(),
  attributeFilters: { hostType: 'DB' }
})

const getEmptyInitialValues = () => ({
  credentialsRef: ''
})

describe('Test PDCInfrastructureSpec behavior - No Preconfigured', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesNoPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesNoPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValuesNoPreconfigured())
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })

  test('populate hosts, and open hosts table', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesNoPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesNoPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    const hostsArea = container.querySelector('textarea')
    act(() => {
      fireEvent.change(hostsArea!, { target: { value: 'localhost, 1.2.3.4' } })
    })

    await waitFor(() => {
      expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('cd.steps.pdcStep.previewHosts'))
    })

    expect(getByText('cd.steps.pdcStep.noHosts')).toBeDefined()
  })
})

describe('Test PDCInfrastructureSpec behavior - Preconfigured', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValuesPreconfigured())
  })

  test('should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })

  test('populate hosts, test is deploy to all hosts, and open hosts table', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    const hostsArea = container.querySelector('textarea')

    expect(hostsArea).toBe(null)

    await waitFor(() => {
      expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('cd.steps.pdcStep.previewHosts'))
    })

    expect(getByText('cd.steps.pdcStep.noHosts')).toBeDefined()
  })

  test('populate hosts, test is deploy to custom hosts, and open hosts table', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container, getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    const deploySpecificHostsOptionRadio = getByText('cd.steps.pdcStep.deploySpecificHostsOption')

    act(() => {
      fireEvent.click(deploySpecificHostsOptionRadio!)
    })

    await waitFor(() => {
      expect(getByPlaceholderText('cd.steps.pdcStep.specificHostsPlaceholder')).toBeDefined()
    })

    const customHostsTextArea = getByPlaceholderText('cd.steps.pdcStep.specificHostsPlaceholder')

    act(() => {
      fireEvent.change(customHostsTextArea, { target: { value: '1.1.1.1, 2.2.2.2' } })
    })

    await waitFor(() => {
      expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('cd.steps.pdcStep.previewHosts'))
    })

    await waitFor(() => {
      expect(getByText('common.refresh')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('common.refresh'))
    })

    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })
  })

  test('test is deploy to custom hosts by attribute filter, and open hosts table', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfiguredWithAttributes()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfiguredWithAttributes()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    await waitFor(() => {
      expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('cd.steps.pdcStep.previewHosts'))
    })

    await waitFor(() => {
      expect(getByText('common.refresh')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('common.refresh'))
    })

    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })
  })

  test('populate hosts, test is deploy to all hosts, and open hosts table and test all connections', async () => {
    const onUpdateHandler = jest.fn()
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const form = container.querySelector('form')
    await waitFor(() => {
      expect(form!).toBeDefined()
    })

    const hostsArea = container.querySelector('textarea')

    expect(hostsArea).toBe(null)

    await waitFor(() => {
      expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('cd.steps.pdcStep.previewHosts'))
    })

    await waitFor(() => {
      expect(container.querySelector('table')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('common.refresh'))
    })

    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })

    act(() => {
      fireEvent.click(getByText('common.smtp.testConnection'))
    })

    await waitFor(() => {
      expect(validateHosts).toBeCalled()
    })
  })

  test('invocation map, empty yaml', () => {
    const yaml = ''
    const params = { accountId: 'accountId1' }
    const path = 'pipeline.stages[0].stage.spec.infrastructure.infrastructureDefinition'
    const invocationMap = factory.getStep(StepType.PDC)?.getInvocationMap?.()
    invocationMap?.get(PdcRegex)?.(path, yaml, params)
    expect(CDNG.getConnectorListV2Promise).not.toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(path, yaml, params)
    expect(CDNG.listSecretsV2Promise).not.toBeCalled()
  })

  test('invocation map, wrong yaml', () => {
    const yaml = {} as string
    const params = { accountId: 'accountId1' }
    const path = 'pipeline.stages[0].stage.spec.infrastructure.infrastructureDefinition'
    const invocationMap = factory.getStep(StepType.PDC)?.getInvocationMap?.()
    invocationMap?.get(PdcRegex)?.(path, yaml, params)
    expect(CDNG.getConnectorListV2Promise).not.toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(path, yaml, params)
    expect(CDNG.listSecretsV2Promise).not.toBeCalled()
  })

  test('invocation map should call template list', () => {
    jest.spyOn(CDNG, 'listSecretsV2Promise').mockImplementation(() => Promise.resolve(mockListSecrets as any))
    jest
      .spyOn(CDNG, 'getConnectorListV2Promise')
      .mockImplementation(() => Promise.resolve(ConnectorsResponse.data as any))

    const yaml = getYaml()
    const params = { accountId: 'accountId1' }
    const path = 'pipeline.stages[0].stage.spec.infrastructure.infrastructureDefinition'
    const invocationMap = factory.getStep(StepType.PDC)?.getInvocationMap?.()
    invocationMap?.get(PdcRegex)?.(path, yaml, params)
    expect(CDNG.getConnectorListV2Promise).toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(path, yaml, params)
    expect(CDNG.listSecretsV2Promise).toBeCalled()
  })
})

describe('test custom functions', () => {
  test('test parseAttributes fn', () => {
    expect(parseAttributes('hostType:DB\nregion:west')).toEqual({ hostType: 'DB', region: 'west' })
  })
})
