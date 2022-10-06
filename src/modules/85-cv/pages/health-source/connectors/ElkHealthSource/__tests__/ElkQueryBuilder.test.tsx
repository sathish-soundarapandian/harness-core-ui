/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Button } from '@harness/uicore'
import { Connectors } from '@connectors/constants'
import { TestWrapper } from '@common/utils/testUtils'
import { sourceData, mockedElkIndicesData, mockedElkSampleData, mockedElkTimeStampFormat } from './ElkHealthSource.mock'
import { ElkQueryBuilder } from '../components/MapQueriesToHarnessService/ElkQueryBuilder'

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { sourceType: Connectors.Elk },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))
// src/modules/85-cv/pages/health-source/common/DrawerFooter/DrawerFooter.tsx
jest.mock('@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout', () => ({
  SetupSourceLayout: function MockComponent(props: any) {
    const setFieldValue = props.content.props.children[1].props.formikProps.setFieldValue

    return (
      <>
        <div></div>

        <Button onClick={() => props.leftPanelContent.props.onRemoveMetric('test', 'test', ['test'], 0)}>
          removeMetric
        </Button>
        <Button
          onClick={() => {
            setFieldValue('query', '*')
            setFieldValue('timeStampFormat', '*')
            setFieldValue('serviceInstance', '*')
            setFieldValue('logIndexes', '*')
            setFieldValue('identify_timestamp', '*')
            setFieldValue('messageIdentifier', '*')
          }}
        >
          update
        </Button>
        <Button
          onClick={() =>
            props.leftPanelContent.props.onRemoveMetric(
              `getString('cv.monitoringSources.Elk.ElkLogsQuery')`,
              `getString('cv.monitoringSources.Elk.ElkLogsQuery')`,
              [`getString('cv.monitoringSources.Elk.ElkLogsQuery')`],
              0
            )
          }
        >
          removeMetric2
        </Button>
        <Button
          onClick={() =>
            props.leftPanelContent.props.onRemoveMetric('ELK Logs Query', 'ELK Logs Query', ['ELK Logs Query'], 0)
          }
        >
          removeMetric3
        </Button>
        <Button onClick={() => props.leftPanelContent.props.onSelectMetric('test', ['test'], 0)}>selectMetric</Button>
      </>
    )
  }
}))

jest.mock('@cv/pages/health-source/common/DrawerFooter/DrawerFooter', () => ({
  __esModule: true,
  default: function MockComponent(props: any) {
    return (
      <>
        <Button
          onClick={() => {
            props.onNext()
          }}
        >
          submit
        </Button>
        <Button onClick={props.onPrevious}>previous</Button>
      </>
    )
  }
}))

jest.mock('services/cv', () => ({
  useGetELKSavedSearches: jest.fn().mockImplementation(() => ({
    data: [],
    refetch: jest.fn()
  })),
  useGetELKLogSampleData: jest.fn().mockImplementation(() => ({
    data: mockedElkSampleData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetELKIndices: jest.fn().mockImplementation(() => ({
    data: mockedElkIndicesData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetTimeFormat: jest.fn().mockImplementation(() => ({
    data: mockedElkTimeStampFormat,
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('test ElkHealthsource', () => {
  test('check snapshot', () => {
    const { getByText } = render(
      <TestWrapper>
        <ElkQueryBuilder onSubmit={jest.fn()} data={sourceData} onPrevious={jest.fn()} />
      </TestWrapper>
    )

    fireEvent.click(getByText('removeMetric2'))
    fireEvent.click(getByText('removeMetric'))
    fireEvent.click(getByText('removeMetric3'))
    fireEvent.click(getByText('selectMetric'))
    fireEvent.click(getByText('previous'))
    fireEvent.click(getByText('update'))
    fireEvent.click(getByText('submit'))

    expect(true).toBeTruthy()
  })

  test('connector ref as an object', () => {
    render(
      <TestWrapper>
        <ElkQueryBuilder
          onSubmit={jest.fn()}
          data={{ ...sourceData, connectorRef: { value: 'elk_conn' } }}
          onPrevious={jest.fn()}
        />
      </TestWrapper>
    )
    expect(true).toBeTruthy()
  })
})
