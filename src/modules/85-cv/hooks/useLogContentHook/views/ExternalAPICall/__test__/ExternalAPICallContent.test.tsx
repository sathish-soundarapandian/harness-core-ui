/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  externalAPICallLogsJSONResponse,
  externalAPICallLogsMinimumResponse,
  externalAPICallLogsResponse
} from '@cv/hooks/useLogContentHook/__test__/ExecutionLog.mock'
import ExternalAPICallContent from '../ExternalAPICallContent'

describe('ExternalAPICallContent', () => {
  test('should render ExternalAPICallContent', async () => {
    const { container } = render(
      <TestWrapper>
        <ExternalAPICallContent
          resource={externalAPICallLogsResponse.resource}
          loading={false}
          refetchLogs={jest.fn()}
          setPageNumber={jest.fn()}
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          errorLogsOnly={false}
          setErrorLogsOnly={jest.fn()}
          pageNumber={0}
          handleDownloadLogs={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('03/11/2022, 4:15 PM')).toBeInTheDocument()
    expect(
      screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query')
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query')
    )

    expect(screen.getByText('[X-SF-TOKEN]')).toBeInTheDocument()
    expect(screen.getByText('POST')).toBeInTheDocument()
    expect(screen.getByText('"data(\\"otelcol_exporter_sent_metric_points\\").mean().publish()"')).toBeInTheDocument()

    await waitFor(() => expect(container).toMatchSnapshot())
  })

  test('should render ExternalAPICallContent with JSON body content', async () => {
    render(
      <TestWrapper>
        <ExternalAPICallContent
          resource={externalAPICallLogsJSONResponse.resource}
          loading={false}
          refetchLogs={jest.fn()}
          setPageNumber={jest.fn()}
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          errorLogsOnly={false}
          setErrorLogsOnly={jest.fn()}
          pageNumber={0}
          handleDownloadLogs={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('03/11/2022, 4:15 PM')).toBeInTheDocument()
    expect(
      screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query')
    ).toBeInTheDocument()

    await act(async () => {
      await userEvent.click(
        screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query')
      )
    })

    expect(screen.getByTestId('externalAPICallBodyContent_Json')).toBeInTheDocument()
  })

  test('should render ExternalAPICallContent for minimum available data in the response', async () => {
    render(
      <TestWrapper>
        <ExternalAPICallContent
          resource={externalAPICallLogsMinimumResponse.resource}
          loading={false}
          refetchLogs={jest.fn()}
          setPageNumber={jest.fn()}
          isFullScreen={false}
          setIsFullScreen={jest.fn()}
          errorLogsOnly={false}
          setErrorLogsOnly={jest.fn()}
          pageNumber={0}
          handleDownloadLogs={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('03/11/2022, 4:15 PM')).toBeInTheDocument()
    expect(
      screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query')
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query')
    )

    expect(screen.queryByText('Request Headers')).not.toBeInTheDocument()
    expect(screen.queryByText('Request Method')).not.toBeInTheDocument()
    expect(screen.queryByText('Request Body')).not.toBeInTheDocument()
  })
})
