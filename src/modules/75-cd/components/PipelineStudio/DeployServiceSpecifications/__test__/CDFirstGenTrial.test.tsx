/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CDFirstGenTrial } from '../CDFirstGenTrial'

describe('CDFirstGenTrial Test cases', () => {
  test('it should render the dialog with no deployment type', () => {
    const { getByText, container } = render(
      <TestWrapper>
        <CDFirstGenTrial accountId="TEST_ACCOUNT_ID" />
      </TestWrapper>
    )
    expect(getByText('cd.cdSwitchToFirstGen.description1')).toBeDefined()
    expect(getByText('cd.cdSwitchToFirstGen.description2')).toBeDefined()
    expect(getByText('cd.cdSwitchToFirstGen.description3')).toBeDefined()
    expect(getByText('cd.cdLaunchText')).toBeDefined()
    expect(getByText('cd.cdSwitchToFirstGen.learnMoreAboutCD1stGen')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  test('it should render the dialog with valid deployment type', () => {
    const { getByText, container } = render(
      <TestWrapper>
        <CDFirstGenTrial
          accountId="TEST_ACCOUNT_ID"
          selectedDeploymentType={{
            label: 'pipeline.serviceDeploymentTypes.awsLambda',
            icon: 'app-aws-lambda',
            value: 'awsLambda'
          }}
        />
      </TestWrapper>
    )
    expect(
      getByText('pipeline.serviceDeploymentTypes.awsLambda is available on Harness CD First Generation')
    ).toBeDefined()
    expect(container).toMatchSnapshot()
    const launchTextBtn = getByText('cd.cdLaunchText')
    fireEvent.click(launchTextBtn)
    expect(container).toMatchSnapshot('loading')
  })
})
