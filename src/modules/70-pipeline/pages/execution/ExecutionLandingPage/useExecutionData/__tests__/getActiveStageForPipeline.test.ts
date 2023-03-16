/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getActiveStageForPipeline } from '../getActiveStageForPipeline'

import seq from './__mocks__/getActiveStageForPipeline/sequential-stages.json'
import parallel from './__mocks__/getActiveStageForPipeline/parallel-stages.json'
import matrix from './__mocks__/getActiveStageForPipeline/matrix-stages.json'
import loop from './__mocks__/getActiveStageForPipeline/loop-stages.json'
import parallelism from './__mocks__/getActiveStageForPipeline/parallelism-stages.json'

describe('getActiveStageForPipeline', () => {
  test('handles falsy/empty values', () => {
    expect(getActiveStageForPipeline()).toEqual(['', ''])
    expect(getActiveStageForPipeline({})).toEqual(['', ''])
  })

  test('sequential pipeline check', () => {
    expect(getActiveStageForPipeline(seq[0] as any)).toEqual(['S1', ''])
    expect(getActiveStageForPipeline(seq[1] as any)).toEqual(['S2', ''])
    expect(getActiveStageForPipeline(seq[2] as any)).toEqual(['S3', ''])
    expect(getActiveStageForPipeline(seq[3] as any)).toEqual(['S3', ''])
  })

  test('parallel pipeline check', () => {
    expect(getActiveStageForPipeline(parallel[0] as any)).toEqual(['S1', ''])
    expect(getActiveStageForPipeline(parallel[1] as any)).toEqual(['S2', ''])
    expect(getActiveStageForPipeline(parallel[2] as any)).toEqual(['S3', ''])
    expect(getActiveStageForPipeline(parallel[3] as any)).toEqual(['S1', ''])
  })

  test('matrix pipeline check', () => {
    expect(getActiveStageForPipeline(matrix[0] as any)).toEqual(['M1', 'S1'])
    expect(getActiveStageForPipeline(matrix[1] as any)).toEqual(['M1', 'S2'])
    expect(getActiveStageForPipeline(matrix[2] as any)).toEqual(['M1', 'S3'])
    expect(getActiveStageForPipeline(matrix[3] as any)).toEqual(['M1', 'S1'])
  })

  test('parallelism pipeline check', () => {
    expect(getActiveStageForPipeline(parallelism[0] as any)).toEqual(['M1', 'S1'])
    expect(getActiveStageForPipeline(parallelism[1] as any)).toEqual(['M1', 'S2'])
    expect(getActiveStageForPipeline(parallelism[2] as any)).toEqual(['M1', 'S3'])
    expect(getActiveStageForPipeline(parallelism[3] as any)).toEqual(['M1', 'S1'])
  })

  test('loop pipeline check', () => {
    expect(getActiveStageForPipeline(loop[0] as any)).toEqual(['M1', 'S1'])
    expect(getActiveStageForPipeline(loop[1] as any)).toEqual(['M1', 'S2'])
    expect(getActiveStageForPipeline(loop[2] as any)).toEqual(['M1', 'S3'])
    expect(getActiveStageForPipeline(loop[3] as any)).toEqual(['M1', 'S1'])
  })
})
