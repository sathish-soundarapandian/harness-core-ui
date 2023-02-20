/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getActiveStepForStage } from '../getActiveStepForStage'

import seq from './__mocks__/getActiveStepForStage/sequential-steps.json'
import par from './__mocks__/getActiveStepForStage/parallel-steps.json'
import sgp from './__mocks__/getActiveStepForStage/step-group-steps.json'
import sta from './__mocks__/getActiveStepForStage/strategy-steps.json'
import sei from './__mocks__/getActiveStepForStage/stage-execution-input.json'

describe('getActiveStepForStage tests', () => {
  test('handles falsy/empty values', () => {
    expect(getActiveStepForStage()).toBe('')
    expect(getActiveStepForStage({})).toBe('')
  })

  test('sequential steps check', () => {
    expect(getActiveStepForStage(...(seq[0] as any[]))).toBe('')
    expect(getActiveStepForStage(...(seq[1] as any[]))).toBe('S1')
    expect(getActiveStepForStage(...(seq[2] as any[]))).toBe('S2')
    expect(getActiveStepForStage(...(seq[3] as any[]))).toBe('S3')
    expect(getActiveStepForStage(...(seq[4] as any[]))).toBe('S3')
  })

  test('parallel steps check', () => {
    expect(getActiveStepForStage(...(par[0] as any[]))).toBe('')
    expect(getActiveStepForStage(...(par[1] as any[]))).toBe('S1')
    expect(getActiveStepForStage(...(par[2] as any[]))).toBe('S2')
    expect(getActiveStepForStage(...(par[3] as any[]))).toBe('S3')
    expect(getActiveStepForStage(...(par[4] as any[]))).toBe('S1')
  })

  test('step group steps check', () => {
    expect(getActiveStepForStage(...(sgp[0] as any[]))).toBe('')
    expect(getActiveStepForStage(...(sgp[1] as any[]))).toBe('S1')
    expect(getActiveStepForStage(...(sgp[2] as any[]))).toBe('S2')
    expect(getActiveStepForStage(...(sgp[3] as any[]))).toBe('S3')
    expect(getActiveStepForStage(...(sgp[4] as any[]))).toBe('S3')
  })

  test('matrix/loop/parallelism steps check', () => {
    expect(getActiveStepForStage(...(sta[0] as any[]))).toBe('')
    expect(getActiveStepForStage(...(sta[1] as any[]))).toBe('S1')
    expect(getActiveStepForStage(...(sta[2] as any[]))).toBe('S2')
    expect(getActiveStepForStage(...(sta[3] as any[]))).toBe('S3')
    expect(getActiveStepForStage(...(sta[4] as any[]))).toBe('S1')
  })

  test('stage input waiting', () => {
    expect(getActiveStepForStage(sei as any, 'InputWaiting')).toBe('N0')
  })
})
