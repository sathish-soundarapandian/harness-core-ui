/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { fetchConnectors, mockErrorHandler, propStepOne, propWizard } from './AppServiceConfigTestUtils'
import { AzureWebAppServiceConfigWizard } from '../AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceConfigWizard'
import AzureWebAppServiceConfigWizardStepOne from '../AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceStepOne'

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: () => {
    return {
      data: connectorsData,
      refetch: jest.fn()
    }
  }
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: mockErrorHandler
  })
}))

describe('AzureWebAppServiceConfigWizard & stepOne', () => {
  test('initial render with stepOne', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <AzureWebAppServiceConfigWizard {...propWizard} />
      </TestWrapper>
    )
    const changeText = await getByText('Change')
    fireEvent.click(changeText)

    await waitFor(() => expect(container).toMatchSnapshot())

    //connector change
    const gitConnector = await findByText(container, 'Git')
    expect(gitConnector).toBeDefined()
    fireEvent.click(gitConnector)

    const newConnectorLabel = await getByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeDefined()
    const newConnectorBtn = container.querySelector('#new-application-connector') as HTMLButtonElement
    expect(newConnectorBtn).toBeDefined()
    fireEvent.click(newConnectorLabel)

    fireEvent.change(container.querySelector('input[placeholder="common.repositoryName"]')!, {
      target: { value: 'RepoName' }
    })
    const submit = await findByText(container, 'submit')
    expect(submit).toBeDefined()

    fireEvent.click(submit)
    await waitFor(() => expect(getByText('pipeline.appServiceConfig.applicationSettings.scriptFile')).toBeUndefined)
  })

  test('runtime stepOne', async () => {
    const initialValue = {
      store: {
        type: 'Git',
        spec: {
          connectorRef: '<+input>',
          gitFetchType: 'Branch',
          paths: ['file'],
          repoName: 'repo',
          branch: 'branch'
        }
      },
      selectedStore: 'Git',
      connectorRef: '<+input>'
    }
    const { container, getByText } = render(
      <TestWrapper>
        <AzureWebAppServiceConfigWizard {...propWizard} initialValues={initialValue} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const continueBtn = await findByText(container, 'continue')

    expect(continueBtn).toBeDefined()

    fireEvent.click(continueBtn)
    expect(getByText('pipeline.applicationSettings.fileDetails')).toBeDefined()

    const backBtn = await findByText(container, 'back')
    expect(backBtn).toBeDefined()
    fireEvent.click(backBtn)
  })

  test('without laststep', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AzureWebAppServiceConfigWizard {...propWizard} lastSteps={null} />
      </TestWrapper>
    )
    expect(getByText('pipeline.appServiceConfig.applicationSettings.scriptFile')).toBeTruthy()
  })

  test('stepOne with prevStepData', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AzureWebAppServiceConfigWizardStepOne {...propStepOne} />
      </TestWrapper>
    )
    expect(getByText('Bitbucket')).toBeDefined()
  })
})
