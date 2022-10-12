/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import NavModule from '../NavModule'

describe('nav module test', () => {
  test('render', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} checkboxProps={{ checked: true }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
  })

  test('test with checkbox', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} checkboxProps={{ checked: true }} />
      </TestWrapper>
    )

    screen.debug(container)
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
  })

  test('on click', () => {
    const onClick = jest.fn()
    const { container } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} checkboxProps={{ checked: true }} onClick={onClick} />
      </TestWrapper>
    )

    const parent = container.querySelector("[class*='container']")
    fireEvent.click(parent!)
    expect(onClick).toBeCalled()
  })

  test('on click when module is active', () => {
    const onClick = jest.fn()
    const { container } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} active checkboxProps={{ checked: true }} onClick={onClick} />
      </TestWrapper>
    )

    const parent = container.querySelector("[class*='container']")
    fireEvent.click(parent!)
    expect(onClick).not.toBeCalled()
  })

  test('click on checkbox', () => {
    const onCheckboxClick = jest.fn()
    const { container } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} active checkboxProps={{ checked: true, handleChange: onCheckboxClick }} />
      </TestWrapper>
    )

    const checkbox = container.querySelector('input[type="checkbox"]')
    fireEvent.click(checkbox!)
    expect(onCheckboxClick).toBeCalled()
  })
})
