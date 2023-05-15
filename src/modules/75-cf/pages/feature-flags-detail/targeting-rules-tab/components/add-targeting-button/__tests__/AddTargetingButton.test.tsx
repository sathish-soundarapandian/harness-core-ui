/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import AddTargetingButton from '../AddTargetingButton'

const renderComponent = (): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <AddTargetingButton
        addPercentageRollout={jest.fn()}
        addVariation={jest.fn()}
        variationColorMap={{
          true_id: 'blue',
          false_id: 'red'
        }}
        targetingDropdownVariations={[
          {
            identifier: 'true_id',
            name: '',
            value: 'true'
          },
          {
            identifier: 'false_id',
            name: '',
            value: 'false'
          }
        ]}
      />
    </TestWrapper>
  )
}

describe('AddTargetingButton', () => {
  test('it should default to identifier if name not present', async () => {
    renderComponent()

    await userEvent.click(screen.getByText('cf.featureFlags.rules.addTargeting'))

    expect(screen.getByText('true_id'))
    expect(screen.getByText('false_id'))
  })
})
