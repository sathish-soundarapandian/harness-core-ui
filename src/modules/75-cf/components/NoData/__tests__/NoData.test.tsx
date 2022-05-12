/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { NoData, NoDataProps } from '../NoData'

const imageURL = 'test-image-url'
const message = 'test-message'
const description = 'test-description'
const buttonText = 'test-button'
const buttonWidth = 50

const renderComponent = (props: Partial<NoDataProps & { children: ReactNode }> = {}): RenderResult =>
  render(
    <TestWrapper>
      <NoData imageURL={imageURL} message={message} {...props} />
    </TestWrapper>
  )

describe('NoData', () => {
  test('it should display the message and image', async () => {
    renderComponent()

    //assert items on page
    expect(screen.getByTestId('nodata-image')).toBeInTheDocument()
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  test('it should display the description when passed', async () => {
    renderComponent({ description })
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  test('it should display the button text when passed', async () => {
    renderComponent({ buttonText })
    expect(screen.getByText(buttonText)).toBeInTheDocument()
  })

  test('it should set the button width when passed', async () => {
    renderComponent({ buttonText, buttonWidth })
    const btn = screen.getByRole('button', { name: buttonText })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('style', 'width: ' + buttonWidth.toString() + 'px;')
  })

  test('on click of the button in the component, event should be called', async () => {
    const onClickMock = jest.fn()
    renderComponent({ buttonText, onClick: onClickMock })

    const btn = screen.getByRole('button', { name: buttonText })
    expect(btn).toBeInTheDocument()
    expect(onClickMock).not.toHaveBeenCalled()

    userEvent.click(btn)

    await waitFor(() => expect(onClickMock).toHaveBeenCalled())
  })

  test('it should display children within the parent', async () => {
    const childTestId = 'child-test-id'
    renderComponent({ children: <span data-testid={childTestId}>Child test element</span> })

    expect(screen.getByTestId(childTestId)).toBeInTheDocument()
  })
})
