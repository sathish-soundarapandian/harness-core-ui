/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { SupportPlatforms } from '@cf/components/LanguageSelection/LanguageSelection'
import { SetUpYourCodeView, SetUpYourCodeViewProps } from '../views/SetUpYourCodeView'

const renderComponent = (props?: Partial<SetUpYourCodeViewProps>): RenderResult => {
  const xamarinLang = SupportPlatforms.find(lang => lang.name === 'Xamarin') as any
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SetUpYourCodeView
        language={xamarinLang as any}
        apiKey={{
          name: 'xxx-xxx-xxx',
          apiKey: 'xxx-xxx-xxx',
          identifier: 'xxx-xxx-xxx',
          type: 'server'
        }}
        flagName="foobar"
        {...props}
      />
    </TestWrapper>
  )
}

describe('SetUpYourCodeView', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('It should render correctly given the selected language XAMARIN', () => {
    renderComponent()

    expect(screen.getByText('cf.onboarding.setUpYourCode')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.android' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.android' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.ios' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.ios' })).not.toBeChecked()
  })

  test('It should set the selected xamarin option on click of radio', () => {
    renderComponent()

    expect(screen.getByText('cf.onboarding.setUpYourCode')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.android' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.android' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.ios' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'cf.onboarding.ios' })).not.toBeChecked()

    // xamarin android readme
    expect(screen.getByText('cf.onboarding.readme.xamarinAndroid')).toBeVisible()

    userEvent.click(screen.getByRole('radio', { name: 'cf.onboarding.ios' }))

    // xamarin ios readme
    expect(screen.getByText('cf.onboarding.readme.xamarinIOS')).toBeVisible()

    userEvent.click(screen.getByRole('radio', { name: 'cf.onboarding.android' }))

    // back to xamarin android readme
    expect(screen.getByText('cf.onboarding.readme.xamarinAndroid')).toBeVisible()
  })

  test('It should render correctly given the selected language (JAVA) is NOT Xamarin', () => {
    const javaLang = SupportPlatforms.find(lang => lang.name === 'Java') as any
    renderComponent({ language: javaLang })

    expect(screen.getByText('cf.onboarding.setUpYourCode')).toBeVisible()
    expect(screen.getByText('cf.onboarding.readme.java')).toBeVisible()
    expect(screen.queryByRole('radio', { name: 'cf.onboarding.android' })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'cf.onboarding.ios' })).not.toBeInTheDocument()
  })
})
