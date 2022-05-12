/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import * as infiniteScrollHook from '@common/hooks/useInfiniteScroll'
import { TemplateActivityLog } from '../TemplateActivityLog'
import { mockActivityLogs } from './TemplateActivityLogTestHelper'

describe('API ERROR', () => {
  test('if error message is displayed', () => {
    jest.spyOn(infiniteScrollHook, 'useInfiniteScroll').mockReturnValue({
      items: [],
      error: 'someerror',
      fetching: false,
      attachRefToLastElement: jest.fn(),
      hasMore: { current: false },
      loadItems: jest.fn(),
      offsetToFetch: { current: 0 }
    })
    const { queryByText } = render(<TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />)

    expect(queryByText('someerror')).toBeTruthy()
  })
})

describe('API FETCHING', () => {
  test('if loading message is displayed', () => {
    jest.spyOn(infiniteScrollHook, 'useInfiniteScroll').mockReturnValue({
      items: [],
      error: '',
      fetching: true,
      attachRefToLastElement: jest.fn(),
      hasMore: { current: false },
      loadItems: jest.fn(),
      offsetToFetch: { current: 0 }
    })
    const { queryByText } = render(
      <TestWrapper>
        <TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />
      </TestWrapper>
    )

    expect(queryByText('templatesLibrary.fetchingActivityLogs')).toBeTruthy()
  })
})

describe('API SUCCESS', () => {
  test('if content is displayed', () => {
    jest.spyOn(infiniteScrollHook, 'useInfiniteScroll').mockReturnValue({
      items: mockActivityLogs,
      error: '',
      fetching: false,
      attachRefToLastElement: jest.fn(),
      hasMore: { current: false },
      loadItems: jest.fn(),
      offsetToFetch: { current: 0 }
    })

    const { container } = render(
      <TestWrapper>
        <TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('response data')
  })

  test('if content is displayed and next batch is fetching', () => {
    jest.spyOn(infiniteScrollHook, 'useInfiniteScroll').mockReturnValue({
      items: mockActivityLogs,
      error: '',
      fetching: true,
      attachRefToLastElement: jest.fn(),
      hasMore: { current: false },
      loadItems: jest.fn(),
      offsetToFetch: { current: 1 }
    })

    const { queryByText } = render(
      <TestWrapper>
        <TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />
      </TestWrapper>
    )

    expect(queryByText('templatesLibrary.fetchingActivityLogs')).toBeTruthy()
  })

  test('if empty content is displayed', () => {
    jest.spyOn(infiniteScrollHook, 'useInfiniteScroll').mockReturnValue({
      items: [],
      error: '',
      fetching: false,
      attachRefToLastElement: jest.fn(),
      hasMore: { current: false },
      loadItems: jest.fn(),
      offsetToFetch: { current: 0 }
    })

    const { queryByText } = render(
      <TestWrapper>
        <TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />
      </TestWrapper>
    )

    expect(queryByText('templatesLibrary.noActivityLogs')).toBeTruthy()
  })
})
