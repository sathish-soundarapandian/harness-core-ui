/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isMatch, has, get } from 'lodash-es'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineInfoConfig, StageElementConfig } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'
import { validateCICodebase, validatePipeline, validateStage } from '../StepUtil'
import {
  pipelineTemplateWithRuntimeInput,
  pipelineWithNoBuildInfo,
  pipelineWithBranchBuild,
  pipelineWithTagBuild,
  pipelineWithDeploymentStage,
  templateWithRuntimeTimeout,
  pipelineTemplateOriginalPipeline,
  pipelineTemplateTemplate,
  pipelineTemplateResolvedPipeline,
  pipelineWithPRBuild,
  pipelineWithVariables,
  templatePipelineWithVariables,
  resolvedPipelineWithVariables,
  stageWithVariables,
  templateStageWithVariables,
  originalStageWithVariables
} from './mock'

jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn(() => Promise.resolve(new Map())),
  useValidationError: () => ({ errorMap: new Map() })
}))

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test StepUtils', () => {
  test('Test validateCICodebase method for pipeline without build info', () => {
    const errors = validateCICodebase({
      // eslint-disable-next-line
      // @ts-ignore
      pipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      originalPipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet,
      selectedStageData: {
        selectedStages: [{ stageIdentifier: 'S1', stageName: 'S1', message: 'test', stagesRequired: [] }],
        selectedStageItems: [{ label: 'S1', value: 'S1' }],
        allStagesSelected: false
      },
      getString
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: {} } } } })).toBeTruthy()
  })

  test('Test validateCICodebase method for pipeline with build as run time info', () => {
    const errors = validateCICodebase({
      // eslint-disable-next-line
      // @ts-ignore
      pipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      originalPipeline: pipelineWithNoBuildInfo as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet,
      selectedStageData: {
        selectedStages: [{ stageIdentifier: 'S1', stageName: 'S1', message: 'test', stagesRequired: [] }],
        selectedStageItems: [{ label: 'S1', value: 'S1' }],
        allStagesSelected: false
      },
      getString
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: {} } } } })).toBeTruthy()
    expect(has(errors, 'properties.ci.codebase.build.type')).toBeTruthy()
  })

  test('Test validateCICodebase method for pipeline with branch build', () => {
    const errors = validateCICodebase({
      pipeline: pipelineWithBranchBuild as PipelineInfoConfig,
      originalPipeline: pipelineWithBranchBuild as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet,
      selectedStageData: {
        selectedStages: [{ stageIdentifier: 'S1', stageName: 'S1', message: 'test', stagesRequired: [] }],
        selectedStageItems: [{ label: 'S1', value: 'S1' }],
        allStagesSelected: false
      },
      getString
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: { spec: {} } } } } })).toBeTruthy()
    expect(has(errors, 'properties.ci.codebase.build.spec.branch')).toBeTruthy()
  })

  test('Test validateCICodebase method for pipeline with tag build', () => {
    const errors = validateCICodebase({
      pipeline: pipelineWithTagBuild as PipelineInfoConfig,
      originalPipeline: pipelineWithTagBuild as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet,
      selectedStageData: {
        selectedStages: [{ stageIdentifier: 'S1', stageName: 'S1', message: 'test', stagesRequired: [] }],
        selectedStageItems: [{ label: 'S1', value: 'S1' }],
        allStagesSelected: false
      },
      getString
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: { spec: {} } } } } })).toBeTruthy()
    expect(has(errors, 'properties.ci.codebase.build.spec.tag')).toBeTruthy()
  })

  test('Test validateCICodebase method for pipeline with PR build', () => {
    const errors = validateCICodebase({
      pipeline: pipelineWithPRBuild as PipelineInfoConfig,
      originalPipeline: pipelineWithPRBuild as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateWithRuntimeInput as PipelineInfoConfig,
      viewType: StepViewType.InputSet,
      getString
    })
    expect(isMatch(errors, { properties: { ci: { codebase: { build: { spec: {} } } } } })).toBeTruthy()
    expect(has(errors, 'properties.ci.codebase.build.spec.number')).toBeTruthy()
  })

  test('Test validateCodebase method for pipeline with deployment stage', () => {
    const errors = validatePipeline({
      pipeline: pipelineWithDeploymentStage as PipelineInfoConfig,
      originalPipeline: pipelineWithDeploymentStage as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: templateWithRuntimeTimeout as PipelineInfoConfig,
      viewType: StepViewType.DeploymentForm,
      getString
    })
    expect(isMatch(errors, { timeout: 'Invalid syntax provided' })).toBeTruthy()
  })

  test('Test requires Connector and RepoName only when all CI Codebase fields are runtime inputs', () => {
    const errors = validatePipeline({
      pipeline: {
        identifier: 'cicodebaseallfieldsruntime',
        template: {
          templateInputs: {
            properties: {
              ci: {
                codebase: {
                  connectorRef: '',
                  repoName: '',
                  build: {
                    spec: {}
                  },
                  depth: 50,
                  sslVerify: true,
                  prCloneStrategy: 'MergeCommit',
                  resources: {
                    limits: {
                      memory: '500Mi',
                      cpu: '400m'
                    }
                  }
                }
              }
            }
          }
        }
      } as any,
      originalPipeline: pipelineTemplateOriginalPipeline as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateTemplate as PipelineInfoConfig,
      resolvedPipeline: pipelineTemplateResolvedPipeline as any,
      viewType: StepViewType.DeploymentForm,
      getString
    })

    const errorKeys = Object.keys(get(errors, 'template.templateInputs.properties.ci.codebase') || {})
    expect(errorKeys).toContain('connectorRef')
    expect(errorKeys).toContain('repoName')
  })
  test('Test pipeline template requires Connector and RepoName only when all CI Codebase fields are runtime inputs', () => {
    const errors = validatePipeline({
      pipeline: {
        identifier: 'cicodebaseallfieldsruntime',
        template: {
          templateInputs: {
            properties: {
              ci: {
                codebase: {
                  connectorRef: 'githubconnector',
                  repoName: 'repo',
                  build: {
                    spec: {}
                  },
                  depth: 50,
                  sslVerify: true,
                  prCloneStrategy: 'abc',
                  resources: {
                    limits: {
                      memory: 'abc',
                      cpu: 'abc'
                    }
                  }
                }
              }
            }
          }
        }
      } as any,
      originalPipeline: pipelineTemplateOriginalPipeline as PipelineInfoConfig,
      // eslint-disable-next-line
      // @ts-ignore
      template: pipelineTemplateTemplate as PipelineInfoConfig,
      resolvedPipeline: pipelineTemplateResolvedPipeline as any,
      viewType: StepViewType.DeploymentForm,
      getString
    })

    const errorKeys = Object.keys(get(errors, 'template.templateInputs.properties.ci.codebase') || {})
    expect(errorKeys).not.toContain('connectorRef')
    expect(errorKeys).not.toContain('repoName')
    expect(errorKeys).toContain('build')
    expect(errorKeys).toContain('prCloneStrategy')
    expect(errorKeys).toContain('resources')
  })
  test('Test validatePipeline method with optional variable support', () => {
    const errors = validatePipeline({
      pipeline: pipelineWithVariables as unknown as PipelineInfoConfig,
      originalPipeline: resolvedPipelineWithVariables as PipelineInfoConfig,
      template: templatePipelineWithVariables as unknown as PipelineInfoConfig,
      resolvedPipeline: resolvedPipelineWithVariables as PipelineInfoConfig,
      viewType: StepViewType.DeploymentForm,
      getString
    })
    expect(has(errors, 'variables')).toBeFalsy()
  })

  test('Test validateStage method with optional variable support', () => {
    const errors = validateStage({
      stage: stageWithVariables as unknown as StageElementConfig,
      template: templateStageWithVariables as unknown as StageElementConfig,
      originalStage: originalStageWithVariables as StageElementConfig,
      viewType: StepViewType.InputSet,
      getString
    })
    expect(has(errors, 'variables')).toBeFalsy()
  })
})
