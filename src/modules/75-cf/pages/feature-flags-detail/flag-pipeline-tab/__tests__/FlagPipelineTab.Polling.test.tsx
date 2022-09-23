/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServicesMock from 'services/cf'
import FlagPipelineTab, { FlagPipelineTabProps } from '../FlagPipelineTab'

const renderComponent = (props: Partial<FlagPipelineTabProps> = {}): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags/TEST_FLAG"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      queryParams={{ tab: 'flag_pipeline', activeEnvironment: 'TEST_ENV' }}
    >
      <FlagPipelineTab flagIdentifier="TEST_FLAG" flagVariations={[]} {...props} />
    </TestWrapper>
  )
}
describe('FlagPipelineTab - Polling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cfServicesMock, 'useCreateFlagPipeline').mockReturnValue({
      mutate: jest.fn()
    } as any)

    jest.spyOn(cfServicesMock, 'usePatchFeaturePipeline').mockReturnValue({
      mutate: jest.fn()
    } as any)

    jest.spyOn(cfServicesMock, 'useDeleteFeaturePipeline').mockReturnValue({
      mutate: jest.fn()
    } as any)

    jest.spyOn(cfServicesMock, 'useGetAvailableFeaturePipelines').mockReturnValue({
      data: {
        availablePipelines: []
      },
      loading: false,
      refetch: jest.fn()
    } as any)
  })
  const getFeaturePipelineRefetchMock = jest.fn()
  test('it should poll API after load', async () => {
    jest.useFakeTimers()
    jest.spyOn(cfServicesMock, 'useGetFeaturePipeline').mockReturnValue({
      data: {
        pipelineConfigured: true,
        pipelineDetails: {
          identifier: 'pipeline5',
          name: 'Pipeline 5',
          description: 'This is a test pipeline'
        }
      },
      loading: false,

      refetch: getFeaturePipelineRefetchMock
    } as any)
    renderComponent()

    // Polling is set to 5 seconds, so advance time to trigger it
    jest.runAllTimers()
    await waitFor(() => expect(getFeaturePipelineRefetchMock).toHaveBeenCalled())
  })
})
