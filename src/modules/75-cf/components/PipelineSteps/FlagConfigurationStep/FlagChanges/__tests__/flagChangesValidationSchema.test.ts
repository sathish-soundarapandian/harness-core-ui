/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import flagChangesValidationSchema from '../flagChangesValidationSchema'
import { CFPipelineInstructionType } from '../../types'

describe('flagChangesValidationSchema', () => {
  const getStringMock = jest.fn().mockImplementation(str => str)

  test('it should throw with 6 errors when each type is specified but not valid', async () => {
    expect(() =>
      flagChangesValidationSchema(getStringMock).validateSync(
        [
          { type: CFPipelineInstructionType.ADD_RULE },
          { type: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP },
          { type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP },
          { type: CFPipelineInstructionType.SET_DEFAULT_VARIATIONS },
          { type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE }
        ],
        { abortEarly: false }
      )
    ).toThrow('6 errors occurred')
  })

  test('it should not throw when no instructions are specified', async () => {
    expect(() => flagChangesValidationSchema(getStringMock).validateSync([], { abortEarly: false })).not.toThrow()
  })
})
