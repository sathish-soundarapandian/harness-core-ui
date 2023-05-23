/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { HarnessDocTooltip, Heading, Layout, MultiSelectDropDown, SelectOption } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { ALL_STAGE_VALUE, clearRuntimeInput, getAllStageItem } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import {
  ResponseMergeInputSetResponse,
  StageExecutionResponse,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  useGetStagesExecutionList
} from 'services/pipeline-ng'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet } from '@common/hooks'
import { memoizedParse, yamlStringify } from '@common/utils/YamlHelperMethods'

import css from './StageSelection.module.scss'

const StageSelection: React.FC<{ formikProps: any }> = ({ formikProps }) => {
  const { getString } = useStrings()

  const [callMerge, setCallMerge] = React.useState(false)
  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier } = useParams<PipelinePathProps>()
  const { data: stageExecutionData } = useGetStagesExecutionList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier
    }
  })

  const executionStageList =
    stageExecutionData?.data?.map((stage: StageExecutionResponse) => {
      return {
        label: defaultTo(stage?.stageIdentifier, ''),
        value: defaultTo(stage?.stageIdentifier, '')
      } as SelectOption
    }) || []

  executionStageList.unshift(getAllStageItem(getString))

  const [selectedStages, setStage] = React.useState<SelectOption[]>([])

  const [inputData, setInputSetData] = React.useState<ResponseMergeInputSetResponse>({})

  const [allStagesSelected, setAllStagesSelect] = React.useState<boolean>(false)
  const allowStageExecutions = formikProps.values?.resolvedPipeline?.allowStageExecutions

  const {
    data: inputSetData,
    loading: loadingInputSetsData,
    refetch: refetchInputSetData
  } = useMutateAsGet(useGetMergeInputSetFromPipelineTemplateWithListInput, {
    body: {
      inputSetReferences: [],
      stageIdentifiers: selectedStages.map((stage: SelectOption) => stage.value),
      lastYamlToMerge: yamlStringify(formikProps.values.inputSetTemplateYamlObj)
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,

      getDefaultFromOtherRepo: true
    },
    lazy: true
  })

  // calling merge input set data
  useEffect(() => {
    if (selectedStages.length && formikProps.values?.stagesToExecute && !loadingInputSetsData && callMerge) {
      refetchInputSetData()
      setCallMerge(false)
    }
  }, [selectedStages, formikProps.values?.stagesToExecute, callMerge, loadingInputSetsData, refetchInputSetData])

  // set input set pipelineyaml
  useEffect(() => {
    if (inputSetData?.data?.pipelineYaml) {
      setInputSetData(inputSetData)
    }
  }, [inputSetData?.data?.pipelineYaml, inputSetData])

  useEffect(() => {
    if (
      (Array.isArray(formikProps.values?.stagesToExecute) && !formikProps.values?.stagesToExecute.length) ||
      !formikProps.values?.stagesToExecute ||
      (formikProps.values?.originalPipeline && !allowStageExecutions)
    ) {
      setAllStagesSelect(true)
    }
  }, [formikProps.values?.stagesToExecute, allowStageExecutions, formikProps.values?.originalPipeline])

  /*
     if allowstageexecs is true and selective stagesToExecute is not empty
     then set SelectedStages values, so selective stage comes with predefined
     list of stages
  
  */
  useEffect(() => {
    const stagesArr: SelectOption[] = []
    if (allowStageExecutions) {
      if (Array.isArray(formikProps.values?.stagesToExecute) && formikProps.values?.stagesToExecute.length) {
        if (stageExecutionData?.data && stageExecutionData?.data?.length) {
          for (const stage of stageExecutionData.data) {
            if (formikProps.values?.stagesToExecute?.includes(stage.stageIdentifier)) {
              stagesArr.push({ label: stage.stageIdentifier || '', value: stage.stageIdentifier || '' })
            }
          }
        }
      }
    } else {
      stagesArr.push(getAllStageItem(getString))
    }
    setStage(stagesArr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageExecutionData?.data])

  useEffect(() => {
    if (inputData?.data?.pipelineYaml) {
      const pipeObj = clearRuntimeInput(memoizedParse<any>(inputData?.data?.pipelineYaml as any)?.pipeline)
      formikProps.setFieldValue('pipeline', pipeObj)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputData?.data?.pipelineYaml])

  /* if allowstage execs is false then stagesToexecute should be set to [] */

  useEffect(() => {
    if (formikProps.values?.originalPipeline && !allowStageExecutions && !stageExecutionData?.data?.length) {
      formikProps.setFieldValue('stagesToExecute', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikProps.values?.originalPipeline, allowStageExecutions, stageExecutionData?.data])

  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Heading level={5} font={{ variation: FontVariation.H5 }} data-tooltip-id="select-stages-toexecute">
          {getString('triggers.selectPipelineStages')}
        </Heading>
        <HarnessDocTooltip tooltipId="select-stages-toexecute" useStandAlone={true} />
      </Layout.Horizontal>
      <MultiSelectDropDown
        hideItemCount={allStagesSelected}
        disabled={!allowStageExecutions}
        buttonTestId={'stage-select'}
        onChange={(items: SelectOption[]) => {
          const allStagesChecked = items?.length === formikProps.values?.resolvedPipeline?.stages?.length
          const hasAllStagesChecked = items.find(item => item.value === ALL_STAGE_VALUE)

          // const hasAllStagesChecked =
          //   items.find(item => item.value === getAllStageItem(getString).value) || allStagesChecked
          const hasOnlyAllStagesUnChecked =
            allStagesChecked && !items.find(item => item.value === getAllStageItem(getString).value)

          if (hasOnlyAllStagesUnChecked || items?.length === 0 || (!allStagesSelected && hasAllStagesChecked)) {
            setStage([])
            setAllStagesSelect(true)
          } else {
            const newItems = items.filter((option: SelectOption) => {
              return option.value !== ALL_STAGE_VALUE
            })
            setAllStagesSelect(false)
            setStage(newItems)
          }

          setCallMerge(true)
        }}
        onPopoverClose={() => {
          const hasAllStagesChecked = selectedStages.find(
            (item: SelectOption) => item.value === getAllStageItem(getString).value
          )
          const stages = hasAllStagesChecked ? [] : selectedStages.map((stage: SelectOption) => stage.value)
          formikProps.setFieldValue('stagesToExecute', hasAllStagesChecked ? [] : stages)
        }}
        value={allStagesSelected ? [getAllStageItem(getString)] : selectedStages}
        items={executionStageList}
        minWidth={50}
        usePortal={true}
        className={css.stageDropdown}
        placeholder={allStagesSelected ? getString('pipeline.allStages') : getString('stages')}
      />
    </Layout.Vertical>
  )
}

export default StageSelection
