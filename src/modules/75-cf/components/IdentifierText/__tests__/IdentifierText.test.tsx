/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Utils } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { IdentifierText, IdentifierTextProps } from '../IdentifierText'

const renderComponent = (props: Partial<IdentifierTextProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <IdentifierText identifier="TEST_ID" {...props} />
    </TestWrapper>
  )

describe('IdentifierText', () => {
  const copyMock = jest.spyOn(Utils, 'copy').mockResolvedValue(undefined)

  test('it should display the passed identifier', async () => {
    const identifier = 'TEST IDENTIFIER'
    renderComponent({ identifier })

    expect(screen.getByText(identifier)).toBeInTheDocument()
  })

  test('it should display the id label by default', async () => {
    renderComponent()

    expect(screen.getByText('idLabel')).toBeInTheDocument()
  })

  test('it should hide the id label when hideLabel is passed', async () => {
    renderComponent({ hideLabel: true })

    expect(screen.queryByText('idLabel')).not.toBeInTheDocument()
  })

  test('it should not show the copy button by default', async () => {
    renderComponent()

    expect(screen.queryByRole('button', { name: 'clickToCopy' })).not.toBeInTheDocument()
  })

  test('it should show the copy button when allowCopy is passed', async () => {
    renderComponent({ allowCopy: true })

    expect(screen.getByRole('button', { name: 'clickToCopy' })).toBeInTheDocument()
  })

  test('it should copy the identifier text when the copy button is clicked', async () => {
    const identifier = 'TEST IDENTIFIER'
    renderComponent({ allowCopy: true, identifier })

    expect(screen.queryByText('copiedToClipboard')).not.toBeInTheDocument()
    expect(copyMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'clickToCopy' }))

    expect(await screen.findByText('copiedToClipboard')).toBeInTheDocument()
    expect(copyMock).toHaveBeenCalledWith(identifier)
  })
})
