/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IntegrationStageConfigImpl } from 'services/ci'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getCIStageInfraType } from '../CIPipelineStudioUtils'

describe('Test CI Pipeline Studio utils', () => {
  test('Test getCIStageInfraType method', () => {
    expect(getCIStageInfraType({})).toBe(undefined)
    let stage = {
      stage: {
        name: 'stage',
        identifier: 'stage',
        description: '',
        type: 'CI',
        spec: {
          cloneCodebase: true,
          execution: {
            steps: [
              {
                step: {
                  type: 'Run',
                  name: 'Run_1',
                  identifier: 'Run_1',
                  spec: { shell: 'Sh', command: 'echo 0', outputVariables: [{ name: 'image' }] }
                }
              },
              {
                step: {
                  type: 'RunTests',
                  name: 'RunTests_1',
                  identifier: 'RunTests_1',
                  spec: {
                    language: 'Java',
                    buildTool: 'Bazel',
                    args: 'args',
                    runOnlySelectedTests: true,
                    reports: { type: 'JUnit', spec: { paths: ['path'] } }
                  }
                }
              },
              {
                step: {
                  type: 'Plugin',
                  name: 'Plugin_1',
                  identifier: 'Plugin_1',
                  spec: { connectorRef: 'account.harnessImage', image: 'node', runAsUser: '1000' }
                }
              }
            ]
          },
          platform: { os: 'Linux', arch: 'Amd64' },
          runtime: { type: 'Cloud', spec: {} }
        } as IntegrationStageConfigImpl
      }
    }
    expect(getCIStageInfraType(stage as StageElementWrapper<BuildStageElementConfig> | undefined)).toBe(
      CIBuildInfrastructureType.Cloud
    )
    stage = {
      stage: {
        name: 'stage',
        identifier: 'stage',
        description: '',
        type: 'CI',
        spec: {
          cloneCodebase: true,
          execution: {
            steps: [
              {
                step: {
                  type: 'Run',
                  name: 'Run_1',
                  identifier: 'Run_1',
                  spec: {
                    connectorRef: 'CI_Customer_Docker',
                    image: 'node',
                    shell: 'Sh',
                    command: 'echo 0',
                    outputVariables: [{ name: 'image' }]
                  }
                }
              },
              {
                step: {
                  type: 'RunTests',
                  name: 'RunTests_1',
                  identifier: 'RunTests_1',
                  spec: {
                    connectorRef: 'CI_Customer_Docker',
                    image: 'node',
                    language: 'Java',
                    buildTool: 'Bazel',
                    args: 'args',
                    runOnlySelectedTests: true,
                    reports: { type: 'JUnit', spec: { paths: ['path'] } }
                  }
                }
              },
              {
                step: {
                  type: 'Plugin',
                  name: 'Plugin_1',
                  identifier: 'Plugin_1',
                  spec: { connectorRef: 'account.harnessImage', image: 'node', runAsUser: '1000' }
                }
              }
            ]
          },
          infrastructure: {
            type: 'KubernetesDirect',
            spec: {
              connectorRef: 'cidelegateplay',
              namespace: 'default',
              automountServiceAccountToken: true,
              nodeSelector: {},
              os: 'Linux'
            }
          }
        } as IntegrationStageConfigImpl
      }
    }
    expect(getCIStageInfraType(stage as StageElementWrapper<BuildStageElementConfig> | undefined)).toBe(
      CIBuildInfrastructureType.KubernetesDirect
    )
  })
})
