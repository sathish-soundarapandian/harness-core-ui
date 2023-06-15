/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StageElementConfig } from 'services/cd-ng'
import {
  getAllStepPaletteModuleInfos,
  getStepPaletteModuleInfosFromStage,
  isApprovalStep,
  isHarnessApproval,
  isJiraApproval,
  isServiceNowApproval,
  getStepDataFromValues
} from '../stepUtils'

describe('Test stepUtils', () => {
  test('Test isHarnessApproval method', () => {
    expect(isHarnessApproval(StepType.HarnessApproval)).toBe(true)
    expect(isHarnessApproval(StepType.Barrier)).toBe(false)
  })
  test('Test isJiraApproval method', () => {
    expect(isJiraApproval(StepType.JiraApproval)).toBe(true)
    expect(isJiraApproval(StepType.Barrier)).toBe(false)
  })
  test('Test isServiceNowApproval method', () => {
    expect(isServiceNowApproval(StepType.ServiceNowApproval)).toBe(true)
    expect(isServiceNowApproval(StepType.Barrier)).toBe(false)
  })
  test('Test isApprovalStep method', () => {
    expect(isApprovalStep(StepType.JiraApproval)).toBe(true)
    expect(isApprovalStep(StepType.HarnessApproval)).toBe(true)
    expect(isApprovalStep(StepType.ServiceNowApproval)).toBe(true)
    expect(isApprovalStep(StepType.Barrier)).toBe(false)
  })
  test('Test getAllStepPaletteModuleInfos method', () => {
    expect(getAllStepPaletteModuleInfos()).toStrictEqual([
      {
        module: 'cd',
        shouldShowCommonSteps: false
      },
      {
        module: 'ci',
        shouldShowCommonSteps: true
      },
      {
        module: 'cv',
        shouldShowCommonSteps: false
      }
    ])
  })
  test('Test getStepDataFromValues method', () => {
    expect(
      getStepDataFromValues(
        {
          type: 'Security'
        },
        {
          identifier: 'testId',
          name: 'testName',
          type: 'Unknown'
        }
      )
    ).toStrictEqual({
      identifier: 'testId',
      name: 'testName',
      type: 'Unknown'
    })

    expect(
      getStepDataFromValues(
        {
          type: 'Security',
          description: 'testDescription',
          failureStrategies: [
            {
              onFailure: {
                action: {
                  type: 'Ignore'
                },
                errors: []
              }
            }
          ]
        },
        {
          identifier: 'testId',
          name: 'testName',
          type: 'Unknown'
        }
      )
    ).toStrictEqual({
      identifier: 'testId',
      name: 'testName',
      description: 'testDescription',
      type: 'Unknown',
      failureStrategies: [
        {
          onFailure: {
            action: {
              type: 'Ignore'
            },
            errors: []
          }
        }
      ]
    })
  })
  test('Test getStepPaletteModuleInfosFromStage method', () => {
    const testStage: StageElementConfig = {
      identifier: 'teststage',
      name: 'test'
    }

    expect(getStepPaletteModuleInfosFromStage(StageType.BUILD, testStage, 'Kubernetes', [])[0].module).toBe('ci')
    expect(getStepPaletteModuleInfosFromStage(StageType.SECURITY, testStage, 'Kubernetes', [])[0].module).toBe('sto')
    expect(getStepPaletteModuleInfosFromStage(StageType.FEATURE, testStage, 'Kubernetes', [])[0].module).toBe('pms')
    expect(getStepPaletteModuleInfosFromStage(undefined, testStage, 'Kubernetes', []).length).toBe(2)
  })

  test('category Plugin should be included in return value when isContainerStepGroup argument is passed TRUE to getStepPaletteModuleInfosFromStage', () => {
    const testStage: StageElementConfig = {
      identifier: 'teststage',
      name: 'test'
    }

    const stepPaletteAPIPayload = getStepPaletteModuleInfosFromStage(
      StageType.DEPLOY,
      testStage,
      'Kubernetes',
      [],
      true
    )

    expect(stepPaletteAPIPayload).toHaveLength(2)

    expect(stepPaletteAPIPayload[0].module).toBe('ci')
    expect(stepPaletteAPIPayload[0].category).toBe('Plugin')
    expect(stepPaletteAPIPayload[0].shouldShowCommonSteps).toBe(false)

    expect(stepPaletteAPIPayload[1].module).toBe('cd')
    expect(stepPaletteAPIPayload[1].category).toBe('Plugin')
    expect(stepPaletteAPIPayload[1].shouldShowCommonSteps).toBe(false)
  })
})
