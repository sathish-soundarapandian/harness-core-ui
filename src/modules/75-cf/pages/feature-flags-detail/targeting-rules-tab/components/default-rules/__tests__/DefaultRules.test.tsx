/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen } from '@testing-library/react'

import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { StringsMap } from 'framework/strings/StringsContext'
import DefaultRules, { DefaultRulesProps } from '../DefaultRules'

const renderComponent = (props: Partial<DefaultRulesProps> = {}): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <DefaultRules
        inputName="onVariation"
        titleStringId={'default.serve' as keyof StringsMap}
        featureFlagVariations={[
          { identifier: 'true', name: 'True', value: 'true' },
          { identifier: 'false', name: 'False', value: 'false' }
        ]}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagEnabledDefaultRulesCard', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should render variations correctly', async () => {
    renderComponent()

    const onVariationDropdown = document.querySelector('input[name="onVariation"]') as HTMLSelectElement
    expect(onVariationDropdown).toBeInTheDocument()

    await userEvent.click(onVariationDropdown)

    expect(screen.getByText('False')).toBeInTheDocument()
    expect(screen.getByText('True')).toBeInTheDocument()
  })

  test('it should fallback to identifier for label when name is undefined', async () => {
    const variations = [
      { identifier: 'true_id', name: undefined, value: 'true' },
      { identifier: 'false_id', name: undefined, value: 'false' }
    ]
    renderComponent({ featureFlagVariations: variations })

    const onVariationDropdown = document.querySelector('input[name="onVariation"]') as HTMLSelectElement
    expect(onVariationDropdown).toBeInTheDocument()

    await userEvent.click(onVariationDropdown)

    expect(screen.getByText('true_id')).toBeInTheDocument()
    expect(screen.getByText('false_id')).toBeInTheDocument()
  })
})
