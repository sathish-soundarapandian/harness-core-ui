/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { ProvisioningStatusPill } from '../ProvisioningStatusPill'
import { ProvisioningStatus } from '../Constants'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('Test ProvisioningStatusPill component', () => {
  test('Initial render', () => {
    const { container } = render(<ProvisioningStatusPill onStartProvisioning={jest.fn()} />)
    expect(container).toMatchInlineSnapshot(`<div />`)
  })

  test('Render TO_DO state', () => {
    const { getByText } = render(
      <ProvisioningStatusPill provisioningStatus={ProvisioningStatus.TO_DO} onStartProvisioning={jest.fn()} />
    )
    expect(getByText('ci.getStartedWithCI.startProvisioning')).toBeInTheDocument()
  })

  test('Render FAILURE state', () => {
    const { getByText } = render(
      <ProvisioningStatusPill provisioningStatus={ProvisioningStatus.FAILURE} onStartProvisioning={jest.fn()} />
    )
    expect(getByText('ci.getStartedWithCI.provisioningFailed')).toBeInTheDocument()
  })

  test('Render SUCCESS state', () => {
    const { getByText } = render(
      <ProvisioningStatusPill provisioningStatus={ProvisioningStatus.SUCCESS} onStartProvisioning={jest.fn()} />
    )
    expect(getByText('ci.successful')).toBeInTheDocument()
  })
})
