/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Button } from '@harness/uicore'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as templateService from 'services/template-ng'
import * as cvServices from 'services/cv'
import MonitoredServiceInputSetsTemplate from '../MonitoredServiceInputSetsTemplate'
import { pathList, spec, templateYamlData, templateYamlDataGCO } from './MonitoredServiceInputSetsTemplate.mock'
import { getLabelByName, getNestedRuntimeInputs, getPathForKey } from '../MonitoredServiceInputSetsTemplate.utils'
import * as InputSetUtils from '../MonitoredServiceInputSetsTemplate.utils'

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest.fn().mockReturnValue({
    data: {
      status: 'SUCCESS',
      data: 'templateInputs:\n identifier: "<+monitoredService.serviceRef>_<+monitoredService.environmentRef>"\n type: "Application"\n serviceRef: "<+input>"\n environmentRef: "<+input>"\n sources:\n   healthSources:\n   - identifier: "AppD_default_metrics_runtime_connector"\n     type: "AppDynamics"\n     spec:\n       applicationName: "<+input>"\n       tierName: "<+input>"\n       connectorRef: "<+input>"\n   - identifier: "Appd_with_custom_and_runtime_connector"\n     type: "AppDynamics"\n     spec:\n       applicationName: "<+input>"\n       tierName: "<+input>"\n       metricDefinitions:\n       - identifier: "appdMetric_101"\n         completeMetricPath: "<+input>"\n         analysis:\n           deploymentVerification:\n             serviceInstanceMetricPath: "<+input>"\n       connectorRef: "<+input>"\n'
    },
    error: null,
    loading: false,
    refetch: jest.fn()
  }),
  useGetTemplate: jest
    .fn()
    .mockImplementation(() => ({ data: templateYamlData, refetch: jest.fn(), error: null, loading: false }))
}))
const refetchSaveTemplateYaml = jest.fn().mockResolvedValue({})
jest.mock('services/cv', () => ({
  ...(jest.requireActual('services/cv') as any),
  useSaveMonitoredServiceFromYaml: jest.fn().mockImplementation(() => ({ mutate: refetchSaveTemplateYaml }))
}))

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  HarnessServiceAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
      </Container>
    )
  },
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))

describe('Test MonitoredServiceInputSetsTemplate', () => {
  test('Should render when props are passed', () => {
    const props = {
      identifier: 'AppD_default_metrics_runtime_connector',
      accountId: 'accountId',
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      versionLabel: '1'
    }
    const { container } = render(
      <TestWrapper>
        <MonitoredServiceInputSetsTemplate templateData={props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('should render with ms inputset', async () => {
    jest.spyOn(InputSetUtils, 'validateInputSet').mockReturnValue({})
    const { container, getByText } = render(
      <TestWrapper>
        <MonitoredServiceInputSetsTemplate />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const submit = await getByText('submit')
    act(() => {
      fireEvent.click(submit)
    })
    await waitFor(() => expect(getByText('cv.monitoredServices.monitoredServiceCreated')).toBeInTheDocument())
  })

  test('should fail monitored service creation', async () => {
    const refetchSaveTemplate = jest.fn().mockRejectedValue({
      data: {
        message: 'monitored service creation failed'
      }
    })
    jest.spyOn(InputSetUtils, 'validateInputSet').mockReturnValue({})
    jest.spyOn(cvServices, 'useSaveMonitoredServiceFromYaml').mockReturnValue({
      mutate: refetchSaveTemplate,
      cancel: jest.fn(),
      error: null,
      loading: false
    })
    const { getByText } = render(
      <TestWrapper>
        <MonitoredServiceInputSetsTemplate />
      </TestWrapper>
    )
    const submit = await getByText('submit')
    act(() => {
      fireEvent.click(submit)
    })
    await waitFor(() => expect(getByText('monitored service creation failed')).toBeInTheDocument())
  })

  test('should render error state', async () => {
    const refetchTemplateInputYaml = jest.fn()
    jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockImplementation(
      () =>
        ({
          data: {},
          refetch: refetchTemplateInputYaml,
          error: {
            data: {
              message: 'api call failed'
            }
          },
          loading: false,
          cancel: jest.fn()
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <MonitoredServiceInputSetsTemplate />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const retry = await getByText('Retry')
    act(() => {
      fireEvent.click(retry)
    })
    await waitFor(() => expect(refetchTemplateInputYaml).toHaveBeenCalled())
  })

  test('should render loading state', async () => {
    jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: true,
          cancel: jest.fn()
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <MonitoredServiceInputSetsTemplate />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('should render no data state', async () => {
    jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: false,
          cancel: jest.fn()
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <MonitoredServiceInputSetsTemplate />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const submit = await getByText('submit')
    act(() => {
      fireEvent.click(submit)
    })
  })

  test('should validate getNestedRuntimeInputs', () => {
    const output = getNestedRuntimeInputs(spec, [], 'path')
    expect(output).toEqual(pathList)
    expect(getNestedRuntimeInputs({}, [], 'path')).toEqual([])
  })

  test('should validate getNestedRuntimeInputs', () => {
    const output = getNestedRuntimeInputs(spec, [], 'path')
    expect(output).toEqual(pathList)
    expect(getNestedRuntimeInputs({}, [], 'path')).toEqual([])
  })

  test('should validate getPathForKey', () => {
    const output = getPathForKey(spec, [], 'path', 'category')
    expect(output).toEqual([{ name: 'category', path: 'path.metricDefinitions.0.analysis.riskProfile.category' }])
    expect(getPathForKey({}, [], '', '')).toEqual([])
  })

  test('should validate getLabelByName', () => {
    expect(getLabelByName('applicationName', str => str)).toEqual('cv.monitoringSources.appD.applicationName')
    expect(getLabelByName('category', str => str)).toEqual('Category for cv.monitoringSources.riskCategoryLabel')
    expect(getLabelByName('', str => str)).toEqual('')
  })
})

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: jest.fn().mockImplementation(() => ({
    templateRef:
      '{"identifier":"gco_logs_runtime","accountId":"-k53qRQAQ1O7DBLb9ACnjQ","orgIdentifier":"cvng","projectIdentifier":"Template_testing","versionLabel":"1"}'
  }))
}))

describe('Test MonitoredServiceInputSetsTemplate with GCO', () => {
  test('should render with ms inputset for GCO metric having runtime query', async () => {
    jest.clearAllMocks()
    const refetchSaveTemplateYamlGCO = jest.fn().mockResolvedValue({})
    jest.spyOn(InputSetUtils, 'validateInputSet').mockReturnValue({})
    jest.spyOn(cvServices, 'useSaveMonitoredServiceFromYaml').mockReturnValue({
      mutate: refetchSaveTemplateYamlGCO,
      cancel: jest.fn(),
      error: null,
      loading: false
    })
    jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockReturnValue({
      data: {
        correlationId: '69e17be6-aa27-4524-820c-79a1831c1cec',
        data: 'templateInputs:\n type: "Application"\n serviceRef: "<+input>"\n sources:\n   healthSources:\n   - identifier: "metric"\n     type: "Stackdriver"\n     spec:\n       connectorRef: "<+input>"\n       metricDefinitions:\n       - identifier: "test"\n         jsonMetricDefinition: "<+input>"\n',
        metaData: null,
        status: 'SUCCESS'
      },
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    } as any)
    jest
      .spyOn(templateService, 'useGetTemplate')
      .mockReturnValue({ data: templateYamlDataGCO, refetch: jest.fn(), error: null, loading: false } as any)
    const { container, getByText } = render(
      <TestWrapper>
        <MonitoredServiceInputSetsTemplate />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const submit = await getByText('submit')
    await act(() => {
      const name = container.querySelector(
        'input[name="sources.healthSources.0.spec.metricDefinitions.0.jsonMetricDefinition"]'
      ) as HTMLInputElement
      fireEvent.change(name, {
        target: {
          value: '{"dataSets": [{"timeSeriesQuery": "query"}]}'
        }
      })
      fireEvent.click(submit)
    })
  })
})
