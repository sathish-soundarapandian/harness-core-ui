/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { useParams } from 'react-router-dom'
import { waitFor } from '@testing-library/react'
import { renderHook, act as actReactHooks } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as commonHooks from '@common/hooks/useLocalStorage'
import { getKey, PreferenceScope, usePreferenceStore } from '../PreferenceStoreContext'
const ENTITY_TO_SAVE = 'MySavedValue'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn()
}))

const defaultUuid = '1234'

describe('PreferenceStoreContext tests', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { accountId: 'accountId', projectIdentifier: 'projectIdentifier', orgIdentifier: 'orgIdentifier' }
    })
  })

  test('if renderhook works for usePreferenceStore', async () => {
    const mockedSetVal = jest.fn()
    // jest.spyOn(commonHooks, 'useLocalStorage').mockReturnValue([val, mockedSetVal])
    jest
      .spyOn(commonHooks, 'useLocalStorage')
      .mockImplementationOnce(() => {
        return ['ONE', mockedSetVal]
      })
      .mockImplementationOnce(() => {
        return ['TWO', mockedSetVal]
      })
      .mockImplementationOnce(() => {
        return [null, mockedSetVal]
      })

    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper path={routes.toProjects({ accountId: defaultUuid })} pathParams={{ accountId: defaultUuid }}>
        {children}
      </TestWrapper>
    )
    const { result } = renderHook(() => usePreferenceStore<number>(PreferenceScope.MACHINE, ENTITY_TO_SAVE), {
      wrapper
    })

    const { preference, setPreference, clearPreference, updatePreferenceStore } = result.current
    actReactHooks(() => {
      updatePreferenceStore({ currentUserInfo: { email: 'abc@gmail.com' } })
    })
    await waitFor(() => expect(preference).toBe(undefined))
    actReactHooks(() => {
      setPreference(55)
    })
    await waitFor(() => expect(mockedSetVal).toHaveBeenCalledTimes(1))
    // rerender()
    // jest.spyOn(commonHooks, 'useLocalStorage').mockReturnValue([55, mockedSetVal])
    // await waitFor(() => expect(preference).toBe('TWO'))
    actReactHooks(() => {
      clearPreference()
    })
    await waitFor(() => expect(mockedSetVal).toHaveBeenCalledTimes(2))
    // await waitFor(() => expect(savedVal).toBe('TWO'))
  })

  test('if getKey works correctly', () => {
    let key = getKey(['abc@gmail.com'], 'MY_SAVED_ENTITY')
    expect(key).toBe('abc@gmail.com/MY_SAVED_ENTITY')

    key = getKey(['abcXYZ', 'theOrgId'], 'MY_SAVED_ENTITY')
    expect(key).toBe('abcXYZ/theOrgId/MY_SAVED_ENTITY')

    key = getKey(['abcXYZ', undefined], 'MY_SAVED_ENTITY')
    expect(key).toBe('abcXYZ//MY_SAVED_ENTITY')
  })
})
