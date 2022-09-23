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
import StartupScriptWizardStepTwo from '../StartupScriptWizardStepTwo'
import {
  fetchConnectors,
  mockErrorHandler,
  onBack,
  onSubmit,
  prevStepData,
  prevStepDataRuntime,
  propStepTwo
} from './StartupScriptTestUtils'

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

describe('StartupScriptWizardStepTwo', () => {
  test('move to stepTwo', async () => {
    const initialValues = {
      store: {
        type: 'Bitbucket',
        spec: {
          connectorRef: 'account.BBsaasAmit',
          gitFetchType: 'Commit',
          paths: 'filePath',
          commitId: 'commitId'
        }
      }
    } as any
    const { container } = render(
      <TestWrapper>
        <StartupScriptWizardStepTwo
          {...propStepTwo}
          prevStepData={prevStepData}
          initialValues={initialValues}
          handleSubmit={onSubmit}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const submit = await findByText(container, 'submit')

    expect(submit).toBeDefined()

    fireEvent.click(submit)
    await waitFor(() => expect(onSubmit).toBeCalled())
  })

  test('runtime inputs', async () => {
    const initialValues = {
      store: {
        type: 'Bitbucket',
        spec: {
          connectorRef: '<+input>',
          gitFetchType: 'Commit',
          paths: ['<+input>'],
          repoName: '<+input>',
          commitId: '<+input>'
        }
      }
    } as any

    const { container } = render(
      <TestWrapper>
        <StartupScriptWizardStepTwo
          {...propStepTwo}
          prevStepData={prevStepDataRuntime}
          initialValues={initialValues}
          handleSubmit={onSubmit}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const submit = await findByText(container, 'submit')

    expect(submit).toBeDefined()

    fireEvent.click(submit)
    await waitFor(() => expect(onSubmit).toBeCalled())
  })

  test('git fetch type branch as runtime', async () => {
    const initialValues = {
      store: {
        type: 'Bitbucket',
        spec: {
          connectorRef: '<+input>',
          gitFetchType: 'Branch',
          paths: ['<+input>'],
          repoName: '<+input>',
          branch: '<+input>'
        }
      }
    } as any

    const { container } = render(
      <TestWrapper>
        <StartupScriptWizardStepTwo
          {...propStepTwo}
          prevStepData={prevStepDataRuntime}
          initialValues={initialValues}
          handleSubmit={onSubmit}
        />
      </TestWrapper>
    )
    const submit = await findByText(container, 'submit')
    expect(submit).toBeDefined()

    fireEvent.click(submit)
    await waitFor(() => expect(onSubmit).toBeCalled())
  })

  test('load empty and go back', async () => {
    const { container } = render(
      <TestWrapper>
        <StartupScriptWizardStepTwo {...propStepTwo} initialValues={{} as any} previousStep={onBack} />
      </TestWrapper>
    )
    const back = await findByText(container, 'back')
    expect(back).toBeDefined()

    fireEvent.click(back)
    await waitFor(() => expect(onBack).toBeCalled())
  })
})
