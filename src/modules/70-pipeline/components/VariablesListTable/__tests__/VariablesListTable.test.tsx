/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { flatMap } from 'lodash-es'
import { render } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

const getEntries = function <T>(object: T, prefix = ''): Array<any> {
  return flatMap(Object.entries(object), ([k, v]: { k: string; v: any }[]) =>
    Object(v) === v ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  )
}

export function flatObject(object: Record<string, any>): Record<string, any> {
  return getEntries(object).reduce((o, k) => ((o[k[0]] = k[1]), o), {})
}

import { VariablesListTable } from '../VariablesListTable'

describe('<VariablesListTable /> tests', () => {
  test('Should render properly', () => {
    const { container } = render(
      <VariablesListTable
        originalData={{
          identifier: 'My_Run_Step',
          name: 'My Run Step',
          description: 'Description',
          timeout: '10s',
          spec: {
            connectorRef: 'account.connectorRef',
            image: 'image',
            command: 'command',
            privileged: false,
            reports: {
              type: 'JUnit',
              spec: {
                paths: ['path1.xml', 'path2.xml', 'path3.xml', 'path4.xml', 'path5.xml']
              }
            },
            envVariables: {
              key1: 'value1',
              key2: 'value2',
              key3: 'value3'
            },
            outputVariables: [
              { name: 'variable1' },
              { name: 'variable2' },
              { name: 'variable3' },
              { name: 'variable4' }
            ],
            resources: {
              limits: {
                memory: '128Mi',
                cpu: '0.2'
              }
            }
          }
        }}
        data={flatObject({
          type: StepType.Run,
          __uuid: 'step-identifier',
          identifier: 'run',
          name: 'step-name',
          description: 'step-description',
          timeout: 'step-timeout',
          spec: {
            connectorRef: 'step-connectorRef',
            image: 'step-image',
            command: 'step-command',
            privileged: 'step-privileged',
            reports: {
              spec: {
                paths: 'step-reportPaths'
              }
            },
            envVariables: 'step-envVariables',
            outputVariables: 'step-outputVariables',
            resources: {
              limits: {
                memory: 'step-limitMemory',
                cpu: 'step-limitCPU'
              }
            }
          }
        })}
        metadataMap={{
          'step-name': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.name',
              localName: 'step.run.name'
            }
          },
          'step-identifier': {
            yamlExtraProperties: {
              properties: [
                {
                  fqn: 'pipeline.stages.qaStage.execution.steps.run.identifier',
                  localName: 'step.run.identifier',
                  variableName: 'identifier'
                }
              ]
            }
          },
          'step-description': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.description',
              localName: 'step.run.description'
            }
          },
          'step-timeout': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.timeout',
              localName: 'step.run.timeout'
            }
          },
          'step-connectorRef': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.connectorRef',
              localName: 'step.run.spec.connectorRef'
            }
          },
          'step-image': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.image',
              localName: 'step.run.spec.image'
            }
          },
          'step-command': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.command',
              localName: 'step.run.spec.command'
            }
          },
          'step-privileged': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.privileged',
              localName: 'step.run.spec.privileged'
            }
          },
          'step-reportPaths': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.reports.spec.paths',
              localName: 'step.run.spec.reports.spec.paths'
            }
          },
          'step-envVariables': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.spec.run.envVariables',
              localName: 'step.run.spec.envVariables'
            }
          },
          'step-outputVariables': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.outputVariables',
              localName: 'step.run.spec.outputVariables'
            }
          },
          'step-limitMemory': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.resources.limits.memory',
              localName: 'step.run.spec.resources.limits.memory'
            }
          },
          'step-limitCPU': {
            yamlProperties: {
              fqn: 'pipeline.stages.qaStage.execution.steps.run.spec.resources.limits.cpu',
              localName: 'step.run.resources.spec.limits.cpu'
            }
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
