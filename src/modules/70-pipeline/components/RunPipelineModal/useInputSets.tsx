/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import type { GetDataError } from 'restful-react'
import { get, isEmpty, isUndefined, memoize, remove } from 'lodash-es'

import { parse, yamlStringify } from '@common/utils/YamlHelperMethods'
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
  currentYAML?: PipelineInfoConfig
}

export interface UseInputSetsReturn {
  inputSet: Pipeline
  inputSetTemplate: Pipeline
  inputSetYamlResponse: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
  loading: boolean
  hasInputSets: boolean
  hasRuntimeInputs: boolean
  modules?: string[]
  error: GetDataError<Failure | Error> | null
  refetch(): Promise<void> | undefined
  invalidInputSetReferences: string[]
  onReconcile: (identifier: string) => void
  shouldValidateForm?: boolean
  setShouldValidateForm?: (validate: boolean) => void
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
    executionInputSetTemplateYaml,
    executionView,
    selectedStageData,
    resolvedPipeline,
    executionIdentifier,
    setSelectedInputSets,
    currentYAML
  } = props

  // inputSetTemplate is the actual template used for reference
  const [inputSetTemplate, setInputSetTemplate] = useState({} as Pipeline)
  // isTemplateMergeComplete state is used to indicate successful merging of template w/wo input sets
  const [isTemplateMergeComplete, setIsTemplateMergeComplete] = useState(true)
  // hasRuntimeInputs indicates if there are any runtime. This can be removed and inputSetTemplate can be used for reference
  const [hasRuntimeInputs, setHasRuntimeInputs] = useState(false)
  // shouldValidateForm is used to validate the form when the input set is applied
  const [shouldValidateForm, setShouldValidateForm] = useState(false)

  // inputSet is the final return data of the hook
  const [inputSet, setInputSet] = useState({ pipeline: {} } as Pipeline)

  const [invalidInputSetReferences, setInvalidInputSetReferences] = useState<Array<string>>([])

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
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    lazy: executionInputSetTemplateYaml || executionView || !selectedStageData.selectedStageItems.length
  })

  const isRuntimeInputsPresent =
    !!inputSetYamlResponse && !loadingTemplate && !!inputSetYamlResponse?.data?.inputSetTemplateYaml

  // merge should be called on re-run / input set selection / selectiveStageExecution with atleast one stage with runtime inputs
  const shouldMergeTemplateWithInputSetYAML =
    rerunInputSetYaml ||
    (Array.isArray(inputSetSelected) && inputSetSelected.length > 0) ||
    (!isUndefined(currentYAML) && isRuntimeInputsPresent)

  // Reason for sending repoIdentifier and pipelineRepoID both as same values
  // input sets are only saved in same repo and same branch that of pipeline's or default branch of other repos
  // getDefaultFromOtherRepo: true takes care of fetching input sets from other repo, default branches

  const getLastYamlToMerge = () => {
    if (!inputSetSelected?.length) {
      if (rerunInputSetYaml) {
        return rerunInputSetYaml
      } else if (!isUndefined(currentYAML)) {
        return yamlStringify({ pipeline: currentYAML })
      } else {
        return undefined
      }
    }
  }

  const {
    data: inputSetData,
    loading: loadingInputSetsData,
    error: inputSetError
  } = useMutateAsGet(useGetMergeInputSetFromPipelineTemplateWithListInput, {
    lazy: !shouldMergeTemplateWithInputSetYAML,
    body: {
      inputSetReferences: inputSetSelected?.map(row => row.value),
      stageIdentifiers: getStageIdentifierFromStageData(selectedStageData),
      lastYamlToMerge: getLastYamlToMerge()
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

  useEffect(() => {
    if (!loadingTemplate && !loadingInputSetsData) {
      let newInputSetTemplate = {} as Pipeline

      if (inputSetYamlResponse?.data?.inputSetTemplateYaml) {
        const parsedRunPipelineYaml = memoizedParse<Pipeline>(inputSetYamlResponse.data.inputSetTemplateYaml).pipeline
        newInputSetTemplate = { pipeline: parsedRunPipelineYaml }
      }

      setInputSetTemplate(newInputSetTemplate)

      if (executionInputSetTemplateYaml) {
        newInputSetTemplate = { pipeline: memoizedParse<Pipeline>(executionInputSetTemplateYaml).pipeline }
        setInputSetTemplate(newInputSetTemplate)
      }

      const doRuntimeValuesExist = !isEmpty(newInputSetTemplate)
      setHasRuntimeInputs(doRuntimeValuesExist)
      // this state is set to true only if there exists runtimeInput
      setIsTemplateMergeComplete(!doRuntimeValuesExist)
    }
  }, [
    loadingTemplate,
    loadingInputSetsData,
    inputSetYamlResponse?.data?.inputSetTemplateYaml,
    inputSetData?.data?.pipelineYaml,
    executionInputSetTemplateYaml
  ])

  useEffect(() => {
    if (inputSetData?.data?.errorResponse) {
      setSelectedInputSets([])
      setIsTemplateMergeComplete(true)
    }
    setInvalidInputSetReferences(get(inputSetData?.data, 'inputSetErrorWrapper.invalidInputSetReferences', []))
  }, [inputSetData?.data, inputSetData?.data?.errorResponse])

  const onReconcile = (identifier: string): void => {
    remove(invalidInputSetReferences, id => id === identifier)
    setInvalidInputSetReferences(invalidInputSetReferences)
  }

  useEffect(() => {
    if (isTemplateMergeComplete) {
      return
    }

    // This merges the template and sets the final return data in state
    if (rerunInputSetYaml) {
      //  Merge call takes care of merging rerunYAML with the latest updated pipeline

      setInputSet(clearRuntimeInput(memoizedParse<Pipeline>(inputSetData?.data?.pipelineYaml as any)))
    } else if (hasRuntimeInputs) {
      if (shouldMergeTemplateWithInputSetYAML && inputSetData?.data?.pipelineYaml) {
        // This is to take care of selectiveStage executions to retain values on switching stages

        setInputSet(clearRuntimeInput(memoizedParse<Pipeline>(inputSetData?.data?.pipelineYaml as any)))
        setShouldValidateForm(true)
      } else {
        // In Normal flow we do not need merge call the template is the source of truth for us

        setInputSet(clearRuntimeInput(inputSetTemplate))
      }
    }
    setIsTemplateMergeComplete(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldMergeTemplateWithInputSetYAML,
    resolvedPipeline,
    executionIdentifier,
    inputSetTemplate,
    rerunInputSetYaml,
    hasRuntimeInputs,
    isTemplateMergeComplete,
    inputSetData
  ])

  return {
    inputSet,
    inputSetTemplate,
    loading: loadingTemplate || loadingInputSetsData || !isTemplateMergeComplete,
    error: templateError || inputSetError,
    hasRuntimeInputs,
    hasInputSets: !!inputSetYamlResponse?.data?.hasInputSets,
    inputSetYamlResponse,
    refetch,
    invalidInputSetReferences,
    onReconcile,
    shouldValidateForm,
    setShouldValidateForm
  }
}
