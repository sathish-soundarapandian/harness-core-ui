/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import produce from 'immer'
import type { AccountPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type {
  PipelineConfig,
  PipelineInfoConfig,
  PipelineStageConfig,
  StageElementWrapperConfig
} from 'services/pipeline-ng'
import { getChildPipelinesMetadata, getPromisesForChildPipeline } from '@pipeline/components/PipelineStudio/StepUtil'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { StageType } from '@pipeline/utils/stageHelpers'

export interface UseGetResolvedChildPipelineReturn {
  loadingResolvedChildPipeline: boolean
  resolvedMergedPipeline?: PipelineInfoConfig
}

const getChildPipelineKey = (data: StageElementWrapperConfig): string => {
  const pipelineStageSpec = data?.stage?.spec as PipelineStageConfig
  const childPipelineId = pipelineStageSpec?.pipeline
  const childPipelineProject = pipelineStageSpec?.project
  const childPipelineOrg = pipelineStageSpec?.org
  return `${childPipelineId}-${childPipelineProject}-${childPipelineOrg}`
}

export function useGetResolvedChildPipeline(
  params: AccountPathProps & GitQueryParams,
  pipeline?: PipelineInfoConfig,
  resolvedPipeline?: PipelineInfoConfig
): UseGetResolvedChildPipelineReturn {
  const { accountId, repoIdentifier, branch, connectorRef } = params
  const [resolvedMergedPipeline, setResolvedMergedPipeline] = useState<PipelineInfoConfig | undefined>()
  const [resolvedChildPipelineMap, setResolvedChildPipelineMap] = useState<Map<string, PipelineInfoConfig>>(
    new Map<string, PipelineInfoConfig>()
  )
  const [loadingResolvedChildPipeline, setLoadingResolvedChildPipeline] = useState<boolean>(false)
  const childPipelinesMetaData = React.useMemo(() => getChildPipelinesMetadata(pipeline), [pipeline])

  const getResolvedTemplatesPipelineYamlForChildPipelines = React.useCallback(async (): Promise<void> => {
    setLoadingResolvedChildPipeline(true)
    const promises = getPromisesForChildPipeline(
      { accountId, repoIdentifier, branch, connectorRef },
      childPipelinesMetaData
    )
    return await Promise.all(promises)
      .then(responses => {
        const resolvedChildPipelines = new Map<string, PipelineInfoConfig>()
        responses.forEach(response => {
          if (response?.data?.resolvedTemplatesPipelineYaml) {
            const resolvedChildPipeline = yamlParse<PipelineConfig>(
              response.data.resolvedTemplatesPipelineYaml
            )?.pipeline
            if (resolvedChildPipeline) {
              // Child pipeline identifier can be same for different project / org.
              const key = `${resolvedChildPipeline.identifier}-${resolvedChildPipeline.projectIdentifier}-${resolvedChildPipeline.orgIdentifier}`
              resolvedChildPipelines.set(key, resolvedChildPipeline)
            }
          }
        })
        if (!isEmpty(resolvedChildPipelines)) {
          setResolvedChildPipelineMap(resolvedChildPipelines)
        }
      })
      .finally(() => {
        setLoadingResolvedChildPipeline(false)
      })
  }, [accountId, branch, childPipelinesMetaData, connectorRef, repoIdentifier])

  useEffect(() => {
    if (!isEmpty(childPipelinesMetaData)) getResolvedTemplatesPipelineYamlForChildPipelines()
  }, [childPipelinesMetaData, getResolvedTemplatesPipelineYamlForChildPipelines])

  useEffect(() => {
    setResolvedMergedPipeline(resolvedPipeline)
  }, [resolvedPipeline])

  useEffect(() => {
    if (!isEmpty(resolvedChildPipelineMap)) {
      setResolvedMergedPipeline(prevResolvedMergedPipeline => {
        return produce(prevResolvedMergedPipeline, (draft: PipelineInfoConfig) => {
          draft?.stages?.forEach(item => {
            if (item.stage) {
              const childPipelineKey = getChildPipelineKey(item)
              if (item.stage.type === StageType.PIPELINE && childPipelineKey) {
                ;(item.stage.spec as PipelineStageConfig).inputs = resolvedChildPipelineMap.get(childPipelineKey)
              }
            } else if (item.parallel) {
              item.parallel.forEach(node => {
                const childPipelineKey = getChildPipelineKey(node)
                if (node.stage?.type === StageType.PIPELINE && childPipelineKey) {
                  ;(node.stage.spec as PipelineStageConfig).inputs = resolvedChildPipelineMap.get(childPipelineKey)
                }
              })
            }
          })
        })
      })
    }
  }, [resolvedChildPipelineMap])

  return {
    loadingResolvedChildPipeline,
    resolvedMergedPipeline
  }
}
