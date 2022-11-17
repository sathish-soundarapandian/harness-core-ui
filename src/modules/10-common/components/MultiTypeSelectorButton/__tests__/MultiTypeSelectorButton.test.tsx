/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import MultiTypeSelectorButton, { MultiTypeSelectorButtonProps } from '../MultiTypeSelectorButton'

const renderComponent = (props: Partial<MultiTypeSelectorButtonProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <MultiTypeSelectorButton
        type={MultiTypeInputType.FIXED}
        onChange={jest.fn()}
        allowedTypes={[MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
        {...props}
      />
    </TestWrapper>
  )

describe('MultiTypeSelectorButton', () => {
  test.each([MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION])(
    'it should display the %s icon in the button when set as type',
    async type => {
      renderComponent({ type })

      expect(screen.getByRole('button').querySelector('svg')).toMatchSnapshot()
    }
  )

  test('it should display the multi type selector menu when the button is clicked', async () => {
    renderComponent()

    expect(screen.queryByText('Fixed value')).not.toBeInTheDocument()
    expect(screen.queryByText('Runtime input')).not.toBeInTheDocument()
    expect(screen.queryByText('Expression')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Fixed value')).toBeInTheDocument()
      expect(screen.getByText('Runtime input')).toBeInTheDocument()
      expect(screen.getByText('Expression')).toBeInTheDocument()
    })
  })

  test('it should only display specified types', async () => {
    const allowedTypes: MultiTypeSelectorButtonProps['allowedTypes'] = [
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.FIXED
    ]

    renderComponent({ allowedTypes })

    expect(screen.queryByText('Fixed value')).not.toBeInTheDocument()
    expect(screen.queryByText('Runtime input')).not.toBeInTheDocument()
    expect(screen.queryByText('Expression')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Fixed value')).toBeInTheDocument()
      expect(screen.getByText('Runtime input')).toBeInTheDocument()
      expect(screen.queryByText('Expression')).not.toBeInTheDocument()
    })
  })

  test('it should call the onChange callback when an option is selected', async () => {
    const onChangeMock = jest.fn()
    renderComponent({ onChange: onChangeMock })

    expect(onChangeMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('Runtime input')).toBeInTheDocument())
    userEvent.click(screen.getByText('Runtime input'))

    await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(MultiTypeInputType.RUNTIME))
  })
})
