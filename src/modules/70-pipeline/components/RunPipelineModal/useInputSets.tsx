/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import { parse } from 'yaml'
import { memoize } from 'lodash-es'

import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import {
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  ResponseInputSetTemplateWithReplacedExpressionsResponse
} from 'services/pipeline-ng'
import type { Failure, PipelineInfoConfig } from 'services/cd-ng'
import {
  getStageIdentifierFromStageData,
  mergeTemplateWithInputSetData,
  StageSelectionData
} from '@pipeline/utils/runPipelineUtils'

import type { InputSetValue } from '../InputSetSelector/utils'
import { clearRuntimeInput } from '../PipelineStudio/StepUtil'

const memoizedParse = memoize(parse)

export interface Pipeline {
  pipeline?: PipelineInfoConfig
}

export interface UseInputSetsProps {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  pipelineIdentifier: string
  pipelineExecutionId?: string
  branch?: string
  repoIdentifier?: string
  inputSetSelected?: InputSetValue[]
  rerunInputSetYaml?: string
  selectedStageData: StageSelectionData
}

export interface UseInputSetsReturn {
  inputSet: Pipeline
  parsedInputSetTemplateYaml: Pipeline
  inputSetYamlResponse: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
  loading: boolean
  hasInputSets: boolean
  hasRuntimeInputs: boolean
  isInputSetApplied: boolean
  modules?: string[]
  error: GetDataError<Failure | Error> | null
  refetch(): Promise<void> | undefined
}

export function useInputSets(props: UseInputSetsProps): UseInputSetsReturn {
  const {
    inputSetSelected,
    rerunInputSetYaml,
    accountId,
    orgIdentifier,
    branch,
    repoIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    selectedStageData
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
      repoIdentifier
    }
  })

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
      branch,
      repoIdentifier,
      pipelineIdentifier
    }
  })

  let isInputSetApplied = false

  function getInputSet(): Pipeline {
    if (rerunInputSetYaml) {
      return memoizedParse(rerunInputSetYaml)
    }

    if (inputSetYamlResponse?.data?.inputSetTemplateYaml) {
      const parsedRunPipelineYaml = clearRuntimeInput(
        memoizedParse(inputSetYamlResponse.data.inputSetTemplateYaml).pipeline
      )

      if (shouldFetchInputSets && inputSetData?.data?.pipelineYaml) {
        isInputSetApplied = true
        const parsedInputSets = clearRuntimeInput(memoizedParse(inputSetData.data.pipelineYaml).pipeline)

        return mergeTemplateWithInputSetData({ pipeline: parsedRunPipelineYaml }, { pipeline: parsedInputSets })
      }

      return { pipeline: parsedRunPipelineYaml }
    }

    return {}
  }

  return {
    inputSet: getInputSet(),
    loading: loadingTemplate || loadingInputSetsData,
    error: templateError || inputSetError,
    parsedInputSetTemplateYaml: inputSetYamlResponse?.data?.inputSetTemplateYaml
      ? memoizedParse(inputSetYamlResponse.data.inputSetTemplateYaml)
      : {},
    hasRuntimeInputs: !!inputSetYamlResponse?.data?.inputSetTemplateYaml,
    hasInputSets: !!inputSetYamlResponse?.data?.hasInputSets,
    isInputSetApplied,
    inputSetYamlResponse,
    refetch
  }
}
