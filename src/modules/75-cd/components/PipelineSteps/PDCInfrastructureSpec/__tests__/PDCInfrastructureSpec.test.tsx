/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import * as CDNG from 'services/cd-ng'
import type { ResponseMessage } from 'services/cd-ng'
import { PDCInfrastructureSpec, PdcRegex, SshKeyRegex } from '../PDCInfrastructureSpec'
import { ConnectorsResponse } from './mock/ConnectorsResponse.mock'
import { ConnectorResponse } from './mock/ConnectorResponse.mock'
import { mockListSecrets } from './mock/Secrets.mock'
import { parseAttributes } from '../PDCInfrastructureInterface'

const getYaml = (): string => `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: Pdc
                          spec:
                              connectorRef: account.connectorRef`

const infraDefPath = 'pipeline.stages[0].stage.spec.infrastructure.infrastructureDefinition'
const accountIdParams = { accountId: 'accountId1' }

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const validateHosts = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ data: [{ host: 'localhost' }, { host: '1.2.3.4' }], status: 'SUCCESS' }))
const responseMessages: ResponseMessage[] = [{ code: 'ACCESS_DENIED', message: 'error validation' }]
const validateHostsFailure = jest.fn().mockImplementation(() => Promise.resolve({ responseMessages }))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(ConnectorsResponse.data)),
  useValidateSshHosts: jest.fn(() => jest.fn(() => ({ mutate: jest.fn() }))),
  useFilterHostsByConnector: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({ data: { content: [{ hostname: '1.2.3.4' }] } }))
  })),
  useValidateHosts: jest.fn(() => ({ mutate: validateHosts })),
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
  sshKey: 'sshkey1',
  allowSimultaneousDeployments: true
})

const getInitialValuesPreconfigured = () => ({
  ...getInitialValuesNoPreconfigured(),
  connectorRef: 'connectorRef1'
})

const getInitialValuesPreconfiguredWithAttributes = () => ({
  ...getInitialValuesPreconfigured(),
  attributeFilters: { hostType: 'DB' }
})

const getInitialValuePreconfiguredWithHostFilters = () => ({
  ...getInitialValuesPreconfigured(),
  hostFilters: ['5.5.5.5', '4.4.4.4']
})

const checkForFormInit = async (container: HTMLElement) => {
  const form = container.querySelector('form')
  return await waitFor(() => {
    expect(form!).toBeDefined()
  })
}

const openPreviewHosts = async (getByText: any) => {
  await waitFor(() => {
    expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined()
  })
  act(() => {
    fireEvent.click(getByText('cd.steps.pdcStep.previewHosts'))
  })
  await waitFor(() => {
    expect(getByText('common.refresh')).toBeDefined()
  })
}

const checkTestConnection = async (getByText: any) => {
  act(() => {
    fireEvent.click(getByText('common.smtp.testConnection'))
  })
  await waitFor(() => {
    expect(validateHosts).toBeCalled()
  })
}

const refreshHosts = async (getByText: any) => {
  await waitFor(() => {
    expect(getByText('common.refresh')).toBeDefined()
  })
  act(() => {
    fireEvent.click(getByText('common.refresh'))
  })
}

const clickOn = (getByText: any, textIdentifier: string) => {
  act(() => {
    fireEvent.click(getByText(textIdentifier)!)
  })
}

const clickOnPreconfiguredHostsOption = async (getByText: any) => {
  clickOn(getByText, 'cd.steps.pdcStep.preconfiguredHostsOption')
  await waitFor(() => {
    expect(getByText('cd.steps.pdcStep.includeAllHosts')).toBeDefined()
  })
}

const clickOnDeploySpecificHostsOption = async (getByText: any) => {
  clickOn(getByText, 'cd.steps.pdcStep.filterHostName')
}

const updateHostsInput = async (container: any) => {
  const hostsArea = queryByAttribute('name', container, 'hosts')
  act(() => {
    fireEvent.change(hostsArea!, { target: { value: 'localhost, 1.2.3.4' } })
  })
}
describe('Test PDCInfrastructureSpec behavior - No Preconfigured', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })

  test('should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValuesNoPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
      />
    )
    await checkForFormInit(container)
    updateHostsInput(container)
    expect(container).toMatchSnapshot()
  })

  test('populate hosts, and open hosts table', async () => {
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesNoPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesNoPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )

    await checkForFormInit(container)
    updateHostsInput(container)
    await openPreviewHosts(getByText)
    expect(getByText('localhost')).toBeDefined()

    //close previewHosts
    const closeBtn = getByText('Close preview')
    expect(closeBtn).toBeDefined()
    fireEvent.click(closeBtn.closest('button') as HTMLButtonElement)

    //preview visible again
    await waitFor(() => expect(getByText('cd.steps.pdcStep.previewHosts')).toBeDefined())
  })

  test('switch to preconfigured manually', async () => {
    const { getByText, getByPlaceholderText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesNoPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesNoPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )
    await checkForFormInit(container)
    updateHostsInput(container)
    await clickOnPreconfiguredHostsOption(getByText)
    await clickOnDeploySpecificHostsOption(getByText)
    await waitFor(() => {
      expect(getByPlaceholderText('cd.steps.pdcStep.specificHostsPlaceholder')).toBeDefined()
    })
    const allHosts = getByText('cd.steps.pdcStep.includeAllHosts')
    expect(allHosts).toBeDefined()
    fireEvent.click(allHosts)
    await waitFor(() => expect(container.querySelector("input[value='allHosts']")).toBeChecked())
  })
})

describe('Test PDCInfrastructureSpec behavior - Preconfigured', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })

  test('populate hosts, test is deploy to all hosts, and open hosts table', async () => {
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )

    await checkForFormInit(container)
    expect(container.querySelector('textarea')).toBe(null)
    await openPreviewHosts(getByText)
  })

  test('populate hosts, test is deploy to custom hosts, and open hosts table', async () => {
    const { getByText, container, getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )
    await checkForFormInit(container)
    clickOn(getByText, 'cd.steps.pdcStep.filterHostName')
    await waitFor(() => {
      expect(getByPlaceholderText('cd.steps.pdcStep.specificHostsPlaceholder')).toBeDefined()
    })
    const customHostsTextArea = getByPlaceholderText('cd.steps.pdcStep.specificHostsPlaceholder')
    act(() => {
      fireEvent.change(customHostsTextArea, { target: { value: '1.1.1.1, 2.2.2.2' } })
    })

    await openPreviewHosts(getByText)
    await refreshHosts(getByText)
    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })
  })

  test('test is deploy to custom hosts by attribute filter, and open hosts table', async () => {
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfiguredWithAttributes()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfiguredWithAttributes()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )

    await checkForFormInit(container)
    await openPreviewHosts(getByText)
    await refreshHosts(getByText)

    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })
  })

  test('test is deploy to custom hosts by hosts filter, and open hosts table', async () => {
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuePreconfiguredWithHostFilters()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuePreconfiguredWithHostFilters()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )

    await checkForFormInit(container)
    await openPreviewHosts(getByText)
    await refreshHosts(getByText)

    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })
  })

  test('populate hosts, test is deploy to all hosts, and open hosts table and test all connections - all success', async () => {
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )
    await checkForFormInit(container)
    await openPreviewHosts(getByText)
    refreshHosts(getByText)
    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })
    await checkTestConnection(getByText)
  })
})

describe('test api rejections', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })
  test('test all connections - error fail / reject', async () => {
    jest.spyOn(CDNG, 'listSecretsV2Promise').mockImplementationOnce(() => Promise.resolve(mockListSecrets as any))
    const { getByText, container } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )
    await checkForFormInit(container)
    await openPreviewHosts(getByText)
    refreshHosts(getByText)
    await waitFor(() => {
      expect(getByText('1.2.3.4')).toBeDefined()
    })
    await checkTestConnection(getByText)
  })
  test('useValidateHosts failure test', async () => {
    jest.spyOn(CDNG, 'useValidateHosts').mockImplementationOnce(validateHostsFailure)
    render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.Edit}
        onUpdate={jest.fn()}
      />
    )
    expect(validateHostsFailure).toBeCalled()
  })
})

describe('invocation map test', () => {
  test('invocation map, empty yaml', () => {
    const yaml = ''
    const invocationMap = factory.getStep(StepType.PDC)?.getInvocationMap?.()
    invocationMap?.get(PdcRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.getConnectorListV2Promise).toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.listSecretsV2Promise).not.toBeCalled()
  })

  test('invocation map, wrong yaml', () => {
    const yaml = {} as string
    const invocationMap = factory.getStep(StepType.PDC)?.getInvocationMap?.()
    invocationMap?.get(PdcRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.getConnectorListV2Promise).toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.listSecretsV2Promise).not.toBeCalled()
  })

  test('invocation map should call template list', () => {
    jest.spyOn(CDNG, 'listSecretsV2Promise').mockImplementationOnce(() => Promise.resolve(mockListSecrets as any))
    jest
      .spyOn(CDNG, 'getConnectorListV2Promise')
      .mockImplementationOnce(() => Promise.resolve(ConnectorsResponse.data as any))

    const yaml = getYaml()

    const invocationMap = factory.getStep(StepType.PDC)?.getInvocationMap?.()
    invocationMap?.get(PdcRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.getConnectorListV2Promise).toBeCalled()
    invocationMap?.get(SshKeyRegex)?.(infraDefPath, yaml, accountIdParams)
    expect(CDNG.listSecretsV2Promise).toBeCalled()
  })
})

describe('test custom functions', () => {
  test('test parseAttributes fn', () => {
    expect(parseAttributes('hostType:DB\nregion:west')).toEqual({ hostType: 'DB', region: 'west' })
  })
})

describe('test different stepViewType', () => {
  beforeEach(() => {
    factory.registerStep(new PDCInfrastructureSpec())
  })
  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValuesNoPreconfigured()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValuesNoPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('validateInputSet - render empty when default', () => {
    const response = new PDCInfrastructureSpec().validateInputSet({
      data: {
        credentialsRef: 'account.cred'
      },
      template: {
        credentialsRef: 'account.cred'
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot()
  })

  test('render runtimeview when no Preconfigured', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValuesNoPreconfigured()}
        template={{
          credentialsRef: RUNTIME_INPUT_VALUE,
          hosts: RUNTIME_INPUT_VALUE
        }}
        allValues={getInitialValuesNoPreconfigured()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('render runtimeview when Preconfigured with attribute filter', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={getInitialValuesPreconfiguredWithAttributes()}
        template={{
          connectorRef: RUNTIME_INPUT_VALUE,
          attributeFilters: RUNTIME_INPUT_VALUE
        }}
        allValues={getInitialValuesPreconfiguredWithAttributes()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={jest.fn()}
      />
    )
    expect(getByText('cd.steps.pdcStep.specificAttributes')).toBeDefined()
  })

  test('render runtimeview when Preconfigured with host filter', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={getInitialValuePreconfiguredWithHostFilters()}
        template={{
          connectorRef: RUNTIME_INPUT_VALUE,
          hostFilters: RUNTIME_INPUT_VALUE
        }}
        allValues={getInitialValuePreconfiguredWithHostFilters()}
        type={StepType.PDC}
        stepViewType={StepViewType.InputSet}
        onUpdate={jest.fn()}
      />
    )
    expect(getByText('cd.steps.pdcStep.specificHosts')).toBeDefined()
  })
})
