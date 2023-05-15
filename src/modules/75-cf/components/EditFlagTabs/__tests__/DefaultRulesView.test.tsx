/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FormikProps } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import type { Variation } from 'services/cf'
import type { FlagActivationFormValues } from '@cf/components/FlagActivation/FlagActivation'
import { DefaultRulesView, DefaultRulesViewProps } from '../DefaultRulesView'

const mockVariations: Variation[] = [
  { name: 'Variation 1', identifier: 'var1', value: 'var1' },
  { identifier: 'var2', value: 'var2' },
  { name: 'Variation 3', identifier: 'var3', value: 'var3' }
]

const renderComponent = (props: Partial<DefaultRulesViewProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <DefaultRulesView
        editing={false}
        variations={mockVariations}
        formikProps={
          {
            values: { onVariation: mockVariations[0].identifier, offVariation: mockVariations[1].identifier },
            handleChange: jest.fn()
          } as unknown as FormikProps<FlagActivationFormValues>
        }
        {...props}
      />
    </TestWrapper>
  )

describe('DefaultRulesView', () => {
  test('it should show the ON and OFF variations', async () => {
    renderComponent({ editing: true })

    expect(screen.getByText('cf.featureFlags.rules.defaultRules')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.ifFlagOnServe')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.ifFlagOffServe')).toBeInTheDocument()
  })

  test.each(['on', 'off'])('it should display the %s select input when editing is true', async variationType => {
    const { container } = renderComponent({ editing: true })

    const inputEl = container.querySelector(`[name="${variationType}Variation"]`) as HTMLInputElement
    expect(inputEl).toBeInTheDocument()

    for (const { name, identifier } of mockVariations) {
      expect(screen.queryByText(name || identifier)).not.toBeInTheDocument()
    }

    await userEvent.click(inputEl)

    await waitFor(() => {
      for (const { name, identifier } of mockVariations) {
        expect(screen.getByText(name || identifier)).toBeInTheDocument()
      }
    })
  })
})
