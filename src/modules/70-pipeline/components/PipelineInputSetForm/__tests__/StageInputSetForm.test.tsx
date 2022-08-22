/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { merge } from 'lodash-es'
import { Form } from 'formik'
import { Formik, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StageInputSetForm } from '../StageInputSetForm'

jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

const props = (withNewProp = false): any => ({
  deploymentStageTemplate: {
    serviceConfig: {
      serviceDefinition: {
        type: 'Kubernetes',
        spec: {
          artifacts: {
            sidecars: [],
            primary: { type: 'Dockerhub', spec: { connectorRef: 'org.docker', imagePath: 'asd' } }
          },
          manifests: [],
          artifactOverrideSets: [],
          manifestOverrideSets: []
        }
      },
      stageOverrides: {
        artifacts: {
          primary: {
            spec: {
              connectorRef: '<+input'
            },
            type: 'DockerRegistry' as const
          }
        }
      }
    },
    infrastructure: withNewProp
      ? {
          spec: {
            namespace: 'test',
            serviceAccountName: 'name1',
            initTimeout: '1w',
            connectorRef: 'connectorRef',
            annotations: {
              annotation1: '<+input>'
            },
            labels: {
              label1: '<+input>'
            },
            spec: {
              identifier: 'id'
            },
            automountServiceAccountToken: true,
            priorityClassName: 'priority',
            containerSecurityContext: {
              privileged: true,
              allowPrivilegeEscalation: true,
              capabilities: { add: ['demo'], drop: ['demo'] },
              runAsNonRoot: true,
              readOnlyRootFilesystem: true,
              runAsUser: 1
            }
          },
          infrastructureDefinition: {
            type: 'KubernetesDirect',
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              namespace: RUNTIME_INPUT_VALUE,
              releaseName: RUNTIME_INPUT_VALUE
            },
            provisioner: {
              steps: [],
              rollbackSteps: []
            }
          },
          type: 'VM'
        }
      : {
          spec: {
            namespace: 'test',
            serviceAccountName: 'name1',
            initTimeout: '1w',
            connectorRef: 'connectorRef',
            runAsUser: 'user',
            annotations: {
              annotation1: '<+input>'
            },
            labels: {
              label1: '<+input>'
            }
          },
          type: 'KubernetesDirect'
        },
    execution: withNewProp
      ? {
          steps: [
            {
              stepGroup: {
                identifier: 'test',
                name: 'test',
                type: 'test',
                description: 'ts'
              }
            },
            {
              step: {
                identifier: 'test',
                name: 'test',
                type: 'test',
                description: 'ts',
                timeout: '10m',
                template: {
                  templateInputs: {
                    type: 'Deploy',
                    spec: {
                      delegateSelectors: '<+input>'
                    },
                    when: {
                      pipelineStatus: 'Success',
                      condition: '<+input>'
                    }
                  }
                }
              }
            },
            {
              step: {}
            }
          ],
          rollbackSteps: []
        }
      : {
          steps: [
            {
              step: {
                identifier: 'test',
                name: 'test',
                type: 'test',
                description: 'ts',
                timeout: '10m'
              }
            }
          ],
          rollbackSteps: []
        },
    serviceDependencies: [
      {
        identifier: 'dep1',
        name: 'dep1',
        type: 'Service',
        spec: {
          connectorRef: 'harnessImage',
          image: 'alpine'
        }
      }
    ]
  },
  deploymentStage: {
    serviceConfig: withNewProp
      ? {
          useFromStage: {
            stage: 'deploy'
          },
          stageOverrides: {
            artifacts: {
              primary: {
                spec: {
                  connectorRef: '<+input'
                },
                type: 'DockerRegistry' as const
              }
            }
          }
        }
      : {
          serviceDefinition: {
            type: 'Kubernetes',
            spec: {
              artifacts: {
                sidecars: [],
                primary: { type: 'Dockerhub', spec: { connectorRef: 'org.docker', imagePath: 'asd' } }
              },
              manifests: [],
              artifactOverrideSets: [],
              manifestOverrideSets: []
            }
          },
          stageOverrides: {
            artifacts: {
              primary: {
                spec: {
                  connectorRef: '<+input'
                },
                type: 'DockerRegistry' as const
              }
            }
          }
        },
    infrastructure: {
      infrastructureDefinition: {
        type: 'KubernetesDirect',
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          namespace: RUNTIME_INPUT_VALUE,
          releaseName: RUNTIME_INPUT_VALUE
        },
        provisioner: {
          steps: [],
          rollbackSteps: []
        }
      }
    },
    execution: {
      steps: withNewProp
        ? [
            {
              step: {}
            },
            {
              step: {
                identifier: 'test',
                name: 'test',
                type: 'test',
                description: 'ts',
                timeout: '10m',
                template: {
                  templateInputs: {
                    type: 'Deploy',
                    spec: {
                      delegateSelectors: '<+input>'
                    },
                    when: {
                      pipelineStatus: 'Success',
                      condition: '<+input>'
                    }
                  }
                }
              }
            }
          ]
        : [
            {
              step: {
                identifier: 'test',
                name: 'test',
                type: 'test',
                description: 'ts',
                timeout: '10m'
              }
            }
          ],
      rollbackSteps: []
    },
    serviceDependencies: [
      {
        identifier: 'dep1',
        name: 'dep1',
        type: 'Service',
        spec: {
          connectorRef: 'harnessImage',
          image: 'alpine'
        }
      }
    ]
  },
  path: withNewProp ? '' : 'stages[0].stage.spec'
})

describe('stageinputset tests', () => {
  describe('viewType InputSet', () => {
    test('initial render', () => {
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageInputSetForm {...props()} viewType={StepViewType.InputSet} />
            </Form>
          </Formik>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('initial render2', () => {
      const formProps: any = merge({}, props())
      formProps.deploymentStageTemplate.infrastructure.spec = null
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageInputSetForm {...merge({}, props())} viewType={StepViewType.InputSet} />
            </Form>
          </Formik>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
  describe('viewType DeploymentForm', () => {
    test('initial render', () => {
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageInputSetForm {...props()} viewType={StepViewType.DeploymentForm} />
            </Form>
          </Formik>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('initial render2', () => {
      const formProps: any = merge({}, props())
      formProps.deploymentStageTemplate.infrastructure.spec = null
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageInputSetForm {...merge({}, props())} viewType={StepViewType.DeploymentForm} />
            </Form>
          </Formik>
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
    test('initial render with infra as VM', () => {
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageInputSetForm {...props(true)} path={''} viewType={StepViewType.DeploymentForm} />
            </Form>
          </Formik>
        </TestWrapper>
      )
      //collapse form
      fireEvent.click(container.querySelector('[icon="chevron-up"]') as HTMLElement)

      const collapse = container.querySelector('[icon="chevron-down"]')
      expect(collapse).toBeDefined()
    })
    test('initial render with infra as VM & path', () => {
      const { container } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageInputSetForm
                {...props(true)}
                path={'stages[1].stage.spec'}
                viewType={StepViewType.DeploymentForm}
              />
            </Form>
          </Formik>
        </TestWrapper>
      )
      const deleteButton = container.querySelectorAll('[data-icon="main-trash"]')
      fireEvent.click(deleteButton[0])
      expect(container.querySelectorAll('[data-icon="main-trash"]').length).toBe(3)
    })
    test('initial render with empty props', () => {
      const propNew = {
        deploymentStageTemplate: {
          serviceConfig: {},
          execution: {},
          serviceDependencies: [],
          infrastructure: {}
        },
        deploymentStage: {
          serviceConfig: {},
          execution: {},
          serviceDependencies: [],
          infrastructure: {}
        }
      } as any
      const { getByText } = render(
        <TestWrapper>
          <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
            <Form>
              <StageInputSetForm {...propNew} path={'stages[1].stage.spec'} viewType={StepViewType.DeploymentForm} />
            </Form>
          </Formik>
        </TestWrapper>
      )
      expect(getByText('infrastructureText')).toBeDefined()
      expect(getByText('executionText')).toBeDefined()
    })
  })
})
