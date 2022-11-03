/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import type { Variation } from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import { CFPipelineInstructionType } from '../../../types'
import DefaultRules, { DefaultRulesProps, defaultRulesSchema } from '../DefaultRules'

const mockVariations: Variation[] = [
  { identifier: 'TEST_1_ID', name: 'TEST 1 NAME', value: 'TEST_1_VALUE', description: 'TEST 1 DESCRIPTION' },
  { identifier: 'TEST_2_ID', value: 'TEST_2_VALUE', description: 'TEST 2 DESCRIPTION' },
  { identifier: 'TEST_3_ID', name: 'TEST 3 NAME', value: 'TEST_3_VALUE', description: 'TEST 3 DESCRIPTION' }
]

const renderComponent = (props: Partial<DefaultRulesProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik onSubmit={jest.fn()} initialValues={{}}>
        <DefaultRules
          subSectionSelector={<span />}
          setField={jest.fn()}
          variations={mockVariations}
          prefix={jest.fn((fieldName: string) => fieldName)}
          {...props}
        />
      </Formik>
    </TestWrapper>
  )

describe('DefaultRules', () => {
  describe.each(['On', 'Off'])('%s default variation', (defaultRuleType: string) => {
    test(`it should display a select box for the ${defaultRuleType} default variation`, async () => {
      const { container } = renderComponent()

      expect(screen.getByText(`cf.pipeline.flagConfiguration.whenTheFlagIs${defaultRuleType}Serve`)).toBeInTheDocument()
      const selectors = `[name$="spec.${defaultRuleType.toLowerCase()}"]`
      expect(container.querySelector(selectors)).toBeInTheDocument()
    })

    test(`it should fill the select with the available variations for the ${defaultRuleType} default variation `, async () => {
      const { container } = renderComponent()

      const select = container.querySelector(`[name$="spec.${defaultRuleType.toLowerCase()}"]`)?.closest('.bp3-input')
      expect(select).toBeInTheDocument()

      mockVariations.forEach(({ name, identifier }) => {
        expect(screen.queryByText(name || identifier)).not.toBeInTheDocument()
      })

      userEvent.click(select as HTMLElement)
      await waitFor(() => {
        mockVariations.forEach(({ name, identifier }) => {
          expect(screen.getByText(name || identifier)).toBeInTheDocument()
        })
      })
    })
  })

  test('it should call the setField function with identifier and type', async () => {
    const setFieldMock = jest.fn()
    renderComponent({ setField: setFieldMock })

    await waitFor(() => {
      expect(setFieldMock).toHaveBeenCalledWith('identifier', expect.any(String))
      expect(setFieldMock).toHaveBeenCalledWith('type', CFPipelineInstructionType.SET_DEFAULT_VARIATIONS)
    })
  })
})

describe('defaultRulesSchema', () => {
  const getStringMock = jest.fn().mockImplementation(str => str)

  test('it should throw when neither off nor on are specified', async () => {
    expect(() => defaultRulesSchema(getStringMock).validateSync({})).toThrow(
      'cf.featureFlags.flagPipeline.validation.defaultRules.onOrOffVariation'
    )
  })

  test('it should pass when either off or on are specified', async () => {
    expect(() => defaultRulesSchema(getStringMock).validateSync({ spec: { on: 'abc' } })).not.toThrow()
    expect(() => defaultRulesSchema(getStringMock).validateSync({ spec: { off: 'abc' } })).not.toThrow()
  })

  test('it should pass when both off and on are specified', async () => {
    expect(() => defaultRulesSchema(getStringMock).validateSync({ spec: { on: 'abc', off: '123' } })).not.toThrow()
  })
})
