import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { render, screen } from '@testing-library/react'
import NavModule from '../NavModule'
import { ModuleName } from 'framework/types/ModuleName'

describe('nav module test', () => {
  test('render', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
  })

  test('test with checkbox', () => {
    const { container, queryByText, cl } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} checkboxProps={{ checked: true }} />
      </TestWrapper>
    )

    screen.debug(container)
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
  })
})
