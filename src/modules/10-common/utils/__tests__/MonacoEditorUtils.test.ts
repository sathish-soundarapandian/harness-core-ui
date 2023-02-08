/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { setupMonacoEnvironment } from '../MonacoEditorUtils'
import WorkerMocked from './mocks/MonacoEditorMocks'

const WorkerOriginal = window.Worker

beforeAll(() => {
  // eslint-disable-next-line
  // @ts-ignore
  window.Worker = WorkerMocked
})

afterAll(() => {
  window.Worker = WorkerOriginal
})

describe('MonacoEditor utils', () => {
  test('should set up MonacoEnvironment in global/window', () => {
    setupMonacoEnvironment()
    expect(window.MonacoEnvironment).not.toBe(undefined)
    expect(window.MonacoEnvironment.getWorker).not.toBe(undefined)
    const yamlWorker = window.MonacoEnvironment.getWorker('dummyWorkerId', 'yaml')
    expect(yamlWorker).not.toBe(undefined)
    const editorWorker = window.MonacoEnvironment.getWorker('dummyWorkerId')
    expect(editorWorker).not.toBe(undefined)
  })
})
