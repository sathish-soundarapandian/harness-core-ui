/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SCMHomePage from '../SCMHomePage'

jest.mock('@projects-orgs/pages/HomePageTemplate/HomePageTemplate', () => ({
  ...(jest.requireActual('@projects-orgs/pages/HomePageTemplate/HomePageTemplate') as any),
  HomePageTemplate: function MockComponent(props: any) {
    return (
      <div className="homepagetemplage">
        <button className="projectCreate" onClick={() => props.projectCreateSuccessHandler({})}></button>
      </div>
    )
  }
}))

describe('SCMHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <SCMHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Ensure project success handler calls history push', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <SCMHomePage />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[class~="projectCreate"]')!)
    expect(container).toMatchSnapshot()
  })
})
