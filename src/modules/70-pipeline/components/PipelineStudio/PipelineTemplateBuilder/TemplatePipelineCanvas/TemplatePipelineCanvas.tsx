/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { PageError, Tag } from '@wings-software/uicore'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { PageSpinner } from '@harness/uicore'
import { parse } from 'yaml'
import { useStageBuilderCanvasState } from '@pipeline/components/PipelineStudio/StageBuilder/useStageBuilderCanvasState'
import { CanvasWidget, createEngine } from '@pipeline/components/Diagram'
import { StageBuilderModel } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderModel'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { CanvasButtons } from '@pipeline/components/CanvasButtons/CanvasButtons'
import { getScopeBasedProjectPathParams, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetYamlWithTemplateRefsResolved } from 'services/template-ng'
import { useMutateAsGet } from '@common/hooks'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import css from './TemplatePipelineCanvas.module.scss'

export function TemplatePipelineCanvas(): React.ReactElement {
  const {
    state: { pipeline, templateTypes, gitDetails },
    stagesMap
  } = usePipelineContext()
  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const { getString } = useStrings()
  const { errorMap } = useValidationErrors()
  const [resolvedPipeline, setResolvedPipeline] = React.useState<PipelineInfoConfig>()
  const scope = getScopeFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const queryParams = useParams<ProjectPathProps>()
  const dummyPipeline = useRef(pipeline)

  const model = React.useMemo(() => new StageBuilderModel(), [])
  const engine = React.useMemo(() => createEngine({}), [])
  engine.setModel(model)

  const addUpdateGraph = () => {
    model.addUpdateGraph({
      data: resolvedPipeline || { name: '', identifier: '' },
      listeners: {
        nodeListeners: {},
        linkListeners: {}
      },
      zoomLevel: model.getZoomLevel(),
      stagesMap,
      getString,
      isReadonly: true,
      splitPaneSize: canvasRef.current?.offsetHeight,
      parentPath: 'pipeline.stages',
      errorMap,
      templateTypes
    })
  }

  addUpdateGraph()

  useStageBuilderCanvasState(engine, [])

  const {
    data: pipelineResponse,
    error: pipelineError,
    refetch: refetchPipeline,
    loading: pipelineLoading
  } = useMutateAsGet(useGetYamlWithTemplateRefsResolved, {
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      pipelineIdentifier: pipeline.identifier,
      repoIdentifier: gitDetails.repoIdentifier,
      branch: gitDetails.branch,
      getDefaultFromOtherRepo: true
    },
    body: {
      originalEntityYaml: yamlStringify(dummyPipeline.current)
    }
  })

  React.useEffect(() => {
    if (pipelineResponse?.data?.mergedPipelineYaml) {
      setResolvedPipeline(parse(pipelineResponse?.data?.mergedPipelineYaml))
    }
  }, [pipelineResponse?.data?.mergedPipelineYaml])

  React.useEffect(() => {
    dummyPipeline.current = pipeline
  }, [pipeline.template?.templateRef, pipeline.template?.versionLabel])

  return (
    <div className={css.canvas} ref={canvasRef}>
      {pipelineLoading && <PageSpinner />}
      {!pipelineLoading && pipelineError && (
        <PageError
          message={get(pipelineError, 'data.error', get(pipelineError, 'data.message', pipelineError?.message))}
          onClick={() => refetchPipeline()}
        />
      )}
      <Tag className={css.readOnlyTag}>READ ONLY</Tag>
      <CanvasWidget engine={engine} />
      <CanvasButtons tooltipPosition="left" engine={engine} callback={addUpdateGraph} />
    </div>
  )
}
