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
import { JiraCreateUpdateView } from '../JiraCreateUpdateView/JiraCreateUpdateView'
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

const stepArrayProps = {
  outcomes: [
    {
      issue: {
        id: 'test',
        key: 'test123'
      }
    },
    {
      issue: {
        id: 'test',
        key: 'test123'
      }
    }
  ]
} as unknown as ExecutionNode

const stepProps = {
  outcomes: {
    output: {
      issue: {
        id: 'test',
        key: 'test123'
      }
    }
  }
} as unknown as ExecutionNode

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  get: jest.fn(() => {
    return {
      key: 'test',
      url: 'testURL'
    }
  })
}))

describe('Jiracreateupdate view test ', () => {
  test('output snapshot if array is present of outcomes', () => {
    const { container } = render(
      <TestWrapper>
        <JiraCreateUpdateView step={stepArrayProps} executionMetadata={executionMetadata}></JiraCreateUpdateView>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('output snapshot if  not array', () => {
    jest.spyOn(loadAsh, 'get').mockReturnValue({ key: 'test', url: '' })
    const { container } = render(
      <TestWrapper>
        <JiraCreateUpdateView step={stepProps} executionMetadata={executionMetadata}></JiraCreateUpdateView>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
