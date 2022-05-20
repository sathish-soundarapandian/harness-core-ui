/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, act, queryByAttribute, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import * as Portal from 'services/portal'
import * as cdServices from 'services/cd-ng'
import {} from '../../CloudFormationInterfaces.types'
import { CFCreateStack } from '../CreateStack'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
})

const regionMock = {
  resource: [
    {
      name: 'GovCloud (US-West)',
      value: 'us-gov-west-1'
    },
    {
      name: 'GovCloud (US-East)',
      value: 'us-gov-east-1'
    }
  ]
}

const renderComponent = (data: any, stepType = StepViewType.Edit) => {
  return render(<TestStepWidget {...data} type={StepType.CloudFormationCreateStack} stepViewType={stepType} />)
}

describe('Test Cloudformation delete stack', () => {
  beforeEach(() => {
    factory.registerStep(new CFCreateStack())
    jest
      .spyOn(cdServices, 'useCFCapabilitiesForAws')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() } as any))
    jest
      .spyOn(cdServices, 'useCFStatesForAws')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() } as any))
    jest
      .spyOn(Portal, 'useListAwsRegions')
      .mockImplementation(() => ({ loading: false, error: null, data: regionMock, refetch: jest.fn() } as any))
  })

  test('should render edit view as new step', () => {
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
    const data = {
      initialValues: {
        type: StepType.CloudFormationCreateStack,
        name: '',
        identifier: '',
        timeout: '10m',
        spec: {
          provisionerIdentifier: '',
          configuration: {
            stackName: '',
            connectorRef: '',
            region: '',
            templateFile: {
              type: 'Remote',
              spec: {}
            }
          }
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as new step with data', () => {
    const data = {
      initialValues: {
        type: StepType.CloudFormationCreateStack,
        name: 'create stack',
        identifier: 'create_stack',
        timeout: '10m',
        spec: {
          provisionerIdentifier: 'provisionerID',
          configuration: {
            stackName: 'test_name',
            connectorRef: RUNTIME_INPUT_VALUE,
            region: 'ireland',
            templateFile: {
              type: 'Inline',
              spec: {
                templateBody: 'test body'
              }
            }
          }
        }
      }
    }
    const { container } = renderComponent(data)
    expect(container).toMatchSnapshot()
  })

  test('should be able to edit inputs', async () => {
    const data = {
      initialValues: {
        type: StepType.CloudFormationCreateStack,
        name: 'create stack',
        identifier: 'create_stack',
        timeout: '10m',
        spec: {
          provisionerIdentifier: 'provisionerID',
          configuration: {
            stackName: 'test_name',
            connectorRef: RUNTIME_INPUT_VALUE,
            region: 'ireland',
            templateFile: {
              type: 'Inline',
              spec: {
                templateBody: 'test body'
              }
            }
          }
        }
      }
    }
    const { container, getByText } = renderComponent(data)
    const stepName = queryByAttribute('name', container, 'name')
    act(() => {
      userEvent.type(stepName!, ' new name')
    })
    expect(stepName).toHaveDisplayValue(['create stack new name'])

    const timeout = queryByAttribute('name', container, 'timeout')
    act(() => {
      userEvent.clear(timeout!)
      userEvent.type(timeout!, '20m')
    })
    expect(timeout).toHaveDisplayValue('20m')

    const provisionerIdentifier = queryByAttribute('name', container, 'spec.provisionerIdentifier')
    act(() => {
      userEvent.clear(provisionerIdentifier!)
      userEvent.type(provisionerIdentifier!, 'newID')
    })
    expect(provisionerIdentifier).toHaveDisplayValue('newID')

    const region = queryByAttribute('name', container, 'spec.configuration.region')
    act(() => {
      userEvent.click(region!)
    })
    await waitFor(() => expect(() => getByText('GovCloud (US-West)')).toBeTruthy())
    const selectedRegion = getByText('GovCloud (US-West)')
    act(() => {
      userEvent.click(selectedRegion!)
    })
    expect(region).toHaveDisplayValue(['GovCloud (US-West)'])

    const stackName = queryByAttribute('name', container, 'spec.configuration.stackName')
    act(() => {
      userEvent.type(stackName!, ' new name')
    })
    expect(stackName).toHaveDisplayValue('test_name new name')
    expect(container).toMatchSnapshot()
  })
})
