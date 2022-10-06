/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState, useCallback } from 'react'
import { isNil } from 'lodash-es'
import debounce from 'p-debounce'

import { validateJSONWithSchema } from '@common/utils/YamlUtils'
import { useDeepCompareEffect } from '@common/hooks'
import type { PipelineInfoConfig, ResponseJsonNode } from 'services/pipeline-ng'

import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'

export function useValidationErrors(): { errorMap: Map<string, string[]> } {
  const { pipelineSchema } = usePipelineSchema()
  const {
    state: { pipeline: originalPipeline, schemaErrors },
    setSchemaErrorView
  } = usePipelineContext()

  const [errorMap, setErrorMap] = useState<Map<string, string[]>>(new Map())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateErrors = useCallback(
    debounce(async (_originalPipeline: PipelineInfoConfig, _pipelineSchema: ResponseJsonNode | null): Promise<void> => {
      if (!isNil(_pipelineSchema) && _pipelineSchema.data) {
        const error = await validateJSONWithSchema({ pipeline: _originalPipeline }, _pipelineSchema.data)
        // If you resolved all existing errors then clear the schema error flag
        if (error.size === 0) {
          setSchemaErrorView(false)
        }
        setErrorMap(error)
      }
    }, 300),
    []
  )

  useDeepCompareEffect(() => {
    if (schemaErrors) {
      validateErrors(originalPipeline, pipelineSchema)
    } else {
      setErrorMap(new Map())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPipeline, pipelineSchema, schemaErrors])

  return { errorMap }
}
