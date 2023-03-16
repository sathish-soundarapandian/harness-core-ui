/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseMutateFunction, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { TestWrapper } from '@common/utils/testUtils'
import {
  SettingsGetSettingError,
  SettingsSaveSettingError,
  SettingsSaveSettingVariables,
  useSettingsGetSetting,
  useSettingsSaveSetting,
  useMetadataListProjects,
  MetadataListProjectsError,
  useMetadataGetProject,
  MetadataGetProjectError
} from 'services/ticket-service/ticketServiceComponents'
import type { MetadataListProjectsResponseBody, Project, Setting } from 'services/ticket-service/ticketServiceSchemas'
import ExternalTicketSettings from '../ExternalTicketSettings'

jest.mock('services/ticket-service/ticketServiceComponents')
jest.mock('@connectors/components/ConnectorReferenceField/ConnectorReferenceField', () => ({
  ConnectorReferenceField: jest.fn(() => <div>ConnectorReferenceField</div>)
}))

const useSettingsGetSettingMock = useSettingsGetSetting as jest.MockedFunction<typeof useSettingsGetSetting>
const useSettingsSaveSettingMock = useSettingsSaveSetting as jest.MockedFunction<typeof useSettingsSaveSetting>
const useMetadataListProjectsMock = useMetadataListProjects as jest.MockedFunction<typeof useMetadataListProjects>
const useMetadataGetProjectMock = useMetadataGetProject as jest.MockedFunction<typeof useMetadataGetProject>

const mockMutate = jest.fn() as UseMutateFunction<
  undefined,
  SettingsSaveSettingError,
  SettingsSaveSettingVariables,
  unknown
>

useSettingsGetSettingMock.mockImplementation(
  () =>
    ({
      data: {
        additional: { projectKey: 'DEMO', issueType: 'Bug' },
        connectorId: 'Test_Sandbox',
        service: 'Jira'
      } as Setting,
      isLoading: false
    } as UseQueryResult<Setting, SettingsGetSettingError>)
)
useSettingsSaveSettingMock.mockImplementation(
  () =>
    ({
      mutate: mockMutate
    } as UseMutationResult<undefined, SettingsSaveSettingError, SettingsSaveSettingVariables, unknown>)
)

useMetadataListProjectsMock.mockImplementation(
  () =>
    ({
      data: {
        projects: [
          { key: 'DEMO', name: 'Demo Project' },
          { key: 'TEST', name: 'Test Project' }
        ]
      } as MetadataListProjectsResponseBody,
      isLoading: false
    } as UseQueryResult<MetadataListProjectsResponseBody, MetadataListProjectsError>)
)

useMetadataGetProjectMock.mockImplementation(
  () =>
    ({
      data: {} as Project,
      isLoading: false
    } as UseQueryResult<Project, MetadataGetProjectError>)
)

describe('Ticket Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <ExternalTicketSettings />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('settings are updated', async () => {
    const { getByTitle } = render(
      <TestWrapper>
        <ExternalTicketSettings />
      </TestWrapper>
    )

    // Select new checkbox value when added
    const checkbox = getByTitle('checkbox')
    checkbox.click()

    await waitFor(() => expect(mockMutate).toBeCalledTimes(1))
    expect(mockMutate).toBeCalledWith(
      expect.objectContaining({
        body: {
          additional: { projectKey: 'TEST', issueType: 'Bug' },
          connectorId: 'Test_Sandbox',
          module: undefined,
          service: 'Jira'
        },
        queryParams: { accountId: undefined, orgId: undefined, projectId: undefined }
      }),
      expect.objectContaining({})
    )
  })
})
