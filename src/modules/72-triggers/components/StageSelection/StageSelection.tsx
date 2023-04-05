/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Heading, Layout, MultiSelectDropDown, SelectOption } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { ALL_STAGE_VALUE, clearRuntimeInput, getAllStageItem } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { useGetMergeInputSetFromPipelineTemplateWithListInput, useGetStagesExecutionList } from 'services/pipeline-ng'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet } from '@common/hooks'
import { memoizedParse, yamlStringify } from '@common/utils/YamlHelperMethods'

import css from './StageSelection.module.scss'

const StageSelection: React.FC<{ formikProps: any }> = ({ formikProps }) => {
  const { getString } = useStrings()

  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      targetIdentifier: string
      triggerIdentifier: string
    }>
  >()
  const { data: stageExecutionData } = useGetStagesExecutionList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier
    }
  })

  const executionStageList =
    stageExecutionData?.data?.map((stage: any) => {
      return {
        label: defaultTo(stage?.stageIdentifier, ''),
        value: defaultTo(stage?.stageName, '')
      }
    }) || []

  executionStageList.unshift(getAllStageItem(getString))

  const [selectedStages, setStage] = React.useState<SelectOption[] | any>([])

  const [allStagesSelected, setAllStagesSelect] = React.useState<boolean[] | any>(false)
  const allowStageExecutions = formikProps.values?.originalPipeline?.allowStageExecutions

  const {
    data: inputSetData,
    // loading: loadingInputSetsData,
    refetch: refetchInputSetData
    // error: inputSetError
  } = useMutateAsGet(useGetMergeInputSetFromPipelineTemplateWithListInput, {
    lazy: true,
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
    }
  })

  useEffect(() => {
    if (selectedStages.length || formikProps.values?.stagesToExecute) {
      refetchInputSetData()
    }
  }, [selectedStages])

  useEffect(() => {
    if (
      (Array.isArray(formikProps.values?.stagesToExecute) && !formikProps.values?.stagesToExecute.length) ||
      !formikProps.values?.stagesToExecute ||
      (formikProps.values?.originalPipeline && !allowStageExecutions)
    ) {
      setAllStagesSelect(true)
    }
  }, [])

  useEffect(() => {
    if (Array.isArray(formikProps.values?.stagesToExecute) && formikProps.values?.stagesToExecute.length) {
      const stagesArr: SelectOption[] = []
      if (stageExecutionData?.data && stageExecutionData?.data?.length) {
        for (const stage of stageExecutionData.data) {
          if (formikProps.values?.stagesToExecute?.includes(stage.stageIdentifier)) {
            stagesArr.push({ label: stage.stageName || '', value: stage.stageIdentifier || '' })
          }
        }
      } else {
        stagesArr.push(getAllStageItem(getString))
      }
      setStage(stagesArr)
    }
  }, [formikProps.values?.stagesToExecute, stageExecutionData?.data])

  useEffect(() => {
    if (formikProps.values?.originalPipeline && !allowStageExecutions) {
      formikProps.setFieldValue('stagesToExecute', [])
    }
  }, [allowStageExecutions])

  const isDisabled = (): boolean => {
    if (allowStageExecutions) {
      return false
    } else {
      return true
    }
  }
  return (
    <Layout.Vertical>
      <Heading level={5} font={{ variation: FontVariation.H5 }}>
        {getString('triggers.selectStagesToExecute')}
      </Heading>
      <MultiSelectDropDown
        hideItemCount={allStagesSelected}
        disabled={isDisabled()}
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
        }}
        onPopoverClose={() => {
          const hasAllStagesChecked = selectedStages.find(
            (item: SelectOption) => item.value === getAllStageItem(getString).value
          )
          const stages = hasAllStagesChecked ? [] : selectedStages.map((stage: SelectOption) => stage.value)
          formikProps.setFieldValue('stagesToExecute', hasAllStagesChecked ? [] : stages)

          /*
            1. merge trigger api ->  pass stageIdentifier (s1/s2)
            op: triger 
          */
          if (formikProps.values.pipeline) {
            // const { identifier } = formikProps.values.pipeline
            // const pipeObj = formikProps.values.pipeline

            // const oldPipeline = formikProps.values.pipeline

            // const filteredStages = allStagesSelected
            //   ? formikProps.values.resolvedPipeline.stages
            //   : formikProps.values.resolvedPipeline.stages.filter((stg: any) => stages.includes(stg.stage.identifier))
            // oldPipeline['stages'] = filteredStages

            formikProps.setFieldValue(
              'pipeline',
              clearRuntimeInput(memoizedParse<any>(inputSetData?.data?.pipelineYaml as any)?.pipeline)
            )
            // const modifiedPipeline = {
            //   identifier,
            //   stages: [...filteredStages]
            // }
            // formikProps.setFieldValue('pipeline', clearRuntimeInput(modifiedPipeline))
          }
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
