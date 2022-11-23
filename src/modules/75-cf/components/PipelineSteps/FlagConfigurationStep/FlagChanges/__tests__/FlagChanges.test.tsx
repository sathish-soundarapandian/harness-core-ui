/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { Feature } from 'services/cf'
import FlagChanges, { FlagChangesProps } from '../FlagChanges'
import { mockVariations } from '../subSections/__tests__/utils.mocks'

const mockFeature = {
  name: 'f1',
  identifier: 'f1',
  variations: mockVariations
} as Feature

jest.mock('../FlagChangesForm', () => ({
  __esModule: true,
  default: () => <span data-testid="flag-changes-form" />
}))

const renderComponent = (props: Partial<FlagChangesProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <FlagChanges
        fieldValues={{} as FlagChangesProps['fieldValues']}
        clearField={jest.fn()}
        setField={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('FlagChanges', () => {
  test('it should display the Flag Changes heading', async () => {
    renderComponent()

    expect(screen.getByRole('heading', { name: 'cf.pipeline.flagConfiguration.flagChanges' })).toBeInTheDocument()
  })

  test('it should display the runtime/fixed selector button when showRuntimeFixedSelector is set', async () => {
    renderComponent({ showRuntimeFixedSelector: true })
    expect(screen.getByTestId('runtime-fixed-selector-button')).toBeInTheDocument()
  })

  test('it should not display the runtime/fixed selector button when showRuntimeFixedSelector is false', async () => {
    renderComponent({ showRuntimeFixedSelector: false })
    expect(screen.queryByTestId('runtime-fixed-selector-button')).not.toBeInTheDocument()
  })

  test('it should disable the runtime/fixed selector button when showRuntimeFixedSelector is set and the selectedFeature is runtime', async () => {
    renderComponent({ selectedFeature: RUNTIME_INPUT_VALUE, showRuntimeFixedSelector: true })
    expect(screen.getByTestId('runtime-fixed-selector-button')).toBeDisabled()
  })

  test('it should call the setField function with <+input> when runtime is selected in the runtime/fixed selector', async () => {
    const setFieldMock = jest.fn()
    renderComponent({ showRuntimeFixedSelector: true, setField: setFieldMock })

    userEvent.click(screen.getByTestId('runtime-fixed-selector-button'))
    await waitFor(() => expect(screen.getByText('Runtime input')).toBeInTheDocument())

    userEvent.click(screen.getByText('Runtime input'))
    await waitFor(() =>
      expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining('spec.instructions'), RUNTIME_INPUT_VALUE)
    )
  })

  test('it should call the setField function with <+input> when runtime is selected in the runtime/fixed selector', async () => {
    const setFieldMock = jest.fn()
    renderComponent({
      showRuntimeFixedSelector: true,
      setField: setFieldMock,
      fieldValues: { spec: { instructions: RUNTIME_INPUT_VALUE } } as FlagChangesProps['fieldValues']
    })

    userEvent.click(screen.getByTestId('runtime-fixed-selector-button'))
    await waitFor(() => expect(screen.getByText('Fixed value')).toBeInTheDocument())

    userEvent.click(screen.getByText('Fixed value'))
    await waitFor(() =>
      expect(setFieldMock).toHaveBeenCalledWith(expect.stringContaining('spec.instructions'), undefined)
    )
  })

  test('it should show the flag changes runtime message when showRuntimeFixedSelector is set and spec.instructions is runtime', async () => {
    renderComponent({
      showRuntimeFixedSelector: true,
      fieldValues: { spec: { instructions: RUNTIME_INPUT_VALUE } } as FlagChangesProps['fieldValues']
    })
    expect(screen.getByTestId('flag-changes-runtime')).toBeInTheDocument()
  })

  test('it should show the no flag selected message when the selectedFeature is empty', async () => {
    renderComponent({ selectedEnvironmentId: 'e1' })
    expect(screen.getByTestId('flag-changes-no-flag-selected'))
  })

  test('it should show the no flag selected message when the selectedEnvironment is empty', async () => {
    renderComponent({ selectedFeature: mockFeature })
    expect(screen.getByTestId('flag-changes-no-flag-selected'))
  })

  test('it should show the flag changes form when not set to runtime and selectedFeature and selectedEnvironment are passed', async () => {
    renderComponent({ selectedFeature: mockFeature, selectedEnvironmentId: 'e1' })
    expect(screen.getByTestId('flag-changes-form')).toBeInTheDocument()
  })
})
