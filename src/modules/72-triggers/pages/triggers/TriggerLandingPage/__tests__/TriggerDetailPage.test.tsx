/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PipelineResponse } from '@pipeline/pages/pipeline-details/__tests__/PipelineDetailsMocks'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { GetTriggerResponse } from '@triggers/pages/trigger-details/TriggerDetailsMock'
import { GetTriggerDetailsResponse } from '../../__tests__/TriggerDetailPageMock'
import TriggerLandingPage from '../TriggerLandingPage'
import TriggerDetailPage from '../TriggerDetailPage/TriggerDetailPage'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const mockUpdateTrigger = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}))
jest.mock('services/pipeline-ng', () => ({
  useGetTrigger: jest.fn(() => GetTriggerResponse),
  useGetPipelineSummary: jest.fn(() => PipelineResponse),
  useGetTriggerDetails: jest.fn(() => GetTriggerDetailsResponse),
  useUpdateTrigger: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTrigger })),
  useGetSchemaYaml: jest.fn(() => ({}))
}))
const TEST_PATH = routes.toTriggersDetailPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })

describe('Test Trigger Detail Page Test', () => {
  test('should test snapshot view', async () => {
    const datespy = jest.spyOn(Date.prototype, 'toLocaleDateString')
    const timespy = jest.spyOn(Date.prototype, 'toLocaleTimeString')

    datespy.mockImplementation(() => 'MOCK_DATE')
    timespy.mockImplementation(() => 'MOCK_TIME')

    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          triggerIdentifier: 'triggerIdentifier',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <TriggerLandingPage>
          <TriggerDetailPage />
        </TriggerLandingPage>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const enableTriggerToggle = await screen.findByRole('checkbox', {
      name: /enabled/i
    })
    expect(enableTriggerToggle).toBeChecked()
    userEvent.click(enableTriggerToggle)
    expect(mockUpdateTrigger).toHaveBeenCalledTimes(1)

    datespy.mockRestore()
    timespy.mockRestore()
  })
})
