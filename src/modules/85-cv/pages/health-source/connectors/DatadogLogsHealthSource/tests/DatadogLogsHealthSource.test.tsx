/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { DatadogLogsHealthSource } from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/DatadogLogsHealthSource'
import type { MultiItemsSideNavProps } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import type { DatadogLogsHealthSourceProps } from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/DatadogLogsHealthSource.type'
import {
  DatadogLogMockHealthSource,
  DatadogLogQueryMock1,
  DatadogLogQueryMock2,
  DatadogLogQueryMock3
} from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/tests/mock'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

function WrapperComponent({ data, onSubmit }: DatadogLogsHealthSourceProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier
      }}
    >
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DatadogLogsHealthSource data={data} onSubmit={onSubmit} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

const createdMetricsValidationMock = jest.fn()
jest.mock('@cv/components/MultiItemsSideNav/MultiItemsSideNav', () => ({
  __esModule: true,
  MultiItemsSideNav: (props: MultiItemsSideNavProps) => {
    const { createdMetrics } = props
    // whenever createdMetrics is changed, call mock so test can validate passed props
    useEffect(() => {
      createdMetricsValidationMock(createdMetrics)
    }, [createdMetrics])
    return (
      <>
        <Container
          className="selectAddMetricContainer"
          onClick={() => {
            if (createdMetrics) {
              const newMetric = DatadogLogQueryMock3.name
              props.onSelectMetric('New created metric', createdMetrics.concat(newMetric), createdMetrics?.length)
            }
          }}
        />
        <Container
          className="selectRemoveMetricContainer"
          onClick={() => {
            if (createdMetrics) {
              const createdMetricsCopy = createdMetrics.slice()
              const removedMetric = createdMetricsCopy.pop()
              if (removedMetric) {
                props.onRemoveMetric(removedMetric, createdMetricsCopy[0], createdMetricsCopy, 0)
              }
            }
          }}
        />
      </>
    )
  }
}))

jest.mock(
  '@cv/pages/health-source/connectors/DatadogLogsHealthSource/components/DatadogLogsMapToService',
  () => (_: any) => {
    return <></>
  }
)

describe('DatadogLogsHealthSource unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure that existing queries (metrics) are transformed and passed to MultiItemsSideNav correctly.', async () => {
    // render component with mock health source which contains DatadogLog queries
    render(<WrapperComponent data={DatadogLogMockHealthSource as any} onSubmit={jest.fn()} />)

    expect(createdMetricsValidationMock).toHaveBeenNthCalledWith(1, [
      DatadogLogQueryMock1.name,
      DatadogLogQueryMock2.name
    ])
  })

  test('It should add new created metric to metrics map', async () => {
    // render component with mock health source which contains DatadogLog queries
    const { container } = render(<WrapperComponent data={DatadogLogMockHealthSource as any} onSubmit={jest.fn()} />)
    const selectAddMetricContainerMock = container.querySelector('.selectAddMetricContainer')

    if (!selectAddMetricContainerMock) {
      throw Error('Mock container is not rendered.')
    }
    // click will trigger onSelectMetric with new metric created
    fireEvent.click(selectAddMetricContainerMock)

    // now it should have been called with additional element which is created after event is fired
    await waitFor(() => {
      expect(createdMetricsValidationMock).toHaveBeenNthCalledWith(2, [
        DatadogLogQueryMock1.name,
        DatadogLogQueryMock2.name,
        DatadogLogQueryMock3.name
      ])
    })
  })

  test('It should remove deleted metric from metrics map', async () => {
    // render component with mock health source which contains DatadogLog queries
    const { container } = render(<WrapperComponent data={DatadogLogMockHealthSource as any} onSubmit={jest.fn()} />)
    const selectRemoveMetricContainerMock = container.querySelector('.selectRemoveMetricContainer')

    if (!selectRemoveMetricContainerMock) {
      throw Error('Mock container is not rendered.')
    }
    // click will trigger onSelectMetric with new metric created
    fireEvent.click(selectRemoveMetricContainerMock)

    // now it should have been called with updated metrics list, without removed element
    await waitFor(() => {
      expect(createdMetricsValidationMock).toHaveBeenNthCalledWith(2, [DatadogLogQueryMock1.name])
    })
  })
})
