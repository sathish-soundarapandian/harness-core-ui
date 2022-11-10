/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { useMutateAsGet } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { SLOList } from '../SLOList'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

describe('SLOList error and loading', () => {
  test('should render loading state', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return {
        data: {},
        loading: true,
        error: null,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper>
        <SLOList filter={{}} onAddSLO={jest.fn()} hideDrawer={jest.fn()} serviceLevelObjectivesDetails={[]} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('should render error state', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return {
        data: {},
        loading: false,
        error: { data: {} },
        refetch: jest.fn()
      }
    })
    const { getByText } = render(
      <TestWrapper>
        <SLOList filter={{}} onAddSLO={jest.fn()} hideDrawer={jest.fn()} serviceLevelObjectivesDetails={[]} />
      </TestWrapper>
    )
    expect(getByText('Retry')).toBeInTheDocument()
    act(() => {
      fireEvent.click(getByText('Retry'))
    })
  })
})
