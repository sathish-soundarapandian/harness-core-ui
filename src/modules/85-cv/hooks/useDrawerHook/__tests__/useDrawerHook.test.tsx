/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Text } from '@harness/uicore'
import type { IDrawerProps } from '@blueprintjs/core'
import { fireEvent, render, act, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useDrawer } from '../useDrawerHook'
import type { UseDrawerPropsInterface } from '../useDrawerHook.types'

const createHeader = () => <Text>{'Drawer Header'}</Text>
const createDrawerContent = () => <Text>{'Drawer Content'}</Text>
const drawerOptions = {} as IDrawerProps

const TestComponent = (props: UseDrawerPropsInterface) => {
  const { hideDrawer, showDrawer } = useDrawer({ ...props })
  return (
    <>
      <Button onClick={hideDrawer}>hideDrawer</Button>
      <Button onClick={showDrawer}>showDrawer</Button>
    </>
  )
}

describe('Test useDrawer hook', () => {
  test('useDrawer', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>
        <>{children}</>
      </TestWrapper>
    )
    const { result } = renderHook(() => useDrawer({ createHeader, createDrawerContent, drawerOptions }), { wrapper })
    expect((result as any).current.showDrawer).toBeTruthy()
    expect((result as any).current.hideDrawer).toBeTruthy()
  })

  test('should open drawer', async () => {
    const props = { createHeader, createDrawerContent, drawerOptions }
    const { container, getByText } = render(
      <TestWrapper>
        <TestComponent {...props} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('showDrawer'))
    })

    await waitFor(() => expect(getByText('Drawer Header')).toBeTruthy())
    await waitFor(() => expect(getByText('Drawer Content')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('cross'))
    })

    await waitFor(() => expect(container.querySelector('.health-source-right-drawer')).not.toBeTruthy())
    await waitFor(() => expect(container.querySelector('.bp3-drawer-header')).not.toBeTruthy())
    await waitFor(() => expect(container.querySelector('span[icon="cross"]')).not.toBeTruthy())

    act(() => {
      fireEvent.click(getByText('showDrawer'))
    })

    // Drawer is visible
    await waitFor(() => expect(getByText('Drawer Header')).toBeTruthy())
    await waitFor(() => expect(getByText('Drawer Content')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('hideDrawer'))
    })

    // Drawer is not visible
    await waitFor(() => expect(container.querySelector('.health-source-right-drawer')).not.toBeTruthy())
    await waitFor(() => expect(container.querySelector('.bp3-drawer-header')).not.toBeTruthy())
    await waitFor(() => expect(container.querySelector('span[icon="cross"]')).not.toBeTruthy())

    expect(container).toMatchSnapshot()
  })
})
