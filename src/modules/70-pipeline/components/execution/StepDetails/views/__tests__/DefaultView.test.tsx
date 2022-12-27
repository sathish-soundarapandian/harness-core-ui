/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import type { ResponseMessage } from 'services/pipeline-ng'

import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { getDefaultReducerState } from '@pipeline/components/LogsContent/LogsState/utils'
import type { UseActionCreatorReturn } from '@pipeline/components/LogsContent/LogsState/actions'
import { DefaultView } from '../DefaultView/DefaultView'
import { executionMetadata } from './mock'

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
describe('Default View Test', () => {
  test('renders snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <DefaultView
          step={{
            status: ExecutionStatusEnum.InterventionWaiting
          }}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('failure responses', () => {
    const responseMessage: ResponseMessage = {
      code: 'DEFAULT_ERROR_CODE'
    }
    const { container } = render(
      <TestWrapper>
        <DefaultView
          step={{
            status: ExecutionStatusEnum.Failed,
            failureInfo: {
              responseMessages: [responseMessage]
            }
          }}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('error in step evaluation', () => {
    const { container } = render(
      <TestWrapper>
        <DefaultView
          step={{
            status: ExecutionStatusEnum.Failed,
            executableResponses: [
              {
                skipTask: {
                  message: 'Failure to evaluate step'
                }
              }
            ]
          }}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
