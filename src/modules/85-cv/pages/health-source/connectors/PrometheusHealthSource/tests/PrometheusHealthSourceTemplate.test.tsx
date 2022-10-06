/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@wings-software/uicore'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { setFieldValue, InputTypes } from '@common/utils/JestFormHelper'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { PrometheusHealthSource, PrometheusHealthSourceProps } from '../PrometheusHealthSource'
import {
  fixedValuesTemplate,
  MockTemplateQueryData,
  submitTemplateData,
  templateCreationData
} from './PrometheusHealthSource.mock'

jest.mock('../components/PrometheusQueryBuilder/PrometheusQueryBuilder', () => ({
  PrometheusQueryBuilder: function MockComponent() {
    return <Container />
  }
}))

jest.mock('../components/PrometheusRiskProfile/PrometheusRiskProfile', () => ({
  PrometheusRiskProfile: function MockComponent() {
    return <Container />
  }
}))

jest.mock('../components/PrometheusGroupName/PrometheusGroupName', () => ({
  PrometheusGroupName: function MockComponent() {
    return <Container />
  }
}))

function WrapperComponent(props: PrometheusHealthSourceProps): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs {...props} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <PrometheusHealthSource isTemplate data={props.data} onSubmit={props.onSubmit} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

describe('Unit tests for PrometheusHealthSource', () => {
  beforeAll(() => {
    jest.spyOn(cvService, 'useGetLabelNames').mockReturnValue({ data: { data: [] } } as any)
    jest.spyOn(cvService, 'useGetMetricNames').mockReturnValue({ data: { data: [] } } as any)
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({ data: { data: [] } } as any)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Load in editmode for template with runtime values', async () => {
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(<WrapperComponent data={MockTemplateQueryData} onSubmit={onSubmitMock} />)

    await waitFor(() => expect(getByText('cv.monitoringSources.prometheus.customizeQuery')).not.toBeNull())
    expect(container.querySelectorAll('[class*="Accordion--panel"]').length).toBe(2)

    act(() => {
      fireEvent.click(getByText('submit'))
    })
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(onSubmitMock).toHaveBeenLastCalledWith(submitTemplateData[0], submitTemplateData[1]))
  })

  test('load in edit case with fixed values', async () => {
    const onSubmit = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <PrometheusHealthSource isTemplate data={fixedValuesTemplate} onSubmit={onSubmit} />
      </TestWrapper>
    )

    expect(container.querySelector('textarea[name="query"]')).toHaveValue('test query')

    // swicthing query updates records view
    // change one value to fixed
    const fixedInputIcon = container.querySelector('div[data-id="query-2"] span[data-icon="fixed-input"]')
    fireEvent.click(fixedInputIcon!)
    const runtimeBtn = await getByText('Runtime input')
    expect(runtimeBtn).toBeInTheDocument()
    fireEvent.click(runtimeBtn)
    expect(getByText('cv.customHealthSource.chartRuntimeWarning')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  test('should render in create mode', async () => {
    const onSubmit = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <PrometheusHealthSource isTemplate data={templateCreationData} onSubmit={onSubmit} />
      </TestWrapper>
    )
    // query is runtime by default
    expect(container.querySelector('input[name="query"]')).toHaveValue('<+input>')
    expect(getByText('cv.customHealthSource.chartRuntimeWarning')).toBeInTheDocument()

    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'groupName', value: 'group 1' })
    fireEvent.click(getByText('cv.monitoringSources.assign'))
    setFieldValue({ container, type: InputTypes.CHECKBOX, fieldId: 'sli', value: true })
    act(() => {
      fireEvent.click(getByText('submit'))
    })
    expect(onSubmit).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })
})
