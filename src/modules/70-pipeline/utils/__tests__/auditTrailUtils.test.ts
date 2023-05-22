/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AuditEventData } from 'services/audit'
import { getPipelineExecutionEventAdditionalDetails } from '../auditTrailUtils'

const pipelineExecutionEventDataMap = {
  'pipeline.pipelineExecutionEventData.accountIdentifier': 'dummyAccount',
  'pipeline.pipelineExecutionEventData.orgIdentifier': 'dummyOrg',
  'pipeline.pipelineExecutionEventData.projectIdentifier': 'dummyProject',
  'pipeline.pipelineExecutionEventData.pipelineIdentifier': 'dummyPipeline'
}

const pipelineExecutionEventData = {
  accountIdentifier: 'dummyAccount',
  orgIdentifier: 'dummyOrg',
  projectIdentifier: 'dummyProject',
  pipelineIdentifier: 'dummyPipeline',
  stageIdentifier: null,
  stageType: ''
}

describe('audit trail for pipeline execution resource type test', () => {
  test('Test getPipelineExecutionEventAdditionalDetails method', () => {
    const pipelineExecutionEventAdditionalDetailMap = getPipelineExecutionEventAdditionalDetails(
      pipelineExecutionEventData as unknown as AuditEventData
    )
    expect(Object.keys(pipelineExecutionEventAdditionalDetailMap).length).toBe(4)
    expect(pipelineExecutionEventAdditionalDetailMap).toEqual(pipelineExecutionEventDataMap)
  })

  test('Test getPipelineExecutionEventAdditionalDetails method with Stage Id & Type', () => {
    const pipelineExecutionEventAdditionalDetailMap = getPipelineExecutionEventAdditionalDetails({
      ...pipelineExecutionEventData,
      stageIdentifier: 'dummyStage',
      stageType: 'cd'
    } as unknown as AuditEventData)
    expect(Object.keys(pipelineExecutionEventAdditionalDetailMap).length).toBe(6)
    expect(pipelineExecutionEventAdditionalDetailMap).toEqual({
      ...pipelineExecutionEventDataMap,
      'pipeline.pipelineExecutionEventData.stageIdentifier': 'dummyStage',
      'pipeline.pipelineExecutionEventData.stageType': 'cd'
    })
  })

  test('Test getPipelineExecutionEventAdditionalDetails method with empty auditEvent data', () => {
    const pipelineExecutionEventAdditionalDetailMap = getPipelineExecutionEventAdditionalDetails({} as AuditEventData)
    expect(Object.keys(pipelineExecutionEventAdditionalDetailMap).length).toBe(0)
    expect(pipelineExecutionEventAdditionalDetailMap).toEqual({})
  })
})
