import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import PreferencesCard from '../PreferencesCard'

jest.mock('framework/PreferenceStore/PreferenceStoreContext')

describe('Preference card test', () => {
  test('click on favorites', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <PreferencesCard />
      </TestWrapper>
    )
    const favortiesTab = container.querySelector('[data-tab-id="favorites"]')
    fireEvent.click(favortiesTab!)

    expect(queryByText('common.comingSoon')).not.toBeNull()
  })

  test('click on favorites', () => {
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        preference: [
          { projectIdentifier: 'dummyProjectIdentifier', orgIdentifier: 'dummyOrgIdentifier', name: 'projectName' }
        ] as SavedProjectDetails[],
        clearPreference: jest.fn
      }
    })
    const { container, queryByText } = render(
      <TestWrapper>
        <PreferencesCard />
      </TestWrapper>
    )
    const favortiesTab = container.querySelector('[data-tab-id="favorites"]')
    fireEvent.click(favortiesTab!)

    expect(queryByText('common.comingSoon')).not.toBeNull()
  })
})
