/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { OnboardingSelectedFlag, OnboardingSelectedFlagProps } from '../OnboardingSelectedFlag'

const mockSelectedFlag = {
  identifier: 'ff_onboarding_flag',
  kind: 'boolean',
  name: 'FF Onboarding Flag',
  permanent: false,
  prerequisites: [],
  project: 'dummy',
  variations: [
    {
      identifier: 'true',
      name: 'True',
      value: 'true'
    },
    {
      identifier: 'false',
      name: 'False',
      value: 'false'
    }
  ]
} as any

const renderComponent = (props?: Partial<OnboardingSelectedFlagProps>): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <OnboardingSelectedFlag flagCreated={false} selectedFlag={mockSelectedFlag} {...props} />
    </TestWrapper>
  )
}

describe('OnboardingSelectedFlag', () => {
  test('It should display correct label when selected Flag was newly created', async () => {
    renderComponent({ flagCreated: true })

    expect(screen.getByTestId('ffOnboardingSelectedFlag')).toBeVisible()
    expect(screen.getByTestId('ffOnboardingSelectedFlag').textContent).toMatch(
      /cf\.onboarding\.youCreatedFF Onboarding Flag.+ff_onboarding_flag.+/
    )
  })
  test('It should display correct label when selected Flag was chosen from list of existing Flags', async () => {
    renderComponent()

    expect(screen.getByTestId('ffOnboardingSelectedFlag')).toBeVisible()
    expect(screen.getByTestId('ffOnboardingSelectedFlag').textContent).toMatch(
      /cf\.onboarding\.youreUsingFF Onboarding Flag.+ff_onboarding_flag.+/
    )
  })
})
