/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import TuneECSRecommendationCard from '../TuneECSRecommendationCard'

describe('Test Cases For ECSRecommendationDetails Component', () => {
  test('Should be able to render ECSRecommendationDetails Component', async () => {
    const { getByText } = render(
      <TestWrapper>
        <TuneECSRecommendationCard buffer={0} setBuffer={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText('ce.recommendation.detailsPage.setBuffer')).toBeDefined()
    expect(getByText('ce.recommendation.detailsPage.memoryValueBuffer')).toBeDefined()
  })
})
