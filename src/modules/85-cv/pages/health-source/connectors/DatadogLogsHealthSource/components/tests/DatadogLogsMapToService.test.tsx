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
import DatadogLogsMapToService from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/components/DatadogLogsMapToService'
import * as cvService from 'services/cv'
import type { QueryViewerProps } from '@cv/components/QueryViewer/types'
import type { DatadogLogsMapToServiceProps } from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/components/DatadogLogsMapToService.type'
import {
  DatadogLogQueryMock,
  MockRecordsData
} from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/components/tests/mock'

const sampleDataRecordsValidationMock = jest.fn()
const sampleDataRecordsErrorMock = jest.fn()

jest.mock('@cv/components/QueryViewer/QueryViewer', () => ({
  __esModule: true,
  QueryViewer: (props: QueryViewerProps) => {
    useEffect(() => {
      if (props.error) {
        sampleDataRecordsErrorMock(props.error.message)
      }
    }, [props.error])

    useEffect(() => {
      sampleDataRecordsValidationMock(props.records)
    }, [props.records])
    return (
      <>
        <Container>{props.query}</Container>
        <Container
          className="triggerFetchRecords"
          onClick={() => {
            props.fetchRecords()
          }}
        />
      </>
    )
  }
}))

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

function WrapperComponent(datadogLogsMapToServiceProps: DatadogLogsMapToServiceProps): JSX.Element {
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
      <SetupSourceTabs data={{}} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DatadogLogsMapToService {...datadogLogsMapToServiceProps} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('DatadogLogsMapToService unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(cvService, 'useGetDatadogLogIndexes').mockReturnValue({
      data: { data: ['log_index_1', 'log_index_2', 'log_index_3'] },
      refetch: jest.fn() as unknown
    } as any)
  })

  test('Ensure that correct query value is passed to QueryViewer', async () => {
    const mockFormikProps: any = {
      values: {
        ...DatadogLogQueryMock
      },
      setFieldValue: jest.fn()
    }
    const { getByText } = render(<WrapperComponent formikProps={mockFormikProps} sourceData={{}} />)

    await waitFor(() => {
      expect(getByText(mockFormikProps.values.query)).not.toBeNull()
    })
  })

  test('Ensure that sample data is fetched when fetchRecords is called', async () => {
    const mutateMock: any = jest.fn().mockReturnValue({
      status: 'SUCCESS',
      data: MockRecordsData
    }) as any
    jest.spyOn(cvService, 'useGetDatadogLogSampleData').mockReturnValue({
      mutate: mutateMock
    } as any)
    const mockFormikProps: any = {
      values: {
        ...DatadogLogQueryMock
      },
      setFieldValue: jest.fn()
    }
    const { container } = render(<WrapperComponent formikProps={mockFormikProps} sourceData={{}} />)
    const triggerFetchRecordsContainerMock = container.querySelector('.triggerFetchRecords')

    if (!triggerFetchRecordsContainerMock) {
      throw Error('Mock container is not rendered.')
    }
    // click will trigger fetchRecords
    fireEvent.click(triggerFetchRecordsContainerMock)

    await waitFor(() => {
      expect(sampleDataRecordsValidationMock).toHaveBeenNthCalledWith(2, MockRecordsData)
    })
  })

  test('Ensure that proper error is passed to QueryViewer when retrieving sample data fails', async () => {
    const errorMessage = 'Mock error message'
    const mutateMock: any = jest.fn().mockReturnValue({
      status: 'ERROR'
    }) as any
    jest.spyOn(cvService, 'useGetDatadogLogSampleData').mockReturnValue({
      mutate: mutateMock,
      error: {
        message: errorMessage,
        status: 400
      }
    } as any)
    const mockFormikProps: any = {
      values: {
        ...DatadogLogQueryMock
      },
      setFieldValue: jest.fn()
    }
    const { container } = render(<WrapperComponent formikProps={mockFormikProps} sourceData={{}} />)
    const triggerFetchRecordsContainerMock = container.querySelector('.triggerFetchRecords')

    if (!triggerFetchRecordsContainerMock) {
      throw Error('Mock container is not rendered.')
    }
    // click will trigger fetchRecords
    fireEvent.click(triggerFetchRecordsContainerMock)
    await waitFor(() => {
      expect(sampleDataRecordsErrorMock).toHaveBeenNthCalledWith(1, errorMessage)
    })
  })
})
