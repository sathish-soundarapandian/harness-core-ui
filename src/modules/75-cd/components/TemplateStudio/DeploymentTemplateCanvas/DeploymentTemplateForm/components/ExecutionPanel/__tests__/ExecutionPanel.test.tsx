/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor, getByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { DeploymentContextProvider } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { initialValues, multipleStepsInitialView } from './mocks'
import { ExecutionPanel } from '../ExecutionPanel'

jest.mock('framework/Templates/TemplateSelectorContext/useTemplateSelector', () => ({
  useTemplateSelector: jest.fn().mockReturnValue({
    getTemplate: jest.fn().mockImplementation(() => ({ template: {}, isCopied: false }))
  })
}))

jest.mock('@pipeline/utils/templateUtils', () => ({
  ...jest.requireActual('@pipeline/utils/templateUtils'),
  getResolvedTemplateDetailsByRef: () =>
    Promise.resolve({
      templateDetailsByRef: {
        http_project_level: {
          accountId: 'kmpySmUISimoRrJL6NL73w',
          orgIdentifier: 'samarth_org',
          projectIdentifier: 'samarthproject',
          identifier: 'http_project_level',
          name: 'http project level',
          description: '',
          tags: {},
          yaml: 'template:\n  name: http project level\n  type: Step\n  projectIdentifier: samarthproject\n  orgIdentifier: samarth_org\n  spec:\n    type: Http\n    timeout: 10s\n    spec:\n      url: <+input>\n      method: GET\n      headers: []\n      outputVariables: []\n  identifier: http_project_level\n  versionLabel: "212"\n',
          versionLabel: '212',
          templateEntityType: 'Step',
          childType: 'Http',
          templateScope: 'project',
          version: 1,
          gitDetails: {
            objectId: null,
            branch: null,
            repoIdentifier: null,
            rootFolder: null,
            filePath: null,
            repoName: null,
            commitId: null,
            fileUrl: null,
            repoUrl: null
          },
          entityValidityDetails: {
            valid: true,
            invalidYaml: null
          },
          lastUpdatedAt: 1664047838696,
          createdAt: 1664047838696,
          stableTemplate: true
        }
      }
    })
}))

jest.mock('services/cd-ng-rq', () => ({
  useListGitSyncQuery: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('@templates-library/components/TemplateSettingsModal/TemplateSettingsModal', () => ({
  TemplateSettingsModal: () => {
    return <div data-testid="settings-modal" />
  }
}))

const DeploymentContextWrapper = ({
  initialValue,
  children
}: React.PropsWithChildren<{ initialValue: any }>): JSX.Element => (
  <DeploymentContextProvider
    deploymentConfigInitialValues={initialValue}
    onDeploymentConfigUpdate={jest.fn()}
    isReadOnly={false}
    gitDetails={{}}
    queryParams={{ accountIdentifier: 'accountId', orgIdentifier: '', projectIdentifier: '' }}
    stepsFactory={factory}
  >
    {children}
  </DeploymentContextProvider>
)

const children = <div></div>

describe('Test DeploymentInfraWrapperWithRef', () => {
  test('initial render - without step template refs', async () => {
    const updatedValues = {
      ...initialValues,
      execution: {
        stepTemplateRefs: ['']
      }
    }
    const { container } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={updatedValues}>
          <ExecutionPanel>{children}</ExecutionPanel>
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('initial render - with step template refs', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={initialValues}>
          <ExecutionPanel>{children}</ExecutionPanel>
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    const plusButton = await waitFor(() => container.querySelector('[icon="plus"]'))
    fireEvent.click(plusButton!)

    const createAndUseTemplateBtn = await screen.getByText('cd.createAndUseTemplate')
    expect(createAndUseTemplateBtn).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(createAndUseTemplateBtn)
    })

    await act(async () => {
      fireEvent.click(plusButton!)
    })

    const useTemplateBtn = await screen.getByText('templatesLibrary.useTemplateLabel')
    expect(useTemplateBtn).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(useTemplateBtn)
    })
    expect(container).toMatchSnapshot()
    const stepCardViewButton = await waitFor(() =>
      container.querySelector('[data-testid="step-card-http_project_level"]')
    )
    fireEvent.click(stepCardViewButton!)

    const crossButton = await waitFor(() => container.querySelector('[icon="cross"]'))
    fireEvent.click(crossButton!)
    const dialogContainer = findDialogContainer() as HTMLElement
    await waitFor(() => expect(dialogContainer).toBeDefined())
    await act(async () => {
      fireEvent.click(getByText(dialogContainer, 'yes'))
    })
  })

  test('grid and list view actions', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={multipleStepsInitialView}>
          <ExecutionPanel>{children}</ExecutionPanel>
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    const gridToggle = screen.getByTestId('grid-view')
    await waitFor(() => expect(gridToggle).toBeInTheDocument())
    const listToggle = screen.getByTestId('list-view')
    await waitFor(() => expect(listToggle).toBeInTheDocument())

    const searchInput = container.querySelector('input[type="search"]') as HTMLInputElement
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'shell' } })
    })

    await act(async () => {
      fireEvent.click(listToggle)
    })

    const rows = container.querySelectorAll('div[role="row"]')
    expect(rows.length).toBe(3)
    await act(async () => {
      userEvent.click(rows[1])
    })
    const settingsPanel = container.querySelectorAll('[data-icon="more"]')[0]!
    await act(async () => {
      userEvent.click(settingsPanel)
    })
    //edit settings
    userEvent.click(settingsPanel)
    expect(queryByText(`templatesLibrary.openEditTemplate`)).toBeInTheDocument()
    await act(async () => {
      userEvent.click(queryByText('templatesLibrary.openEditTemplate')!)
    })
  })
})
