/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import type { GetDataError } from 'restful-react'
import { defaultTo, get, isUndefined, memoize, remove } from 'lodash-es'

import { parse } from '@common/utils/YamlHelperMethods'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import {
  Failure,
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  ResponseInputSetTemplateWithReplacedExpressionsResponse
} from 'services/pipeline-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import {
  clearRuntimeInput,
  getStageIdentifierFromStageData,
  mergeTemplateWithInputSetData,
  StageSelectionData
} from '@pipeline/utils/runPipelineUtils'

import type { Pipeline } from '@pipeline/utils/types'
import type { InputSetValue } from '../InputSetSelector/utils'

const memoizedParse = memoize(parse)

export interface UseInputSetsProps {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  pipelineIdentifier: string
  branch?: string
  repoIdentifier?: string
  connectorRef?: string
  inputSetSelected?: InputSetValue[]
  rerunInputSetYaml?: string
  selectedStageData: StageSelectionData
  resolvedPipeline?: PipelineInfoConfig
  executionInputSetTemplateYaml: string
  executionView?: boolean
  executionIdentifier?: string
  setSelectedInputSets: Dispatch<SetStateAction<InputSetValue[] | undefined>>
}

export interface UseInputSetsReturn {
  inputSet: Pipeline
  inputSetTemplate: Pipeline
  inputSetYamlResponse: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
  loading: boolean
  hasInputSets: boolean
  hasRuntimeInputs: boolean
  canApplyInputSet: boolean
  modules?: string[]
  error: GetDataError<Failure | Error> | null
  refetch(): Promise<void> | undefined
  invalidInputSetReferences: string[]
  onReconcile: (identifier: string) => void
}

export function useInputSets(props: UseInputSetsProps): UseInputSetsReturn {
  const {
    inputSetSelected,
    rerunInputSetYaml,
    accountId,
    orgIdentifier,
    branch,
    repoIdentifier,
    connectorRef,
    projectIdentifier,
    pipelineIdentifier,
    selectedStageData,
    resolvedPipeline,
    executionInputSetTemplateYaml,
    executionView,
    executionIdentifier,
    setSelectedInputSets
  } = props

  const shouldFetchInputSets = !rerunInputSetYaml && Array.isArray(inputSetSelected) && inputSetSelected.length > 0

  const {
    data: inputSetYamlResponse,
    loading: loadingTemplate,
    error: templateError,
    refetch
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    body: {
      stageIdentifiers: getStageIdentifierFromStageData(selectedStageData)
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      branch,
      repoIdentifier,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    },
    lazy: executionInputSetTemplateYaml || executionView
  })

  // Reason for sending repoIdentifier and pipelineRepoID both as same values
  // input sets are only saved in same repo and same branch that of pipeline's or default branch of other repos
  // getDefaultFromOtherRepo: true takes care of fetching input sets from other repo, default branches
  const {
    data: inputSetData,
    loading: loadingInputSetsData,
    error: inputSetError
  } = useMutateAsGet(useGetMergeInputSetFromPipelineTemplateWithListInput, {
    lazy: !shouldFetchInputSets,
    body: {
      inputSetReferences: inputSetSelected?.map(row => row.value),
      stageIdentifiers: getStageIdentifierFromStageData(selectedStageData)
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch,
      repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoIdentifier
    }
  })

  const [canApplyInputSet, setCanApplyInputSet] = useState(false)
  const [invalidInputSetReferences, setInvalidInputSetReferences] = useState<Array<string>>([])
  const hasRuntimeInputs = !!inputSetYamlResponse?.data?.inputSetTemplateYaml

  useEffect(() => {
    if (inputSetData?.data?.errorResponse) {
      setSelectedInputSets([])
    }
    setInvalidInputSetReferences(get(inputSetData?.data, 'inputSetErrorWrapper.invalidInputSetReferences', []))
  }, [inputSetData?.data, inputSetData?.data?.errorResponse])

  const onReconcile = (identifier: string): void => {
    remove(invalidInputSetReferences, id => id === identifier)
    setInvalidInputSetReferences(invalidInputSetReferences)
  }

  const inputSet = useMemo((): Pipeline => {
    const shouldUseDefaultValues = isUndefined(executionIdentifier)
    const parsedRunPipelineYaml = clearRuntimeInput(
      memoizedParse<Pipeline>(inputSetYamlResponse?.data?.inputSetTemplateYaml || 'pipeline: {}').pipeline
    ) as PipelineInfoConfig

    if (rerunInputSetYaml) {
      const templatePipeline = executionView
        ? clearRuntimeInput(memoizedParse<Pipeline>(executionInputSetTemplateYaml))
        : { pipeline: parsedRunPipelineYaml }
      const inputSetPortion = memoizedParse<Pipeline>(rerunInputSetYaml)

      return mergeTemplateWithInputSetData({
        templatePipeline,
        inputSetPortion,
        allValues: { pipeline: defaultTo(resolvedPipeline, {} as PipelineInfoConfig) },
        shouldUseDefaultValues
      })
    }

    if (hasRuntimeInputs) {
      if (shouldFetchInputSets && inputSetData?.data?.pipelineYaml) {
        setCanApplyInputSet(true)
        const parsedInputSets = clearRuntimeInput(memoizedParse<Pipeline>(inputSetData.data.pipelineYaml).pipeline)

        return mergeTemplateWithInputSetData({
          templatePipeline: { pipeline: parsedRunPipelineYaml },
          inputSetPortion: { pipeline: parsedInputSets },
          allValues: { pipeline: defaultTo(resolvedPipeline, {} as PipelineInfoConfig) },
          shouldUseDefaultValues
        })
      }

      return mergeTemplateWithInputSetData({
        templatePipeline: { pipeline: parsedRunPipelineYaml },
        inputSetPortion: { pipeline: parsedRunPipelineYaml },
        allValues: { pipeline: defaultTo(resolvedPipeline, {} as PipelineInfoConfig) },
        shouldUseDefaultValues
      })
    }

    return { pipeline: {} as PipelineInfoConfig }
  }, [
    inputSetData?.data?.pipelineYaml,
    inputSetYamlResponse?.data?.inputSetTemplateYaml,
    rerunInputSetYaml,
    shouldFetchInputSets,
    resolvedPipeline,
    executionIdentifier,
    hasRuntimeInputs,
    executionInputSetTemplateYaml,
    executionView
  ])

  const inputSetTemplate = useMemo((): Pipeline => {
    if (executionView) {
      return memoizedParse(executionInputSetTemplateYaml)
    }

    if (inputSetYamlResponse?.data?.inputSetTemplateYaml) {
      const parsedRunPipelineYaml = memoizedParse<Pipeline>(inputSetYamlResponse.data.inputSetTemplateYaml).pipeline

      return { pipeline: parsedRunPipelineYaml }
    }

    return {} as Pipeline
  }, [inputSetYamlResponse?.data?.inputSetTemplateYaml, executionInputSetTemplateYaml, executionView])

  return {
    inputSet,
    inputSetTemplate,
    loading: loadingTemplate || loadingInputSetsData,
    error: templateError || inputSetError,
    hasRuntimeInputs,
    hasInputSets: !!inputSetYamlResponse?.data?.hasInputSets,
    canApplyInputSet,
    inputSetYamlResponse,
    refetch,
    invalidInputSetReferences,
    onReconcile
  }
}
