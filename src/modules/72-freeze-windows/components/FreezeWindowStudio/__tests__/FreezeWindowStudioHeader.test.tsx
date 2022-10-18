/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as moduleMock from '@common/hooks/useModuleInfo'
import { FreezeWindowStudioHeader } from '../FreezeWindowStudioHeader'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn()
}))

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('Freeze Window Studio Header', () => {
  test('should render Studio Header for Project View', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { projectIdentifier, orgIdentifier, accountId }
    })
    jest.spyOn(moduleMock, 'useModuleInfo').mockReturnValue({
      module: 'cd'
    })

    const { container, getByText } = render(
      <TestWrapper>
        <FreezeWindowStudioHeader />
      </TestWrapper>
    )
    expect(getByText('project1')).toBeDefined()
    expect(getByText('common.freezeWindows')).toBeDefined()
    expect(container.getElementsByTagName('a')).toMatchSnapshot('Project View - Studio Header')
  })
  test('should render Studio Header for Org View', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { orgIdentifier, accountId }
    })
    jest.spyOn(moduleMock, 'useModuleInfo').mockReturnValue({})

    const { container, getByText } = render(
      <TestWrapper>
        <FreezeWindowStudioHeader />
      </TestWrapper>
    )
    expect(getByText('common.accountSettings')).toBeDefined()
    expect(getByText('default')).toBeDefined()
    expect(getByText('common.freezeWindows')).toBeDefined()
    expect(container.getElementsByTagName('a')).toMatchSnapshot('Org View - Studio Header')
  })
  test('should render Studio Header for Account View', () => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { accountId }
    })
    jest.spyOn(moduleMock, 'useModuleInfo').mockReturnValue({})

    const { container, getByText } = render(
      <TestWrapper>
        <FreezeWindowStudioHeader />
      </TestWrapper>
    )
    expect(getByText('common.accountSettings')).toBeDefined()
    expect(getByText('common.freezeWindows')).toBeDefined()
    expect(container.getElementsByTagName('a')).toMatchSnapshot('Account View - Studio Header')
  })
})
