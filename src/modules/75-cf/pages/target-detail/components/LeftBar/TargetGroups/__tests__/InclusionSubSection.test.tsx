/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockTarget from '@cf/utils/testData/data/mockTarget'
import InclusionSubSection, { InclusionSubSectionProps } from '../InclusionSubSection'

const mockTargetGroups: InclusionSubSectionProps['targetGroups'] = [
  { identifier: 'tg1', name: 'Target Group 1' },
  { identifier: 'tg2', name: 'Target Group 2' },
  { identifier: 'tg3', name: 'Target Group 3' }
]

const renderComponent = (props: Partial<InclusionSubSectionProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <InclusionSubSection
        target={mockTarget}
        targetGroups={mockTargetGroups}
        onAddTargetGroups={jest.fn()}
        onRemoveTargetGroup={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('InclusionSubSection', () => {
  test('it should display the correct title and button', async () => {
    renderComponent()

    expect(screen.getByText('cf.targetDetail.manuallyAdded')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cf.targetDetail.addToSegment' })).toBeInTheDocument()
  })

  test('it should display the correct message when there are no target groups to display', async () => {
    renderComponent({ targetGroups: [] })

    expect(screen.getByText('cf.targetDetail.noSegmentAdded')).toBeInTheDocument()
  })
})
