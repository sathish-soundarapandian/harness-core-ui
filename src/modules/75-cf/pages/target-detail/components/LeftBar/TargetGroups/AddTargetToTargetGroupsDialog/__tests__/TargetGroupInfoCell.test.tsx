/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TargetGroupInfoCell, { TargetGroupInfoCellProps } from '../TargetGroupInfoCell'

const renderComponent = (props: Partial<TargetGroupInfoCellProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetGroupInfoCell row={{ original: { name: 'Test', identifier: 'test' } }} {...props} />
    </TestWrapper>
  )

describe('TargetGroupInfoCell', () => {
  test('it should display the name of the Tagret Group', async () => {
    const name = 'TEST NAME'
    renderComponent({ row: { original: { name, identifier: 'test' } } })

    expect(screen.getByText(name)).toBeInTheDocument()
  })
})
