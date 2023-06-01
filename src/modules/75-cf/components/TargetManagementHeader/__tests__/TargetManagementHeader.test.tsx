/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import TargetManagementHeader from '@cf/components/TargetManagementHeader/TargetManagementHeader'
import { TestWrapper } from '@common/utils/testUtils'

const envSelectId = 'TEST_ENV_SELECT'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderComponent = (hasEnvironments = true) =>
  render(
    <TargetManagementHeader
      environmentSelect={<span data-testid={envSelectId}>Select</span>}
      hasEnvironments={hasEnvironments}
    />,
    { wrapper: TestWrapper }
  )

describe('TargetManagementHeader', () => {
  test('it should render the section toggle and environment switcher', async () => {
    renderComponent()

    expect(screen.getByRole('link', { name: 'cf.shared.targets' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'cf.shared.segments' })).toBeInTheDocument()
    expect(screen.getByTestId(envSelectId)).toBeInTheDocument()
  })

  test('it should render the spacer when hasEnvironments is false', async () => {
    renderComponent(true)
    expect(screen.queryByTestId('CFTargetManagementHeaderSpacer')).not.toBeInTheDocument()

    renderComponent(false)
    expect(screen.queryByTestId('CFTargetManagementHeaderSpacer')).toBeInTheDocument()
  })
})
