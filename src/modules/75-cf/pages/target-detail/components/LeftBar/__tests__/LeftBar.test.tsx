/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Target } from 'services/cf'
import LeftBar, { LeftBarProps } from '../LeftBar'

const mockTarget = {
  identifier: 't1',
  name: 'Target 1',
  attributes: {
    attr1: 'Attribute 1',
    attr2: 'Attribute 2'
  }
} as any as Target

const renderComponent = (props: Partial<LeftBarProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <LeftBar target={mockTarget} {...props} />
    </TestWrapper>
  )

describe('LeftBar', () => {
  test('it should display the Target Attributes tab', async () => {
    renderComponent()

    expect(screen.getByText('cf.targetDetail.attributes')).toBeInTheDocument()
  })

  test('it should display the Target Groups tab', async () => {
    renderComponent()

    expect(screen.getByText('cf.shared.segments')).toBeInTheDocument()
  })
})
