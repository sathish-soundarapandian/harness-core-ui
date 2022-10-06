/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'

import { ccmK8sListResponse } from '@ce/pages/cloud-integration/__tests__/mocks'

import InstallComponents from '../steps/InstallComponents'
import CreateSecret from '../steps/CreateSecret'

jest.mock('services/cd-ng', () => ({
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  }))
}))

const ccmK8sConnector = ccmK8sListResponse.data.content[2].ccmk8sConnector[0].connector as unknown as ConnectorInfoDTO

const props = {
  isEditMode: true,
  name: 'Install Components',
  prevStepData: ccmK8sConnector,
  closeModal: jest.fn()
}

describe('Should be able to Disable AutoStopping', async () => {
  test('Install Components', async () => {
    const { getByText } = render(
      <TestWrapper>
        <InstallComponents {...props} />
      </TestWrapper>
    )

    fireEvent.click(getByText('ce.cloudIntegration.disableAutoStopping'))
    await waitFor(() => expect(props.closeModal).toHaveBeenCalled())
  })

  test('Create Secret', async () => {
    const { getByText } = render(
      <TestWrapper>
        <CreateSecret {...props} connector={ccmK8sConnector} />
      </TestWrapper>
    )

    fireEvent.click(getByText('ce.cloudIntegration.disableAutoStopping'))
    await waitFor(() => expect(props.closeModal).toHaveBeenCalled())
  })
})
