/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'

import { ccmK8sListResponse } from '@ce/pages/cloud-integration/__tests__/mocks'

import EnableCostVisibilityStep from '../steps/EnableCostVisibilityStep'

jest.mock('services/cd-ng', () => ({
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => ({ status: 'SUCCESS' })
  })),
  useDeleteConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  }))
}))

const ccmK8sConnector = ccmK8sListResponse.data.content[1].ccmk8sConnector[0].connector as unknown as ConnectorInfoDTO

const props = {
  isEditMode: true,
  name: 'Enable Reporting',
  connector: ccmK8sConnector,
  closeModal: jest.fn()
}

describe('Should be able to Disable Reporting', async () => {
  test('Install Components', async () => {
    const { container } = render(
      <TestWrapper>
        <EnableCostVisibilityStep {...props} />
      </TestWrapper>
    )

    fireEvent.click(getByText(container, 'ce.cloudIntegration.disableReporting'))

    const confirmationDialog = findDialogContainer() as HTMLElement
    fireEvent.click(getByText(confirmationDialog, 'common.disable'))

    await waitFor(() => expect(props.closeModal).toHaveBeenCalled())
  })
})
