/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Module } from 'framework/types/ModuleName'
import { useStartFreeLicense } from 'services/cd-ng'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { StartTrialTemplate } from '../StartTrialTemplate'

jest.mock('services/cd-ng')
const useStartFreeLicenseMock = useStartFreeLicense as jest.MockedFunction<any>
useStartFreeLicenseMock.mockImplementation(() => {
  return {
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementationOnce(() => {
      return {
        status: 'SUCCESS',
        data: {
          licenseType: 'FREE'
        }
      }
    })
  }
})

const props = {
  title: 'Continuous Integration',
  bgImageUrl: '',
  startTrialProps: {
    description: 'start trial description',
    learnMore: {
      description: 'learn more description',
      url: ''
    },
    startBtn: {
      description: 'Start A Trial'
    }
  },
  module: 'ci' as Module
}

jest.mock('@common/modals/ContactSales/useContactSalesMktoModal')
const useContactSalesMktoModalMock = useContactSalesMktoModal as jest.MockedFunction<any>

describe('StartTrialTemplate snapshot test', () => {
  test('should not render start a trial by default', async () => {
    useContactSalesMktoModalMock.mockImplementation(() => {
      return { openMarketoContactSales: jest.fn(), loading: false }
    })
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call prop onClick when there is such prop', async () => {
    const onClick = jest.fn()
    const newProps = {
      ...props,
      startTrialProps: {
        description: 'continue',
        learnMore: {
          description: 'learn more description',
          url: ''
        },
        startBtn: {
          description: 'Continue',
          onClick
        }
      },
      module: 'ci' as Module
    }
    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...newProps} />
      </TestWrapper>
    )
    fireEvent.click(getByText('Continue'))
    await waitFor(() => expect(onClick).toBeCalled())
    expect(container).toMatchSnapshot()
  })

  test('should call the start button click handler if it exists', async () => {
    window.deploymentType = 'SAAS'

    const startBtnClickHandlerMock = jest.fn()

    const customProps = {
      title: 'Continuous Integration',
      bgImageUrl: '',
      startTrialProps: {
        description: 'start trial description',
        learnMore: {
          description: 'learn more description',
          url: ''
        },
        startBtn: {
          description: 'Start A Trial',
          onClick: startBtnClickHandlerMock
        }
      },
      module: 'ci' as Module,
      shouldShowStartTrialModal: true
    }

    const { container, queryByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...customProps} />
      </TestWrapper>
    )
    const requestTrialButton = queryByText('common.requestFreeTrial')
    expect(requestTrialButton).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
