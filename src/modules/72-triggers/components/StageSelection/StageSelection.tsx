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
import { clearRuntimeInput, getAllStageItem } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import css from './StageSelection.module.scss'

const StageSelection: React.FC<{ formikProps: any }> = ({ formikProps }) => {
  const { getString } = useStrings()
  const stagesArr = []
  if (formikProps.values?.resolvedPipeline?.stages && formikProps.values?.resolvedPipeline?.stages.length) {
    for (const stage of formikProps.values.resolvedPipeline.stages) {
      if (formikProps.values?.stagesToExecute?.includes(stage.stage.identifier)) {
        stagesArr.push({ label: stage.stage.name, value: stage.stage.identifier })
      }
    }
  } else {
    stagesArr.push(getAllStageItem(getString))
  }
  const executionStageList =
    formikProps.values?.resolvedPipeline?.stages?.map((stage: any) => {
      return {
        label: defaultTo(stage?.stage?.name, ''),
        value: defaultTo(stage?.stage?.identifier, '')
      }
    }) || []

  executionStageList.unshift(getAllStageItem(getString))

  const [selectedStages, setStage] = React.useState<SelectOption[] | any>(stagesArr)

  const [allStagesSelected, setAllStagesSelect] = React.useState<boolean[] | any>(false)
  const allowStageExecutions = formikProps.values?.originalPipeline?.allowStageExecutions

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
          const hasAllStagesChecked =
            items.find(item => item.value === getAllStageItem(getString).value) || allStagesChecked

          if (hasAllStagesChecked || allStagesChecked) {
            setStage([])
            setAllStagesSelect(true)
          } else {
            setAllStagesSelect(false)
            setStage(items)
          }
        }}
        onPopoverClose={() => {
          setStage(selectedStages)

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

            const oldPipeline = formikProps.values.pipeline

            const filteredStages = allStagesSelected
              ? formikProps.values.resolvedPipeline.stages
              : formikProps.values.resolvedPipeline.stages.filter((stg: any) => stages.includes(stg.stage.identifier))
            oldPipeline['stages'] = filteredStages

            formikProps.setFieldValue('pipeline', clearRuntimeInput(oldPipeline))
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
