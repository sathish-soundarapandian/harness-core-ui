/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import * as loadAsh from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import { getDefaultReducerState } from '@pipeline/components/LogsContent/LogsState/utils'
import type { UseActionCreatorReturn } from '@pipeline/components/LogsContent/LogsState/actions'
import { ServiceNowCreateUpdateView } from '../ServiceNowCreateUpdateView/ServiceNowCreateUpdateView'

const actions: UseActionCreatorReturn = {
  createSections: jest.fn(),
  fetchSectionData: jest.fn(),
  fetchingSectionData: jest.fn(),
  updateSectionData: jest.fn(),
  toggleSection: jest.fn(),
  resetSection: jest.fn(),
  search: jest.fn(),
  resetSearch: jest.fn(),
  goToNextSearchResult: jest.fn(),
  goToPrevSearchResult: jest.fn()
}

jest.mock('@pipeline/components/LogsContent/useLogsContent.tsx', () => ({
  useLogsContent: jest.fn(() => ({
    state: getDefaultReducerState(),
    actions
  }))
}))

const stepProps = {
  outcomes: {
    output: {
      ticket: {
        ticketNumber: 'ticketNumber',
        ticketUrl: 'ticketUrl'
      }
    }
  }
} as unknown as ExecutionNode

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  get: jest.fn(() => {
    return {
      ticketNumber: 'ticketNumber',
      ticketUrl: 'ticketUrl'
    }
  })
}))

describe('ServiceNowcreateupdate view test ', () => {
  test('snapshot for displaying ticketNumber info', () => {
    jest.spyOn(loadAsh, 'get').mockReturnValue({ ticketNumber: 'ticketNumber', ticketUrl: 'ticketUrl' })
    const { container } = render(
      <TestWrapper>
        <ServiceNowCreateUpdateView step={stepProps}></ServiceNowCreateUpdateView>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
