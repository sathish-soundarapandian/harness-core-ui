/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponseRetryHistoryResponseDto, ResponseRetryLatestExecutionResponseDto } from 'services/pipeline-ng'

export const mockRetryHistory: UseGetMockDataWithMutateAndRefetch<ResponseRetryHistoryResponseDto> = {
  loading: false,
  mutate: jest.fn(),
  refetch: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      errorMessage: null as unknown as undefined,
      latestExecutionId: 'pWoxb6ZARgCrf2fYtZ4k5Q',
      executionInfos: [
        {
          uuid: 'pWoxb6ZARgCrf2fYtZ4k5Q',
          startTs: 1674472180977,
          endTs: null as unknown as undefined,
          status: 'WaitStepRunning'
        },
        {
          uuid: 'E06bTez4QQqP46wqMX9Mbg',
          startTs: 1674470567962,
          endTs: 1674471302466,
          status: 'Aborted'
        }
      ]
    },
    metaData: null as unknown as undefined,
    correlationId: '04b10adc-2516-4185-bc53-67c35d12ab01'
  }
}

export const mockLatestExecutionId: UseGetMockDataWithMutateAndRefetch<ResponseRetryLatestExecutionResponseDto> = {
  loading: false,
  mutate: jest.fn(),
  refetch: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      errorMessage: null as unknown as undefined,
      latestExecutionId: 'pWoxb6ZARgCrf2fYtZ4k5Q'
    },
    metaData: null as unknown as undefined,
    correlationId: '04b10adc-2516-4185-bc53-67c35d12ab01'
  }
}
