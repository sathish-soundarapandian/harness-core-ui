/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { omit } from 'lodash-es'
import { render, waitFor, act, queryByAttribute } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import * as cdng from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import {
  AccountConnectorResponse,
  RepositoryURLConnectorResponse,
  onEditInitialValuesFixed,
  onEditInitialValuesFixed2,
  onEditInitialValuesAllRuntimeInputs
} from './mock'
import { GitCloneStep } from '../GitCloneStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Git Clone Step', () => {
  beforeAll(() => {
    factory.registerStep(new GitCloneStep())
  })

  describe('Step Render', () => {
    test('initial render', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.GitClone} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render onEdit fixed values properly', () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(AccountConnectorResponse as any)

      const { container } = render(
        <TestStepWidget
          initialValues={onEditInitialValuesFixed}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render onEdit fixed values properly with repo connector', () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(RepositoryURLConnectorResponse as any)

      const { container } = render(
        <TestStepWidget
          initialValues={onEditInitialValuesFixed2}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )
      expect(container.querySelector('[name="spec.repoName"]')).toHaveAttribute(
        'value',
        'https://github.com/mtran7/GitExpRepo'
      )
      expect(container.querySelector('[name="spec.build.spec.branch"]')).toHaveAttribute('value', RUNTIME_INPUT_VALUE)
    })

    test('should render onEdit runtime input values properly', async () => {
      const { container } = render(
        <TestStepWidget
          initialValues={onEditInitialValuesAllRuntimeInputs}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('InputSet View Render', () => {
    test('should render all fields with validations', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const template = {
        type: StepType.GitClone,
        identifier: 'My_GitClone_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          repoName: RUNTIME_INPUT_VALUE,
          build: RUNTIME_INPUT_VALUE,
          cloneDirectory: RUNTIME_INPUT_VALUE,
          depth: RUNTIME_INPUT_VALUE,
          sslVerify: RUNTIME_INPUT_VALUE,
          runAsUser: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const allValues = {
        type: StepType.GitClone,
        name: 'Test A',
        identifier: 'My_GitClone_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          repoName: RUNTIME_INPUT_VALUE,
          build: RUNTIME_INPUT_VALUE,
          cloneDirectory: RUNTIME_INPUT_VALUE,
          depth: RUNTIME_INPUT_VALUE,
          sslVerify: RUNTIME_INPUT_VALUE,
          runAsUser: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.GitClone}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      await act(() => ref.current?.submitForm()!)
      expect(container).toMatchSnapshot()

      expect(onUpdate).not.toHaveBeenCalled()
    })

    test('should not render any fields', async () => {
      const template = {
        type: StepType.GitClone,
        identifier: 'My_GitClone_Step'
      }

      const allValues = {
        type: StepType.GitClone,
        identifier: 'My_GitClone_Step',
        name: 'My GitClone Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          connectorRef: 'mtranacctconnector',
          repoName: 'abct',
          cloneDirectory: '/harness',
          depth: 1,
          sslVerify: false,
          runAsUser: '1000',
          resources: {
            limits: {
              memory: '1G',
              cpu: '100m'
            }
          },
          build: {
            type: 'branch',
            spec: {
              branch: 'main'
            }
          }
        }
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.GitClone}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('InputVariable View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            identifier: 'Test_A',
            name: 'Test A',
            type: StepType.GitClone,
            spec: {
              connectorRef: 'mtranacctconnector',
              repoName: 'abct',
              cloneDirectory: '/harness',
              depth: 1,
              sslVerify: false,
              runAsUser: '1000',
              resources: {
                limits: {
                  memory: '1G',
                  cpu: '100m'
                }
              },
              build: {
                type: 'branch',
                spec: {
                  branch: 'main'
                }
              }
            },
            description: 'adsfs',
            timeout: '1d'
          }}
          customStepProps={{
            stageIdentifier: 'qaStage',
            metadataMap: {
              'step-name': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.name',
                  localName: 'step.gitClone.name'
                }
              },
              'step-description': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.description',
                  localName: 'step.gitClone.description'
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.timeout',
                  localName: 'step.gitClone.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.connectorRef',
                  localName: 'step.gitClone.spec.connectorRef'
                }
              },
              'step-repoName': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.repoName',
                  localName: 'step.gitClone.spec.repoName'
                }
              },
              'step-cloneDirectory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.cloneDirectory',
                  localName: 'step.gitClone.spec.cloneDirectory'
                }
              },
              'step-depth': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.depth',
                  localName: 'step.gitClone.spec.depth'
                }
              },
              'step-build': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.build',
                  localName: 'step.gitClone.spec.build'
                }
              },
              'step-sslVerify': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.sslVerify',
                  localName: 'step.gitClone.spec.sslVerify'
                }
              },
              'step-runAsUser': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.runAsUser',
                  localName: 'step.gitClone.spec.runAsUser'
                }
              },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.resources.limits.memory',
                  localName: 'step.gitClone.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gitClone.spec.resources.limits.cpu',
                  localName: 'step.gitClone.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.GitClone,
              identifier: 'plugin',
              name: 'step-name',
              description: 'step-description',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                repoName: 'step-repoName',
                cloneDirectory: 'step-cloneDirectory',
                depth: 'step-depth',
                sslVerify: 'step-sslVerify',
                runAsUser: 'step-runAsUser',
                build: 'step-build',
                resources: {
                  limits: {
                    memory: 'step-limitMemory',
                    cpu: 'step-limitCPU'
                  }
                }
              }
            }
          }}
          type={StepType.GitClone}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('Interactivity', () => {
    test('should render tag name on switching build type', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(AccountConnectorResponse as any)

      render(
        <TestStepWidget
          initialValues={onEditInitialValuesFixed}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )
      const gitTagRadio = document.body.querySelector('[value="tag"]')
      const gitBranch = document.body.querySelector('[name="spec.build.spec.branch"]')
      await waitFor(() => {
        expect(gitBranch).toHaveAttribute('value', 'main')
      })
      if (gitTagRadio) {
        userEvent.click(gitTagRadio)
      } else {
        throw Error('cannot find tag radio button')
      }

      await waitFor(() => {
        expect(document.body.querySelector('[name="spec.build.spec.branch"]')).not.toBeInTheDocument()
        expect(document.body.querySelector('[name="spec.build.spec.tag"]')).toBeInTheDocument()
      })
    })
    test('should persist branch name on switching build type to Tag and back', async () => {
      jest.spyOn(cdng, 'useGetConnector').mockReturnValue(AccountConnectorResponse as any)

      const { container } = render(
        <TestStepWidget
          initialValues={onEditInitialValuesFixed}
          type={StepType.GitClone}
          stepViewType={StepViewType.Edit}
        />
      )
      const gitTagRadio = document.body.querySelector('[value="tag"]')
      const gitBranch = document.body.querySelector('[name="spec.build.spec.branch"]')

      await waitFor(() => {
        expect(gitBranch).toHaveAttribute('value', 'main')
      })
      const branchNameInput = queryByAttribute('name', container, 'spec.build.spec.branch')!
      if (gitTagRadio) {
        userEvent.click(gitTagRadio)
      } else {
        throw Error('cannot find tag radio button')
      }
      await waitFor(() => {
        expect(branchNameInput).not.toBeInTheDocument()
        expect(document.body.querySelector('[name="spec.build.spec.tag"]')).toBeInTheDocument()
      })
      const gitBranchRadio = document.body.querySelector('[value="branch"]')

      if (gitBranchRadio) {
        userEvent.click(gitBranchRadio)
      } else {
        throw Error('cannot find git branch button')
      }
      await waitFor(() => {
        expect(document.body.querySelector('[name="spec.build.spec.branch"]')).toBeInTheDocument()
        expect(document.body.querySelector('[name="spec.build.spec.tag"]')).not.toBeInTheDocument()
        // this value does persist
        expect(gitBranch).toHaveAttribute('value', 'main')
      })
    })
  })
})

describe('Payload Comparison', () => {
  test('should submit onEdit runtime input values properly', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={onEditInitialValuesAllRuntimeInputs}
        type={StepType.GitClone}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith(onEditInitialValuesAllRuntimeInputs)
  })

  test('should submit onEdit fixed values properly with repoName', async () => {
    jest.spyOn(cdng, 'useGetConnector').mockReturnValue(RepositoryURLConnectorResponse as any)
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const expectedOnEditInitialValues = { ...omit(onEditInitialValuesFixed, 'type') }
    render(
      <TestStepWidget
        initialValues={onEditInitialValuesFixed}
        type={StepType.GitClone}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith(expectedOnEditInitialValues)
  })

  test('should not submit onEdit due to blocked /harness for Clone Directory', async () => {
    jest.spyOn(cdng, 'useGetConnector').mockReturnValue(RepositoryURLConnectorResponse as any)
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onEditInitialValuesFixedModifiedCloneDirectory = { ...onEditInitialValuesFixed }
    // this is blocked on UI and backend
    onEditInitialValuesFixedModifiedCloneDirectory.spec.cloneDirectory = '/harness'
    const { getByText } = render(
      <TestStepWidget
        initialValues={onEditInitialValuesFixedModifiedCloneDirectory}
        type={StepType.GitClone}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(getByText('pipeline.stepCommonFields.validation.notIn')).toBeInTheDocument()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  test('should submit onEdit fixed values properly without needing repoName on TriggerForm', async () => {
    jest.spyOn(cdng, 'useGetConnector').mockReturnValue(RepositoryURLConnectorResponse as any)
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const expectedOnEditInitialValues2 = { ...omit(onEditInitialValuesFixed2, 'type') }
    render(
      <TestStepWidget
        initialValues={onEditInitialValuesFixed2}
        type={StepType.GitClone}
        stepViewType={StepViewType.TriggerForm}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith(expectedOnEditInitialValues2)
  })
})
