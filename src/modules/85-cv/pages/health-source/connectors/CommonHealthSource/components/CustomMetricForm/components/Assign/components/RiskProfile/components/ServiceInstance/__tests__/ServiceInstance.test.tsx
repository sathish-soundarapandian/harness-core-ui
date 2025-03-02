/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import userEvent from '@testing-library/user-event'
import { act, render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CommonHealthSourceProvider from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import { SetupSourceTabsProvider } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { commonHealthSourceProviderPropsMock } from '@cv/components/CommonMultiItemsSideNav/tests/CommonMultiItemsSideNav.mock'
import ServiceInstance, { ServiceInstanceProps } from '../ServiceInstance'
import {
  serviceInstancePropsMock,
  serviceInstancePropsMockWithDefaultValue,
  serviceInstancePropsMockWithRecords
} from './ServiceInstance.mock'

interface TestServiceInstancePropsType extends ServiceInstanceProps {
  query: string
}

const WrapperComponent = (props: Partial<TestServiceInstancePropsType>): JSX.Element => {
  const serviceInstanceComponentProps = {
    ...serviceInstancePropsMock,
    ...props
  }
  return (
    <TestWrapper>
      <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
        <Formik
          initialValues={{ serviceInstanceField: 'k8.test.instance', query: props.query }}
          onSubmit={() => Promise.resolve()}
        >
          <ServiceInstance {...serviceInstanceComponentProps} />
        </Formik>
      </CommonHealthSourceProvider>
    </TestWrapper>
  )
}

describe('Common health source ServiceInstance', () => {
  test('ServiceInstance should render JSON selector component if correct config is present', () => {
    render(<WrapperComponent />)

    const jsonSelectorButton = screen.getByTestId(/jsonSelectorBtn/)

    expect(jsonSelectorButton).toBeInTheDocument()
    expect(jsonSelectorButton).toBeDisabled()
    expect(document.querySelector('input[name="serviceInstanceField"]')).toHaveValue('k8.test.instance')
  })

  test('ServiceInstance should render JSON selector component as enabled if records are present', () => {
    render(<WrapperComponent recordProps={serviceInstancePropsMockWithRecords} query="*" />)

    const jsonSelectorButton = screen.getByTestId(/jsonSelectorBtn/)

    expect(jsonSelectorButton).toBeInTheDocument()
    expect(jsonSelectorButton).not.toBeDisabled()
    expect(document.querySelector('input[name="serviceInstanceField"]')).toHaveValue('k8.test.instance')
  })

  test('ServiceInstance should render JSON selector component when connectorRef is runtime', () => {
    const WrapperComponentWithServiceContext = (props: Partial<TestServiceInstancePropsType>): JSX.Element => {
      const serviceInstanceComponentProps = {
        ...serviceInstancePropsMockWithDefaultValue,
        ...props
      }
      return (
        <TestWrapper>
          <SetupSourceTabsProvider
            isTemplate
            sourceData={{ connectorRef: '<+input>' }}
            onNext={() => Promise.resolve()}
            onPrevious={() => Promise.resolve()}
          >
            <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
              <Formik initialValues={{}} onSubmit={() => Promise.resolve()}>
                <ServiceInstance {...serviceInstanceComponentProps} />
              </Formik>
            </CommonHealthSourceProvider>
          </SetupSourceTabsProvider>
        </TestWrapper>
      )
    }

    render(<WrapperComponentWithServiceContext recordProps={serviceInstancePropsMockWithRecords} query="<+input>" />)

    const jsonSelectorButton = screen.queryByTestId(/jsonSelectorBtn/)

    expect(jsonSelectorButton).toBeInTheDocument()
  })

  test('ServiceInstance should render JSON selector component as disabled if isQueryRecordsAvailable prop is false', () => {
    render(
      <WrapperComponent
        recordProps={{ ...serviceInstancePropsMockWithRecords, isQueryRecordsAvailable: false }}
        query="*"
      />
    )

    const jsonSelectorButton = screen.getByTestId(/jsonSelectorBtn/)

    expect(jsonSelectorButton).toBeInTheDocument()
    expect(jsonSelectorButton).toBeDisabled()
  })

  test('ServiceInstance should render JSON selector component as disabled if query is not present', () => {
    render(<WrapperComponent recordProps={serviceInstancePropsMockWithRecords} />)

    const jsonSelectorButton = screen.getByTestId(/jsonSelectorBtn/)

    expect(jsonSelectorButton).toBeInTheDocument()
    expect(jsonSelectorButton).toBeDisabled()
  })

  test('ServiceInstance should render textbox component if the config is not present', async () => {
    render(<WrapperComponent query="*" serviceInstanceConfig={undefined} />)

    const jsonSelectorButton = screen.queryByTestId(/jsonSelectorBtn/)

    expect(jsonSelectorButton).not.toBeInTheDocument()

    const serviceInput = document.querySelector('input[value="k8.test.instance"]')

    expect(serviceInput).toBeInTheDocument()

    act(() => {
      userEvent.clear(serviceInput!)
      userEvent.type(serviceInput!, 'test service input')
    })

    await waitFor(() => {
      expect(serviceInput).toHaveValue('test service input')
    })
  })
})
