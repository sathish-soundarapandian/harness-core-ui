/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { StepPaletteProps } from '@pipeline/components/PipelineStudio/StepPalette/StepPalette'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import mockImport from 'framework/utils/mockImport'
import { DeploymentConfigStepDrawer } from '../DeploymentConfigStepDrawer'

jest.mock('framework/Templates/TemplateSelectorContext/useTemplateSelector', () => ({
  useTemplateSelector: jest.fn().mockReturnValue({
    getTemplate: jest.fn().mockImplementation(() => ({ template: {}, isCopied: false }))
  })
}))

jest.mock('@pipeline/components/PipelineStudio/StepPalette/StepPalette', () => ({
  StepPalette: (props: StepPaletteProps) => {
    return (
      <div className="step-palette-mock">
        <button
          id="step-palette-mock-btn"
          onClick={() => {
            props.onSelect({ name: 'HTTP Step', type: StepType.HTTP, icon: 'http-step' })
          }}
        >
          Select Step
        </button>
      </div>
    )
  }
}))

jest.mock('@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton', () => ({
  SaveTemplateButton: (props: any) => {
    return (
      <div className="save-template-button-mock">
        <button
          id="save-template-btn"
          onClick={async () => {
            await props.data()
          }}
        >
          Save template button
        </button>
      </div>
    )
  }
}))

const mockDeploymentContext = {
  setDrawerData: jest.fn(),
  stepsFactory: factory,
  allowableTypes: [],
  isReadOnly: false
}

describe('Test DeploymentConfigStepDrawer', () => {
  test('initial render - drawer type - step config', async () => {
    mockImport('@cd/context/DeploymentContext/DeploymentContextProvider', {
      useDeploymentContext: () => ({
        ...mockDeploymentContext,
        drawerData: {
          type: DrawerTypes.StepConfig,
          data: {
            stepConfig: {
              node: {}
            },
            isDrawerOpen: true
          }
        }
      })
    })

    const { container } = render(
      <TestWrapper>
        <DeploymentConfigStepDrawer />
      </TestWrapper>
    )

    const saveTemplateBtn = screen.getByText('Save template button')
    fireEvent.click(saveTemplateBtn)
    expect(container).toMatchSnapshot()
  })

  test('initial render - drawer type - add step', async () => {
    mockImport('@cd/context/DeploymentContext/DeploymentContextProvider', {
      useDeploymentContext: () => ({
        ...mockDeploymentContext,
        drawerData: {
          type: DrawerTypes.AddStep,
          data: {
            stepConfig: {
              node: {}
            },
            isDrawerOpen: true
          }
        }
      })
    })

    const { container } = render(
      <TestWrapper>
        <DeploymentConfigStepDrawer />
      </TestWrapper>
    )

    const stepPaletteBtn = screen.getByText('Select Step')
    fireEvent.click(stepPaletteBtn)
    expect(container).toMatchSnapshot()
  })

  test('initial render - drawer type - view template details without template', async () => {
    mockImport('@cd/context/DeploymentContext/DeploymentContextProvider', {
      useDeploymentContext: () => ({
        ...mockDeploymentContext,
        drawerData: {
          type: DrawerTypes.ViewTemplateDetails,
          data: {
            templateDetails: {},
            isDrawerOpen: true
          }
        }
      })
    })

    const { container } = render(
      <TestWrapper>
        <DeploymentConfigStepDrawer />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('initial render - drawer type - view template details with template', async () => {
    mockImport('@cd/context/DeploymentContext/DeploymentContextProvider', {
      useDeploymentContext: () => ({
        ...mockDeploymentContext,
        drawerData: {
          type: DrawerTypes.ViewTemplateDetails,
          data: {
            templateDetails: {
              accountId: 'kmpySmUISimoRrJL6NL73w',
              orgIdentifier: 'default',
              projectIdentifier: 'Templateproject',
              identifier: 'manjutesttemplate',
              name: 'manju-test-template-qq-12344',
              description:
                'Flink is a versatile framework, supporting many different deployment scenarios in a mix and match fashion.',
              tags: { QAR: '', 'Internal 1': '', 'Canary 1': '', BLUE: '', 'Tag A': '' },
              yaml:
                'template:' +
                '\n    name: manju-test-template-qq-12344' +
                '\n    identifier: manjutesttemplate' +
                '\n    versionLabel: v4' +
                '\n    type: Step' +
                '\n    projectIdentifier: Templateproject' +
                '\n    orgIdentifier: defaults' +
                '\n    description: Flink is a versatile framework, supporting many different deployment scenarios in a mix and match fashion.' +
                '\n    tags:' +
                '\n        QAR: ""' +
                '\n        Internal 1: ""' +
                '\n        Canary 1: ""' +
                '\n        BLUE: ""' +
                '\n        Tag A: ""' +
                '\n    spec:' +
                '\n        type: HarnessApproval' +
                '\n        timeout: <+input>' +
                '\n        spec:' +
                '\n            approvalMessage: <+input>' +
                '\n            includePipelineExecutionHistory: true' +
                '\n            approvers:' +
                '\n                userGroups: <+input>' +
                '\n                minimumCount: <+input>' +
                '\n                disallowPipelineExecutor: false' +
                '\n            approverInputs:' +
                '\n                - name: "1"' +
                '\n                  defaultValue: "1"' +
                '\n                - name: ttt' +
                '\n                  defaultValue: ttt' +
                '\n        failureStrategies:' +
                '\n            - onFailure:' +
                '\n                  errors:' +
                '\n                      - Timeout' +
                '\n                  action:' +
                '\n                      type: MarkAsSuccess' +
                '\n',
              versionLabel: 'v4',
              templateEntityType: 'Step',
              childType: 'HarnessApproval',
              templateScope: 'project',
              version: 8,
              gitDetails: {},
              lastUpdatedAt: 1635626311830,
              stableTemplate: true
            },
            isDrawerOpen: true
          }
        }
      })
    })

    const { container } = render(
      <TestWrapper>
        <DeploymentConfigStepDrawer />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
