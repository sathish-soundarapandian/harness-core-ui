/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { UseMutateFunction, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { TestWrapper } from '@common/utils/testUtils'
import {
  SettingsGetSettingError,
  SettingsSaveSettingError,
  SettingsSaveSettingVariables,
  useSettingsGetSetting,
  useSettingsSaveSetting
} from 'services/ticket-service/ticketServiceComponents'
import type { Setting } from 'services/ticket-service/ticketServiceSchemas'
import TicketSettings from '../TicketSettings'

jest.mock('services/ticket-service/ticketServiceComponents')
jest.mock('@connectors/components/ConnectorReferenceField/ConnectorReferenceField', () => ({
  ConnectorReferenceField: jest.fn(() => <div>ConnectorReferenceField</div>)
}))

const useSettingsGetSettingMock = useSettingsGetSetting as jest.MockedFunction<typeof useSettingsGetSetting>
const useSettingsSaveSettingMock = useSettingsSaveSetting as jest.MockedFunction<typeof useSettingsSaveSetting>

describe('Ticket Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('matches snapshot', () => {
    useSettingsGetSettingMock.mockImplementation(
      () =>
        ({
          data: {
            connectorId: 'Test_Sandbox',
            service: 'Jira'
          } as Setting,
          isLoading: false
        } as UseQueryResult<Setting, SettingsGetSettingError>)
    )
    useSettingsSaveSettingMock.mockImplementation(
      () =>
        ({
          mutate: jest.fn() as UseMutateFunction<
            undefined,
            SettingsSaveSettingError,
            SettingsSaveSettingVariables,
            unknown
          >
        } as UseMutationResult<undefined, SettingsSaveSettingError, SettingsSaveSettingVariables, unknown>)
    )

    const { container } = render(
      <TestWrapper>
        <TicketSettings />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
