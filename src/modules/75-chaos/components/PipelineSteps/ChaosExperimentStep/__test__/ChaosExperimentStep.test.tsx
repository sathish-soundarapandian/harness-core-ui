/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute } from '@testing-library/react'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TestWrapper, UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ChaosExperimentStep } from '../ChaosExperimentStep'
import { MemoizedExperimentPreview, MemoizedPipelineExperimentSelect } from '../ChaosExperimentStepBase'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

// eslint-disable-next-line react/display-name
jest.mock('microfrontends/ChildAppMounter', () => () => {
  return <div data-testid="error-tracking-child-mounter">mounted</div>
})

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

describe('ChaosExperiment Step', () => {
  beforeAll(() => {
    factory.registerStep(new ChaosExperimentStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.ChaosExperiment} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('edit mode works', async () => {
      const initialValues = {
        type: 'Chaos',
        name: 'step1',
        identifier: 'step1',
        spec: {
          experimentRef: '001167e9-7b03-48d7-97f3-c1b328065f5d',
          expectedResilienceScore: 50,
          assertion: 'faultsPassed > 1'
        },
        description: 'desc'
      }
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container, getByText, getByTestId } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.ChaosExperiment}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

      fireEvent.change(queryByNameAttribute('spec.expectedResilienceScore')!, { target: { value: 90 } })
      fireEvent.click(getByText('common.optionalConfig'))
      fireEvent.change(queryByNameAttribute('spec.assertion')!, { target: { value: 'faultsPassed > 2' } })

      expect(container).toMatchSnapshot()

      act(() => {
        fireEvent.click(getByTestId('chaosExperimentReferenceField'))
      })
      expect(container).toMatchSnapshot()

      act(() => {
        fireEvent.click(getByTestId('experimentReferenceFieldCloseBtn'))
      })

      expect(container).toMatchSnapshot()
      await act(() => ref.current?.submitForm()!)

      expect(onUpdate).toHaveBeenCalledWith({
        description: 'desc',
        identifier: 'step1',
        name: 'step1',
        spec: {
          expectedResilienceScore: 90,
          experimentRef: '001167e9-7b03-48d7-97f3-c1b328065f5d',
          assertion: 'faultsPassed > 2'
        }
      })
    })
  })

  describe('<MemoizedExperimentPreview /> tests', () => {
    test('Should re-render MemoizedExperimentPreview when experimentID change', () => {
      const { container } = render(
        <TestWrapper>
          <MemoizedExperimentPreview experimentID="experimentID1" />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()

      render(
        <TestWrapper>
          <MemoizedExperimentPreview experimentID="experimentID2" />
        </TestWrapper>,
        { container }
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('<MemoizedPipelineExperimentSelect /> tests', () => {
    test('Should render MemoizedPipelineExperimentSelect', () => {
      const mockOnSelect = jest.fn()
      const mockGoToNewExperiment = jest.fn()

      const { container } = render(
        <TestWrapper>
          <MemoizedPipelineExperimentSelect onSelect={mockOnSelect} goToNewExperiment={mockGoToNewExperiment} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })
})
