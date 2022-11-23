/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import CompositeSLOConsumption from '../CompositeSLOConsumption'
import { consumptionTableData } from './CompositeSLOConsumption.mock'

const Wrapper = () => {
  return (
    <TestWrapper>
      <CompositeSLOConsumption startTime={0} endTime={0} />
    </TestWrapper>
  )
}

describe('validate CompositeSLOConsumption', () => {
  test('should render CompositeSLOConsumption with no data', () => {
    jest
      .spyOn(cvServices, 'useGetSloConsumptionBreakdownView')
      .mockReturnValue({ data: {}, loading: false, refetch: jest.fn } as any)
    const { getByText, rerender } = render(<Wrapper />)
    expect(getByText('cv.slos.noData')).toBeInTheDocument()
    jest
      .spyOn(cvServices, 'useGetSloConsumptionBreakdownView')
      .mockReturnValue({ data: { data: {} }, loading: false, refetch: jest.fn } as any)
    rerender(<Wrapper />)
    expect(getByText('cv.slos.noData')).toBeInTheDocument()

    jest
      .spyOn(cvServices, 'useGetSloConsumptionBreakdownView')
      .mockReturnValue({ data: { data: { content: [] } }, loading: false, refetch: jest.fn } as any)
    rerender(<Wrapper />)

    jest
      .spyOn(cvServices, 'useGetSloConsumptionBreakdownView')
      .mockReturnValue({ data: { data: { content: [{}] } }, loading: false, refetch: jest.fn } as any)
    rerender(<Wrapper />)
  })

  test('should render CompositeSLOConsumption in loading state', () => {
    jest
      .spyOn(cvServices, 'useGetSloConsumptionBreakdownView')
      .mockReturnValue({ data: {}, loading: true, refetch: jest.fn } as any)
    const { container } = render(<Wrapper />)
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('should render CompositeSLOConsumption in error state', () => {
    const refetch = jest.fn()
    jest
      .spyOn(cvServices, 'useGetSloConsumptionBreakdownView')
      .mockReturnValue({ data: {}, loading: false, error: { message: 'API Failed' }, refetch } as any)
    const { getByText } = render(<Wrapper />)
    expect(getByText('API Failed')).toBeInTheDocument()
    act(() => {
      userEvent.click(getByText('Retry'))
    })
    expect(refetch).toHaveBeenCalled()
  })

  test('should render CompositeSLOConsumption with data', () => {
    jest.spyOn(cvServices, 'useGetSloConsumptionBreakdownView').mockReturnValue({
      data: consumptionTableData,
      loading: false,
      error: null,
      refetch: jest.fn
    } as any)
    const { container, getByText } = render(<Wrapper />)
    expect(getByText('SLO 1')).toBeInTheDocument()
    expect(getByText('SLO 2')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
