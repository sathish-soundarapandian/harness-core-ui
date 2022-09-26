/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper } from '@common/utils/testUtils'
import ElkHealthSource from '../ElkHealthSource'
import { data, mockedElkIndicesData, mockedElkSampleData } from './ElkHealthSource.mock'

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { sourceType: Connectors.ELK },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

jest.mock('services/cv', () => ({
  // useGetElkSavedSearches: jest.fn().mockImplementation(() => ({
  //   data: [],
  //   refetch: jest.fn()
  // })),
  useGetELKLogSampleData: jest.fn().mockImplementation(() => ({
    data: mockedElkSampleData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetELKIndices: jest.fn().mockImplementation(() => ({
    data: mockedElkIndicesData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetTimeFormat: jest.fn().mockImplementation(() => ({
    data: [],
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('test ElkHealthsource', () => {
  test('check snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <ElkHealthSource data={data} onSubmit={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
