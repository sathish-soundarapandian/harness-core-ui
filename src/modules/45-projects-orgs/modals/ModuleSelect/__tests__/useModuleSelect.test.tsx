/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, getByText as getByTxt, waitFor } from '@testing-library/react'
import { Button } from '@harness/uicore'
import { noop } from 'lodash-es'
import mockImport from 'framework/utils/mockImport'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import * as featureFlags from '@common/hooks/useFeatureFlag'
import { useModuleSelectModal } from '../useModuleSelect'

jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
  CVNG_ENABLED: true
}))
const TestComponent: React.FC = () => {
  const { openModuleSelectModal } = useModuleSelectModal({ onCloseModal: noop, onSuccess: noop })

  return (
    <Button
      text="click here"
      onClick={() => {
        openModuleSelectModal({
          identifier: 'project1',
          modules: ['CD'],
          name: 'Project 1'
        })
      }}
    />
  )
}
describe('module select test', () => {
  test('module btn with license passed', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/resources/connectors"
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' },
            CE: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <TestComponent />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('click here'))
    })
    const dialog = findDialogContainer()
    expect(dialog).toBeTruthy()
    await waitFor(() => {
      if (dialog) {
        fireEvent.click(getByTxt(dialog, 'common.purpose.cd.continuous'))
      }
    })

    expect(dialog).toMatchSnapshot()
  })
  test('module plan btn', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CVNG_ENABLED: true
    }))
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/resources/connectors"
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' },
            CE: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <TestComponent />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('click here'))
    })
    const dialog = findDialogContainer()
    expect(dialog).toBeTruthy()
    await waitFor(() => {
      if (dialog) {
        fireEvent.click(getByTxt(dialog, 'common.purpose.cd.continuous'))
      }
    })

    expect(dialog).toMatchSnapshot()
  })

  test('go to Module  btn ', async () => {
    mockImport('framework/LicenseStore/LicenseStoreContext', {
      useLicenseStore: jest.fn().mockImplementation(() => ({
        licenseInformation: { CD: { status: 'ACTIVE' }, CHAOS: { status: 'ACTIVE' }, CE: { status: 'ACTIVE' } }
      }))
    })
    const { getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TestComponent />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('click here'))
    })
    const dialog = findDialogContainer()
    expect(dialog).toBeTruthy()
    await waitFor(() => {
      if (dialog) {
        fireEvent.click(getByTxt(dialog, 'common.purpose.cd.continuous'))
      }
    })

    expect(dialog).toMatchSnapshot()
  })
  test('test on prem getting directly continue btn ', async () => {
    mockImport('framework/LicenseStore/LicenseStoreContext', {
      useLicenseStore: jest.fn().mockImplementation(() => ({
        licenseInformation: { CD: { status: 'ACTIVE' }, CHAOS: { status: 'ACTIVE' }, CE: { status: 'ACTIVE' } }
      }))
    })
    mockImport('@common/utils/utils', {
      isOnPrem: jest.fn().mockImplementation(() => true)
    })
    const { getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TestComponent />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('click here'))
    })
    const dialog = findDialogContainer()
    expect(dialog).toBeTruthy()
    await waitFor(() => {
      if (dialog) {
        fireEvent.click(getByTxt(dialog, 'common.purpose.cd.continuous'))
      }
    })

    expect(dialog).toMatchSnapshot()
  })
})
