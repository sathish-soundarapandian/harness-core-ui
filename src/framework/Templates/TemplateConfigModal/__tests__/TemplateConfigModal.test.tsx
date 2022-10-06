/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import routes from '@common/RouteDefinitions'
import { templatePathProps } from '@common/utils/routeUtils'
import { gitConnectorMock, mockBranches, mockRepos } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { ConfigModalProps, Intent, TemplateConfigModalWithRef } from '../TemplateConfigModal'

jest.useFakeTimers()

const gitAppStoreValues = {
  featureFlags: {
    NG_TEMPLATE_GITX: true
  },
  isGitSyncEnabled: false,
  isGitSimplificationEnabled: true,
  supportingGitSimplification: true,
  gitSyncEnabledOnlyForFF: false,
  supportingTemplatesGitx: true
}
const TEST_PATH = routes.toTemplateStudio(templatePathProps)
const TEST_PATH_PARAMS = {
  templateIdentifier: '-1',
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'projectId',
  module: 'cd',
  templateType: 'Step'
}
const getProps = (): ConfigModalProps => ({
  onClose: jest.fn(),
  initialValues: {
    name: '',
    type: 'Step',
    identifier: '-1',
    versionLabel: 'v1'
  },
  promise: Promise.resolve,
  gitDetails: {
    repoIdentifier: 'test_repo',
    branch: 'test_branch'
  },
  storeMetadata: {
    connectorRef: 'connectorRefTest',
    storeType: 'REMOTE',
    repoName: 'repoNameTest',
    branch: 'branchTest',
    filePath: '.harness/filePathTest.yaml'
  },
  title: 'Some Title',
  intent: Intent.START
})

const getGitConnector = jest.fn(() => Promise.resolve(gitConnectorMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitConnectorMock)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: gitConnectorMock.data.content[0], refetch: getGitConnector, loading: false }
  }),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  })
}))

describe('CREATE MODE', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
  })
  test('VALIDATIONS', async () => {
    const props = getProps()
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <TemplateConfigModalWithRef {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: '' } })
    })
    act(() => {
      fireEvent.click(getByText('start'))
    })
    await waitFor(() => expect(queryByText('common.validation.fieldIsRequired')).toBeTruthy())
  })

  test('if form changesupdate the preview card', async () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <TemplateConfigModalWithRef {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'templatename' } })
    })
    expect(container).toMatchSnapshot('changed value should be present in the preview')
  })

  test('if form closes', async () => {
    const props = getProps()
    const { container, getByText } = render(
      <TestWrapper>
        <TemplateConfigModalWithRef {...props} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('cancel'))
    })
    await waitFor(() => expect(props.onClose).toBeCalled())

    const crossIcon = container.querySelector('span[icon="cross"]')
    act(() => {
      fireEvent.click(crossIcon!)
    })
    await waitFor(() => expect(props.onClose).toBeCalled())
  })
})

describe('Git experience', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
  })
  test('git experience snapshot', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper defaultAppStoreValues={gitAppStoreValues} path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <TemplateConfigModalWithRef {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('onInlineRemoteChange toggles between inline and remote form and inline does not contain git details', async () => {
    const props = getProps()
    const promise = jest.fn().mockImplementation(() => Promise.resolve())

    const { getByText, container } = render(
      <TestWrapper defaultAppStoreValues={gitAppStoreValues} path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <TemplateConfigModalWithRef {...props} allowScopeChange promise={promise} />
      </TestWrapper>
    )

    const name = container.querySelector('input[name="name"]') as HTMLInputElement
    fireEvent.change(name, { target: { value: 'testTemp' } })

    const scopeLabel = getByText('templatesLibrary.templateSettingsModal.scopeLabel')
    expect(scopeLabel).toBeInTheDocument()

    const scopeInputDropdown = scopeLabel.parentElement?.querySelector('[data-icon="chevron-down"]')
      ?.parentElement as HTMLInputElement

    // Change scope to project
    act(() => {
      fireEvent.click(scopeInputDropdown)
    })

    await waitFor(() => {
      expect(document.querySelector('ul.bp3-menu')).toBeTruthy()
    })

    await waitFor(() => {
      expect(getByText('projectLabel')).toBeInTheDocument()
      expect(getByText('orgLabel')).toBeInTheDocument()
      expect(getByText('account')).toBeInTheDocument()
    })

    act(() => {
      fireEvent.click(getByText('projectLabel'))
    })

    act(() => {
      fireEvent.click(getByText('common.git.inlineStoreLabel'))
    })

    // Submit
    act(() => {
      fireEvent.click(getByText('start'))
    })

    await waitFor(() => {
      expect(promise).toBeCalledWith(
        {
          identifier: 'testTemp',
          name: 'testTemp',
          orgIdentifier: 'default',
          projectIdentifier: 'projectId',
          type: 'Step',
          versionLabel: 'v1'
        },
        {
          isEdit: false,
          storeMetadata: {
            branch: undefined,
            connectorRef: undefined,
            filePath: undefined,
            repoName: undefined,
            storeType: 'INLINE'
          }
        }
      )
    })
  })

  test('onInlineRemoteChange toggles between inline and remote form and remote contains git details', async () => {
    const props = getProps()
    const promise = jest.fn().mockImplementation(() => Promise.resolve())

    const { getByText, container } = render(
      <TestWrapper defaultAppStoreValues={gitAppStoreValues} path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <TemplateConfigModalWithRef {...props} allowScopeChange promise={promise} />
      </TestWrapper>
    )

    const name = container.querySelector('input[name="name"]') as HTMLInputElement
    fireEvent.change(name, { target: { value: 'testTemp' } })

    const scopeLabel = getByText('templatesLibrary.templateSettingsModal.scopeLabel')
    expect(scopeLabel).toBeInTheDocument()

    const scopeInputDropdown = scopeLabel.parentElement?.querySelector('[data-icon="chevron-down"]')
      ?.parentElement as HTMLInputElement

    // Change scope to project
    act(() => {
      fireEvent.click(scopeInputDropdown)
    })

    await waitFor(() => {
      expect(document.querySelector('ul.bp3-menu')).toBeTruthy()
    })

    await waitFor(() => {
      expect(getByText('projectLabel')).toBeInTheDocument()
      expect(getByText('orgLabel')).toBeInTheDocument()
      expect(getByText('account')).toBeInTheDocument()
    })

    act(() => {
      fireEvent.click(getByText('projectLabel'))
    })

    act(() => {
      fireEvent.click(getByText('common.git.remoteStoreLabel'))
    })

    // Submit
    act(() => {
      fireEvent.click(getByText('start'))
    })

    await waitFor(() => {
      expect(promise).toBeCalledWith(
        {
          identifier: 'testTemp',
          name: 'testTemp',
          orgIdentifier: 'default',
          projectIdentifier: 'projectId',
          type: 'Step',
          versionLabel: 'v1'
        },
        {
          isEdit: false,
          storeMetadata: {
            branch: 'branchTest',
            connectorRef: 'connectorRefTest',
            filePath: '.harness/filePathTest.yaml',
            repoName: 'repoNameTest',
            storeType: 'REMOTE'
          },
          updatedGitDetails: {
            branch: 'branchTest',
            repoIdentifier: 'repoNameTest'
          }
        }
      )
    })
  })
})
