/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { externalAPICallLogsResponse } from '@cv/hooks/useLogContentHook/__test__/ExecutionLog.mock'
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

    expect(screen.getByText('03/11/2022, 4:15:42 PM')).toBeInTheDocument()
    expect(
      screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query')
    ).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.fetchingDataFrom https://qva35651.live.dynatrace.com/api/v2/metrics/query'))

    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
