/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import ResourceCardList from '../ResourceCardList'
import { smtpConfig } from './mocks/mockData'

jest.spyOn(cdngServices, 'useGetSmtpConfig').mockImplementation(() => ({ mutate: () => smtpConfig } as any))
jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
  NG_VARIABLES: true
})

describe('Resource card list test', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCardList />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('test smtp card on click', async () => {
    const renderObj = render(
      <TestWrapper>
        <ResourceCardList />
      </TestWrapper>
    )
    const smptpCard = renderObj.queryByText('common.smtp.conifg')
    if (!smptpCard) {
      throw Error('no smtp card')
    }
    fireEvent.click(smptpCard)
    expect(findDialogContainer()).toBeTruthy()
  })
})
