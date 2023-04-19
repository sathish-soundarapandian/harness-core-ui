/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cfServices from 'services/cf'
import * as cdServices from 'services/cd-ng'
import * as preferenceStoreContext from 'framework/PreferenceStore/PreferenceStoreContext'
import { CurrentLocation, TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { useEnvironmentSelectV2, UseEnvironmentSelectV2Params } from '../useEnvironmentSelectV2'

const renderComponent = (
  envProps?: Partial<UseEnvironmentSelectV2Params>,
  wrapperProps?: Partial<TestWrapperProps>
): RenderResult => {
  const Component: React.FC = () => {
    const { EnvironmentSelect } = useEnvironmentSelectV2({
      selectedEnvironmentIdentifier: 'abc',
      onChange: jest.fn(),
      ...envProps
    })

    return <EnvironmentSelect />
  }
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      {...wrapperProps}
    >
      <Component />
      <CurrentLocation />
    </TestWrapper>
  )
}

describe('Test useEnvironmentSelectV2', () => {
  const preferenceURL = { pathname: '/testURL' }
  const setPreference = jest.fn()
  const refetchAllEnvironmentsFlags = jest.fn()

  beforeEach(() => {
    jest.spyOn(preferenceStoreContext, 'usePreferenceStore').mockReturnValue({
      setPreference: setPreference,
      preference: JSON.stringify(preferenceURL),
      clearPreference: jest.fn()
    })

    jest.spyOn(cfServices, 'useGetProjectFlags').mockReturnValue({
      loading: false,
      error: null,
      absolutePath: '',
      refetch: refetchAllEnvironmentsFlags,
      cancel: jest.fn(),
      response: null,
      data: null
    })

    jest.spyOn(cdServices, 'useGetEnvironmentListForProject').mockReturnValue({
      data: {
        data: {
          content: [
            {
              identifier: 'abc',
              name: 'abc'
            },
            {
              identifier: 'xyz',
              name: 'xyz'
            }
          ]
        }
      },
      loading: false,
      refetch: jest.fn()
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('It should send back the proper component with no "All Environments" option', async () => {
    renderComponent()

    const envInput = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(envInput).toHaveValue('abc')

    userEvent.click(envInput)

    const options = screen.getAllByRole('listitem')

    expect(options[0]).toHaveTextContent('abc')
    expect(options[1]).toHaveTextContent('xyz')
    expect(screen.queryByText('common.allEnvironments')).not.toBeInTheDocument()
  })

  test('It should call SETPREFERENCE', async () => {
    renderComponent()

    const envInput = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(envInput).toHaveValue('abc')
    expect(screen.getByTestId('location')).toHaveTextContent('activeEnvironment=abc')

    userEvent.click(envInput)

    const options = screen.getAllByRole('listitem')

    expect(options[0]).toHaveTextContent('abc')
    expect(options[1]).toHaveTextContent('xyz')

    userEvent.click(options[1])

    expect(setPreference).toHaveBeenCalledWith('xyz')
    expect(refetchAllEnvironmentsFlags).not.toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent('activeEnvironment=xyz')
  })

  test('It should send back the proper component including "All Environments" option', async () => {
    renderComponent({ allowAllOption: true }, { defaultFeatureFlagValues: { FFM_6683_ALL_ENVIRONMENTS_FLAGS: true } })

    userEvent.click(screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' }))

    expect(screen.getByText('common.allEnvironments')).toBeInTheDocument()
    expect(screen.getByText('abc')).toBeInTheDocument()
    expect(screen.getByText('xyz')).toBeInTheDocument()
  })

  test('It should fetch the flags data on click of the "All Environments" option', async () => {
    renderComponent({ allowAllOption: true }, { defaultFeatureFlagValues: { FFM_6683_ALL_ENVIRONMENTS_FLAGS: true } })

    const envInput = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(refetchAllEnvironmentsFlags).not.toHaveBeenCalled()
    expect(setPreference).toHaveBeenCalledWith('abc')
    expect(envInput).toHaveValue('abc')
    expect(screen.getByTestId('location')).toHaveTextContent('activeEnvironment=abc')

    userEvent.click(envInput)

    const options = screen.getAllByRole('listitem')

    expect(options[0]).toHaveTextContent('common.allEnvironments')
    expect(options[1]).toHaveTextContent('abc')
    expect(options[2]).toHaveTextContent('xyz')
    expect(refetchAllEnvironmentsFlags).not.toHaveBeenCalled()

    userEvent.click(options[0])

    expect(refetchAllEnvironmentsFlags).toHaveBeenCalled()
    // should not set 'All Environments' as preference and keep already selected preference
    expect(setPreference).toHaveBeenLastCalledWith('abc')
    expect(screen.getByTestId('location')).toHaveTextContent('activeEnvironment=abc')
  })
})
