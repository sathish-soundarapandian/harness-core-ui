/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import { getDefaultReducerState } from '@pipeline/components/LogsContent/LogsState/utils'
import type { UseActionCreatorReturn } from '@pipeline/components/LogsContent/LogsState/actions'
import { ServiceNowImportSetView } from '../ServiceNowImportSetView/ServiceNowImportSetView'

const stepProps = {
  outcomes: {
    output: {
      transformMapOutcomes: [
        {
          displayValue: 'displayValue',
          targetRecordURL: 'targetRecordURL',
          status: 'success'
        },
        {
          status: 'error',
          errorMessage: 'errorMessage'
        }
      ]
    }
  }
} as unknown as ExecutionNode

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

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  get: jest.fn((_, arg2) => {
    switch (arg2) {
      case 'displayValue': {
        return 'displayValue'
      }
      case 'errorMessage': {
        return 'errorMessage'
      }
      case 'targetRecordURL': {
        return 'targetRecordURL'
      }
      default: {
        return [
          {
            displayValue: 'displayValue',
            targetRecordURL: 'targetRecordURL',
            status: 'success'
          },
          {
            status: 'error',
            errorMessage: 'errorMessage'
          }
        ]
      }
    }
  }),
  isNil: jest.fn(() => {
    return false
  }),
  isEmpty: jest.fn(() => {
    return false
  })
}))

describe('ServiceNowImportSet View Test ', () => {
  test('snapshot for displaying import set details', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceNowImportSetView step={stepProps}></ServiceNowImportSetView>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
