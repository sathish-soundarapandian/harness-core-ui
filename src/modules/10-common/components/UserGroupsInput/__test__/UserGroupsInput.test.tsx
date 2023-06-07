/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import { FormikTooltipContext } from '@wings-software/uicore'
import UserGroupsInput from '@common/components/UserGroupsInput/UserGroupsInput'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

jest.mock('services/cd-ng', () => ({
  getUserGroupAggregateListPromise: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('Rendering', () => {
  let container: HTMLElement
  let findByText: RenderResult['findByText']
  beforeEach(() => {
    const renderObj = render(
      <TestWrapper>
        <UserGroupsInput name="userGroups" label={'testing'} tooltipProps={{ dataTooltipId: 'ugInput' }} />
      </TestWrapper>
    )
    container = renderObj.container
    findByText = renderObj.findByText
  })
  test('should render', () => {
    expect(container).toMatchSnapshot()
  })
  test('should render Modal', async () => {
    const selectBtn = await findByText('common.selectUserGroups')
    expect(selectBtn).toBeTruthy()
    fireEvent.click(selectBtn)
    const acctTab = await findByText('account')
    expect(acctTab).toBeTruthy()
    expect(findDialogContainer()).toMatchSnapshot()
  })
  test('Modal should close on clicking cross', async () => {
    const selectBtn = await findByText('common.selectUserGroups')
    expect(selectBtn).toBeTruthy()
    fireEvent.click(selectBtn)
    const acctTab = await findByText('account')
    expect(acctTab).toBeTruthy()
    expect(findDialogContainer()).toMatchSnapshot()
    const modal = document.getElementsByClassName('bp3-dialog')[0]
    const closeButton = modal.querySelector("button[class*='bp3-dialog-close-button']") as Element
    fireEvent.click(closeButton)
    expect(findDialogContainer()).toBeFalsy()
  })
})

describe('Render with tooltip context hook', () => {
  test('if tooltip ID taken from form name', () => {
    const { container } = render(
      <FormikTooltipContext.Provider value={{ formName: 'ugFormName' }}>
        <TestWrapper>
          <UserGroupsInput name="userGroups" label={'testing'} />
        </TestWrapper>
      </FormikTooltipContext.Provider>
    )

    expect(container).toMatchSnapshot('tooltipId formname')
  })

  test('if formname is empty', () => {
    const { container } = render(
      <FormikTooltipContext.Provider value={{ formName: '' }}>
        <TestWrapper>
          <UserGroupsInput name="userGroups" label={'testing'} />
        </TestWrapper>
      </FormikTooltipContext.Provider>
    )

    expect(container).toMatchSnapshot('tooltipId formname empty')
  })
})
