/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, act, waitFor, getByRole } from '@testing-library/react'
import { Formik, FormikForm, FormInput, IconName } from '@wings-software/uicore'
import type { FormikProps } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import type { StepElementConfig } from 'services/cd-ng'
import * as cdng from 'services/cd-ng'
import * as pipelineng from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { MultiTypeMap } from '@common/components/MultiTypeMap/MultiTypeMap'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { setFormikRef, Step, StepProps, StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import {
  getFormValuesInCorrectFormat,
  Types as TransformValuesTypes
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import * as PipelineVariablesContext from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { RightDrawer } from '../RightDrawer'
import pipelineContextMock, { updatePipelineViewFnArg1, updateStageFnArg1 } from './stateMock'
import { DrawerTypes } from '../../PipelineContext/PipelineActions'
import type { StepCommandsProps } from '../../StepCommands/StepCommandTypes'
import {
  basicYaml,
  blueGreenYaml,
  canaryYaml,
  defaultYaml,
  rollingYaml
} from '../../ExecutionStrategy/__tests__/mocks/mock'

const { getComputedStyle } = window
window.getComputedStyle = elt => getComputedStyle(elt)

jest.mock('@common/components/MonacoEditor/MonacoEditor')

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.spyOn(cdng, 'useGetListOfBranchesWithStatus').mockImplementation((): any => {
  return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
})
jest.spyOn(cdng, 'useListGitSync').mockImplementation((): any => {
  return { data: gitConfigs, refetch: getListGitSync, loading: false }
})
jest.spyOn(cdng, 'useGetSourceCodeManagers').mockImplementation((): any => {
  return { data: sourceCodeManagers, refetch: jest.fn(), loading: false }
})
jest.spyOn(cdng, 'useGetExecutionStrategyList').mockImplementation((): any => {
  return { data: [] }
})
jest.spyOn(cdng, 'useGetExecutionStrategyYaml').mockImplementation((props: cdng.UseGetExecutionStrategyYamlProps) => {
  switch (props.queryParams?.strategyType) {
    case 'Rolling':
      return {
        data: rollingYaml,
        error: null
      } as any
    case 'BlueGreen':
      return {
        data: blueGreenYaml,
        error: null
      } as any
    case 'Canary':
      return {
        data: canaryYaml,
        error: null
      } as any
    case 'Default':
      return {
        data: defaultYaml,
        error: null
      } as any
    case 'Basic':
      return {
        data: basicYaml,
        error: null
      } as any
    default:
      break
  }
})
jest.spyOn(pipelineng, 'useGetBarriersSetupInfoList').mockImplementation((): any => {
  return { data: '', error: null, loading: false }
})

const mockStepsData = {
  status: 'SUCCESS',
  data: {
    name: 'Library',
    stepsData: [],
    stepCategories: [
      {
        name: 'Continuous Integration',
        stepsData: [],
        stepCategories: [
          {
            name: 'Build',
            stepsData: [
              {
                name: 'Run',
                type: 'Run',
                disabled: false,
                featureRestrictionName: null
              },
              {
                name: 'Run Tests',
                type: 'RunTests',
                disabled: false,
                featureRestrictionName: null
              }
            ],
            stepCategories: []
          }
        ]
      }
    ]
  },
  metaData: null,
  correlationId: 'someId'
}

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: mockStepsData, refetch: jest.fn(), error: null, loading: false }
  })
}))

const pipelineVariablesContextMock = {
  originalPipeline: {
    name: 'stage1',
    identifier: 'stage1',
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'account.yogesh',
                namespace: 'harness-delegate'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'step1',
                    identifier: 'step1',
                    spec: {
                      connectorRef: 'harnessImage',
                      image: 'alpine',
                      command: "echo 'run'",
                      privileged: false
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  },
  variablesPipeline: {
    name: 'stage1',
    identifier: 'stage1',
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'account.yogesh',
                namespace: 'harness-delegate'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'step1',
                    identifier: 'step1',
                    spec: {
                      connectorRef: 'harnessImage',
                      image: 'alpine',
                      command: "echo 'run'",
                      privileged: false
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  },
  metadataMap: {},
  serviceExpressionPropertiesList: [],
  error: null,
  initLoading: false,
  loading: false,
  onSearchInputChange: jest.fn(),
  setPipeline: jest.fn(),
  setResolvedPipeline: jest.fn()
}
jest.spyOn(PipelineVariablesContext, 'usePipelineVariables').mockImplementation((): any => {
  return pipelineVariablesContextMock
})

const stepFormikRef = React.createRef<StepFormikRef<unknown>>()

const renderUI = (props: StepProps<any>): JSX.Element => {
  const { initialValues, onUpdate, readonly, isNewStep, formikRef } = props
  return (
    <Formik
      initialValues={initialValues}
      formName="ciRunStep"
      onSubmit={(_values: any) => {
        const schemaValues = getFormValuesInCorrectFormat(_values, [
          {
            name: 'identifier',
            type: TransformValuesTypes.Text
          },
          {
            name: 'name',
            type: TransformValuesTypes.Text
          },
          {
            name: 'description',
            type: TransformValuesTypes.Text
          },
          {
            name: 'spec.envVariables',
            type: TransformValuesTypes.Map
          }
        ])
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<any>) => {
        // This is required
        setFormikRef?.(formikRef as any, formik as any)

        return (
          <FormikForm>
            <FormInput.InputWithIdentifier
              inputName="name"
              idName="identifier"
              isIdentifierEditable={isNewStep}
              inputLabel={'Name'}
              inputGroupProps={{ disabled: readonly }}
            />
            <MultiTypeMap
              name={'spec.envVariables'}
              multiTypeFieldSelectorProps={{
                label: 'Environment Variables'
              }}
              disabled={readonly}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
class StepOne extends Step<any> {
  protected type = StepType.Run
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): any {
    return {}
  }
  protected defaultValues = {
    type: StepType.Run,
    identifier: 'step1',
    name: 'step1',
    description: 'test desc',
    spec: {
      connectorRef: 'harnessImage',
      image: 'alpine',
      command: "echo 'run'",
      privileged: false,
      envVariables: {
        env: 'prod',
        'env.release': 'latest',
        'env.release.prod.version': '1.0'
      }
    }
  }
  renderStep(props: StepProps<any>): JSX.Element {
    return renderUI(props)
  }
}
class DependencyStep extends Step<any> {
  protected type = StepType.Dependency
  protected stepName = 'Step Dependency'
  protected stepIcon: IconName = 'cross'
  protected defaultValues = {
    type: StepType.Dependency,
    identifier: 'stepDependency',
    name: 'Step Dependency',
    description: 'test desc',
    spec: {
      connectorRef: 'harnessImage',
      image: 'alpine',
      command: "echo 'run'",
      privileged: false
    }
  }
  validateInputSet(): any {
    return {}
  }
  renderStep(props: StepProps<any>): JSX.Element {
    return renderUI(props)
  }
}

factory.registerStep(new StepOne())
factory.registerStep(new DependencyStep())

jest.mock('../../StepCommands/StepCommands', () => {
  return {
    // eslint-disable-next-line react/display-name
    StepCommandsWithRef: React.forwardRef((props: StepCommandsProps, ref) => {
      React.useImperativeHandle(ref, () => ({
        setFieldError(key: string, error: string) {
          if (stepFormikRef.current) {
            ;(stepFormikRef.current as any).setFieldError(key, error)
          }
        },
        submitForm: () =>
          props.onUpdate({
            identifier: 'step1',
            name: 'step1',
            description: 'test desc',
            spec: {
              connectorRef: 'harnessImage',
              image: 'alpine',
              command: "echo 'run'",
              privileged: false
            }
          }),
        getValues: () => ({
          identifier: 'step1',
          name: 'step1',
          description: 'test desc',
          spec: {
            connectorRef: 'harnessImage',
            image: 'alpine',
            command: "echo 'run'",
            privileged: false
          }
        }),
        getErrors: () => ({})
      }))
      return (
        <TestStepWidget
          initialValues={{}}
          type={(props.step as StepElementConfig).type as StepType}
          stepViewType={StepViewType.Edit}
          ref={stepFormikRef}
          isNewStep={true}
        />
      )
    })
  }
})

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

jest.mock('../../PiplineHooks/useVariablesExpression', () => ({
  ...(jest.requireActual('../../PiplineHooks/useVariablesExpression') as any),
  useVariablesExpression: jest.fn().mockReturnValue({
    expressions: ['']
  })
}))

describe('Right Drawer tests', () => {
  describe('StepConfig tests', () => {
    test('Edit step works as expected', async () => {
      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_TEMPLATES: true } }}>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const applyBtn = await findByText('applyChanges')
      act(() => {
        fireEvent.click(applyBtn)
      })
      expect(pipelineContextMock.updateStage).toHaveBeenCalled()
      expect(pipelineContextMock.updateStage).toHaveBeenCalledWith(updateStageFnArg1)
    })

    test('Step save succeeds with allowed key values in step configuration', async () => {
      const { container, findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_TEMPLATES: true } }}>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const applyBtn = await findByText('applyChanges')
      act(() => {
        fireEvent.click(applyBtn)
      })
      expect(container).toMatchSnapshot()
      expect(pipelineContextMock.updateStage).toHaveBeenCalled()
      expect(pipelineContextMock.updateStage).toHaveBeenCalledWith(updateStageFnArg1)
    })

    test('discard changes works as expected', async () => {
      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_TEMPLATES: true } }}>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const discardBtn = await findByText('pipeline.discard')
      act(() => {
        fireEvent.click(discardBtn)
      })
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalled()
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalledWith(updatePipelineViewFnArg1)
    })

    test('clicking on close button should close drawer', () => {
      const { container } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_TEMPLATES: true } }}>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const closeBtn = getByRole(container, 'button', { name: 'cross' })
      act(() => {
        fireEvent.click(closeBtn)
      })
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalled()
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalledWith(updatePipelineViewFnArg1)
    })
  })

  describe('StepPallete tests', () => {
    test('Add step should work as expected when paletteData is not there', async () => {
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.AddStep
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any)

      const { getByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )

      const stepLibraryHeader = getByText('stepPalette.title')
      expect(stepLibraryHeader).toBeInTheDocument()

      const step = getByText('Run').closest('section')?.parentElement

      act(() => {
        fireEvent.click(step!)
      })
      await waitFor(() => expect(pipelineContextMock.updatePipelineView).toBeCalled())
      expect(pipelineContextMock.updatePipelineView).toBeCalledWith(updatePipelineViewFnArg1)
    })

    test('Add step should work as expected when paletteData is there', async () => {
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.AddStep
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false,
          entity: {}
        } as any)

      const { getByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )

      const stepLibraryHeader = getByText('stepPalette.title')
      expect(stepLibraryHeader).toBeInTheDocument()

      const step = getByText('Run').closest('section')?.parentElement

      act(() => {
        fireEvent.click(step!)
      })
      await waitFor(() => expect(pipelineContextMock.updatePipelineView).toBeCalled())
      expect(pipelineContextMock.updatePipelineView).toBeCalledWith(updatePipelineViewFnArg1)
    })
  })

  describe('PipelineVariables tests', () => {
    beforeAll(() => {
      pipelineContextMock.stepsFactory.getStepData = () => undefined
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.PipelineVariables
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any)
    })
    test('should render fine', async () => {
      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const variablesHeader = await findByText('common.variables')
      expect(variablesHeader).toBeInTheDocument()
    })

    test('clicking on close button should close drawer', () => {
      const { container } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <PipelineVariablesContext.PipelineVariablesContext.Provider value={pipelineVariablesContextMock}>
            <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_TEMPLATES: true } }}>
              <RightDrawer />
            </TestWrapper>
          </PipelineVariablesContext.PipelineVariablesContext.Provider>
        </PipelineContext.Provider>
      )
      const closeBtn = getByRole(container, 'button', { name: 'cross' })
      act(() => {
        fireEvent.click(closeBtn)
      })
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalled()
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalledWith(updatePipelineViewFnArg1)
      expect(pipelineVariablesContextMock.onSearchInputChange).toHaveBeenCalled()
    })
  })

  describe('Templates tests', () => {
    test('should render fine', async () => {
      pipelineContextMock.stepsFactory.getStepData = () => undefined
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.Templates
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any)

      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )

      const templatesHeader = await findByText('common.templates')
      expect(templatesHeader).toBeInTheDocument()
    })
  })

  describe('ExecutionStrategy tests', () => {
    beforeAll(() => {
      pipelineContextMock.stepsFactory.getStepData = () => undefined
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.ExecutionStrategy
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any)
    })

    test('should render fine', async () => {
      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const executionStrategyHeader = await findByText('pipeline.executionStrategy.executionStrategies')
      expect(executionStrategyHeader).toBeInTheDocument()
    })

    test('clicking on close button should close drawer', () => {
      const { container } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_TEMPLATES: true } }}>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const closeBtn = getByRole(container, 'button', { name: 'cross' })
      act(() => {
        fireEvent.click(closeBtn)
      })
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalled()
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalledWith(updatePipelineViewFnArg1)
    })
  })

  describe('PipelineNotifications tests', () => {
    test('should render fine', async () => {
      pipelineContextMock.stepsFactory.getStepData = () => undefined
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.PipelineNotifications
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any)

      const { findAllByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )

      const notificationHeader = await findAllByText('notifications.name')
      expect(notificationHeader).toHaveLength(1)
    })
  })

  describe('ConfigureService tests', () => {
    test('Edit step should work as expected', async () => {
      pipelineContextMock.stepsFactory.getStepData = () => ({
        icon: 'dependency-step',
        name: 'Configure Service Dependency',
        type: StepType.Dependency
      })
      ;(pipelineContextMock as any).state.pipelineView.drawerData.type = DrawerTypes.ConfigureService as any
      ;(pipelineContextMock as any).state.pipelineView.drawerData.data.stepConfig.node.type = StepType.Dependency
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any)

      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )

      const configServiceHeader = await findByText('Configure Service Dependency')
      expect(configServiceHeader).toBeInTheDocument()
      const applyBtn = await findByText('applyChanges')
      act(() => {
        fireEvent.click(applyBtn)
      })
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalled()
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalledWith(updatePipelineViewFnArg1)
    })

    test('Add step should work as expected', async () => {
      pipelineContextMock.stepsFactory.getStepData = () => ({
        icon: 'dependency-step',
        name: 'Configure Service Dependency',
        type: StepType.Dependency
      })
      ;(pipelineContextMock as any).state.pipelineView.drawerData.type = DrawerTypes.ConfigureService as any
      ;(pipelineContextMock as any).state.pipelineView.drawerData.data.stepConfig.node.type = StepType.Dependency
      if (pipelineContextMock.state.pipelineView.drawerData.data) {
        pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any
        ;(pipelineContextMock as any).state.pipelineView.drawerData.data.stepConfig.addOrEdit = 'add'
      }

      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )

      const configServiceHeader = await findByText('Configure Service Dependency')
      expect(configServiceHeader).toBeInTheDocument()
      const applyBtn = await findByText('applyChanges')
      act(() => {
        fireEvent.click(applyBtn)
      })
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalled()
      expect(pipelineContextMock.updatePipelineView).toHaveBeenCalledWith(updatePipelineViewFnArg1)
    })
  })

  describe('AddProvisionerStep tests', () => {
    test('Add provisioner step should work as expected', async () => {
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.AddProvisionerStep
      pipelineContextMock.state.pipelineView?.drawerData?.data &&
        (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
          isRollback: false,
          isParallelNodeClicked: false
        } as any)

      const { getByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )

      const stepLibraryHeader = getByText('stepPalette.title')
      expect(stepLibraryHeader).toBeInTheDocument()

      const step = getByText('Run').closest('section')?.parentElement

      act(() => {
        fireEvent.click(step!)
      })
      await waitFor(() => expect(pipelineContextMock.updatePipelineView).toBeCalled())
      expect(pipelineContextMock.updatePipelineView).toBeCalledWith(updatePipelineViewFnArg1)
    })
  })

  describe('ProvisionerStepConfig tests', () => {
    test('Edit step works as expected', async () => {
      pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.ProvisionerStepConfig
      const { findByText } = render(
        <PipelineContext.Provider value={pipelineContextMock}>
          <TestWrapper defaultAppStoreValues={{ featureFlags: { NG_TEMPLATES: true } }}>
            <RightDrawer />
          </TestWrapper>
        </PipelineContext.Provider>
      )
      const applyBtn = await findByText('applyChanges')
      act(() => {
        fireEvent.click(applyBtn)
      })
      expect(pipelineContextMock.updateStage).toHaveBeenCalled()
      expect(pipelineContextMock.updateStage).toHaveBeenCalledWith(updateStageFnArg1)
    })
  })
})
