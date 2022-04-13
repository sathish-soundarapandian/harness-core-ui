/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { PreferenceScope, usePreferenceStore } from '../PreferenceStoreContext'
const ENTITY_TO_SAVE = 'MySavedValue'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn().mockImplementation(() => {
    return { accountId: 'accountId', projectIdentifier: 'projectIdentifier', orgIdentifier: 'orgIdentifier' }
  })
}))

const defaultUuid = '1234'

const MyComponent: React.FC = () => {
  const {
    preference: savedVal,
    setPreference: setSavedVal,
    clearPreference
  } = usePreferenceStore<string>(PreferenceScope.MACHINE, ENTITY_TO_SAVE)

  return (
    <div>
      <button
        data-testid="btnToChangeSavedVal"
        onClick={() => {
          setSavedVal('test')
        }}
      ></button>
      <button
        data-testid="clearPreferentBtn"
        onClick={() => {
          clearPreference()
        }}
      ></button>
      <span data-testid="valFromPrefStore">{savedVal}</span>
    </div>
  )
}

describe('Preference Store context tests', () => {
  test('test if the values are being set', async () => {
    const { getByTestId } = render(
      <TestWrapper path={routes.toProjects({ accountId: defaultUuid })} pathParams={{ accountId: defaultUuid }}>
        <MyComponent />
      </TestWrapper>
    )
    const btn = getByTestId('btnToChangeSavedVal')
    await act(async () => {
      fireEvent.click(btn!)
    })
    const textElement = getByTestId('valFromPrefStore')
    expect(textElement.textContent).toBe('test')
  })

  test('clear preference', async () => {
    const { getByTestId } = render(
      <TestWrapper path={routes.toProjects({ accountId: defaultUuid })} pathParams={{ accountId: defaultUuid }}>
        <MyComponent />
      </TestWrapper>
    )
    const btnToChangeVal = getByTestId('btnToChangeSavedVal')
    await act(async () => {
      fireEvent.click(btnToChangeVal!)
    })
    const btnToClearVal = getByTestId('clearPreferentBtn')
    await act(async () => {
      fireEvent.click(btnToClearVal!)
    })
    const textElement = getByTestId('valFromPrefStore')
    expect(textElement.textContent).toBe('')
  })
})
