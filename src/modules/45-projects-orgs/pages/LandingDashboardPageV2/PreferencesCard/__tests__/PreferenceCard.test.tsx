/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import PreferencesCard from '../PreferencesCard'

jest.mock('framework/PreferenceStore/PreferenceStoreContext')
;(usePreferenceStore as jest.Mock).mockImplementation(() => {
  return {
    preference: [
      { projectIdentifier: 'dummyProjectIdentifier', orgIdentifier: 'dummyOrgIdentifier', name: 'dummyProjectName' }
    ] as SavedProjectDetails[],
    clearPreference: jest.fn
  }
})

describe('Preference card test', () => {
  test('check if project is rendered', () => {
    const { queryByText } = render(
      <TestWrapper>
        <PreferencesCard />
      </TestWrapper>
    )
    expect(queryByText('dummyProjectName')).not.toBeNull()
  })

  test('with no recent projects', () => {
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        preference: undefined,
        clearPreference: jest.fn
      }
    })
    const { queryByText } = render(
      <TestWrapper>
        <PreferencesCard />
      </TestWrapper>
    )
    expect(queryByText('dummyProjectName')).toBeNull()
  })
})
