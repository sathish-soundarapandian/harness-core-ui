/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { RenderResult} from '@testing-library/react';
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Clause } from 'services/cf'
import type {
  TargetGroupCriteriaConditionListingProps
} from '../TargetGroupCriteriaConditionListing';
import TargetGroupCriteriaConditionListing from '../TargetGroupCriteriaConditionListing'

const renderComponent = (props: Partial<TargetGroupCriteriaConditionListingProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetGroupCriteriaConditionListing {...props} />
    </TestWrapper>
  )

describe('TargetGroupCriteriaConditionListing', () => {
  test('it should display the no condition message when no rules are passed', async () => {
    renderComponent()

    expect(screen.getByText('cf.segmentDetail.noConditionDefined')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  test('it should display a list of conditions', async () => {
    const rules = [
      { attribute: 'email', op: 'startsWith', values: ['test@test'], id: 'id1' },
      { attribute: 'name', op: 'endsWith', values: ['test1', 'test2'], id: 'id2' },
      { attribute: 'something', op: 'contains', values: ['else'], id: 'id3' }
    ] as Clause[]

    renderComponent({ rules })

    expect(screen.queryByText('cf.segmentDetail.noConditionDefined')).not.toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(rules.length)
  })
})
