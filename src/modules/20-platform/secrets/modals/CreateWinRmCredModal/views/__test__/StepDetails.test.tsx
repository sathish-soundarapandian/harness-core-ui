/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, queryByAttribute, render } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit } from '@common/utils/JestFormHelper'
import type { WinRmAuthDTO } from 'services/cd-ng'
import StepDetails from '@secrets/modals/CreateWinRmCredModal/views/StepDetails'

const prevStepData: any = {
  detailsData: {
    name: '',
    identifier: ''
  },
  authData: {
    domain: '',
    authScheme: 'NTLM' as WinRmAuthDTO['type'],
    tgtGenerationMethod: 'None',
    username: '',
    port: 22,
    principal: '',
    realm: '',
    password: {
      name: '',
      identifier: '',
      referenceString: ''
    },
    keyPath: '',
    useSSL: false,
    skipCertChecks: false,
    useNoProfile: false
  }
}

describe('Create WinRm Cred Wizard Step Details', () => {
  test('Test for  winrm step details required fields', async () => {
    const { container } = render(
      <TestWrapper>
        <StepDetails name="sample-name" />
      </TestWrapper>
    )
    // fill step 1
    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot() // Form validation for all required fields in step one
  })

  test('Test for going to next step', async () => {
    const { container } = render(
      <TestWrapper>
        <StepDetails name="sample-name" prevStepData={prevStepData} nextStep={jest.fn()} />
      </TestWrapper>
    )

    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })

    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot()
  })
})
