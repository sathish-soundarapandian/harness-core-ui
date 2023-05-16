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
import type { LevelUpBannerProps } from '../LevelUpBanner';
import LevelUpBanner from '../LevelUpBanner'

const renderComponent = (props: Partial<LevelUpBannerProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <LevelUpBanner message={{}} {...props} />
    </TestWrapper>
  )

describe('LevelUpBanner', () => {
  test('it should display the banner with the message', async () => {
    renderComponent({ message: 'click here to go' })

    expect(screen.getByText('common.levelUp')).toBeInTheDocument()
    expect(screen.getByText('click here to go')).toBeInTheDocument()
  })
})
