/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SustainabilityCard from '../SustainabilityCard'

const mockedCardDetails = {
  title: 'Sustainability card title',
  firstColValue: '1234',
  firstColText: 'Total',
  secondColValue: '1020',
  secondColText: 'Reduced'
}

describe('Sustainability Card test', () => {
  test('should show loader while fetching the data', () => {
    const { container } = render(
      <TestWrapper>
        <SustainabilityCard {...mockedCardDetails} fetching={true} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should show card details after getting data', () => {
    const { container } = render(
      <TestWrapper>
        <SustainabilityCard {...mockedCardDetails} fetching={false} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
