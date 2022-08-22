/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CESideNav, { ProjectLevelFeedback } from '../CESideNav'

jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(() => true)
}))

const testpath = 'account/:accountId/ce/home'
const testpathAS = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/'
const testpathAP = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/access-points/'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

describe('side nav tests', () => {
  test('side nav renders without error when no project is selected', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <CESideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('side nav renders without error when on AutoStopping Rules tab', () => {
    const { container } = render(
      <TestWrapper path={testpathAS} pathParams={testparams}>
        <CESideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('side nav renders without error when on Access Point tab', () => {
    const { container } = render(
      <TestWrapper path={testpathAP} pathParams={testparams}>
        <CESideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('feedback tooltip appears on hover of project', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper path={testpathAP} pathParams={testparams}>
        <CESideNav />
      </TestWrapper>
    )

    act(() => {
      fireEvent.mouseEnter(getByText('Project'))
    })
    let supportTxtNode
    await waitFor(() => {
      supportTxtNode = getByTestId('supportText')
    })
    expect(supportTxtNode).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should fill feedback form', async () => {
    const { container, getByTestId, getByText } = render(<ProjectLevelFeedback shouldShowFeedbackCta={true} />)

    act(() => {
      fireEvent.click(getByTestId('fillFeedbackCta'))
    })

    const option = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(option).toBeDefined()
    act(() => {
      fireEvent.click(option)
    })

    const moreInfo = container.querySelector('textarea')
    expect(moreInfo).toBeDefined()
    act(() => {
      fireEvent.change(moreInfo!, { target: { value: 'some random info' } })
    })

    const cancelBtn = getByText('Cancel')
    act(() => {
      fireEvent.click(cancelBtn)
    })
    const formCta = getByTestId('fillFeedbackCta')
    await waitFor(() => formCta)
    expect(formCta).toBeDefined()
  })
})
