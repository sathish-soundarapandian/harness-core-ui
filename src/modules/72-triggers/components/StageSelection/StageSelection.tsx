/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { HarnessDocTooltip, Heading, Layout, MultiSelectDropDown, SelectOption } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { ALL_STAGE_VALUE, clearRuntimeInput, getAllStageItem } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import {
  StageExecutionResponse,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  useGetStagesExecutionList
} from 'services/pipeline-ng'
import type { GitQueryParams, TriggerPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { memoizedParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { isNewTrigger } from '../Triggers/utils'
import css from './StageSelection.module.scss'

const StageSelection: React.FC<{ formikProps?: FormikProps<any> }> = ({ formikProps }) => {
  const { getString } = useStrings()
  const {
    stagesToExecute = [],
    resolvedPipeline,
    originalPipeline,
    inputSetRefs = [],
    pipeline
  } = formikProps?.values ?? {}
  const allowStageExecutions = resolvedPipeline?.allowStageExecutions
  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier, triggerIdentifier } =
    useParams<TriggerPathProps>()
  const { repoIdentifier, branch, connectorRef, repoName } = useQueryParams<GitQueryParams>()

  const [selectedStages, setSelectedStages] = useState<SelectOption[]>(
    /**
     * Pass the stagesToExecute as initial selectedStages do handle the edit case flow.
     * As we are using stage?.stageIdentifier both as name and value so creating the options using value only
     */

    stagesToExecute.map((stageToExecute: string) => ({
      label: stageToExecute,
      value: stageToExecute
    }))
  )
  const [executionStageList, setExecutionStageList] = useState([getAllStageItem(getString)])
  const [allStagesSelected, setAllStagesSelect] = useState<boolean>(false)

  const commonQueryParam = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    // GitX related query params
    branch,
    repoName,
    parentEntityConnectorRef: connectorRef,
    parentEntityRepoName: repoIdentifier
  }

  const { data: stageExecutionData } = useGetStagesExecutionList({
    queryParams: commonQueryParam,
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    // Do not call the API if its new trigger and state execution is not allowed
    lazy: !allowStageExecutions && isNewTrigger(triggerIdentifier)
  })

  const { data: inputSetData, refetch: refetchInputSetData } = useMutateAsGet(
    useGetMergeInputSetFromPipelineTemplateWithListInput,
    {
      queryParams: commonQueryParam,
      requestOptions: { headers: { 'Load-From-Cache': 'true' } },
      lazy: true
    }
  )

  // calling merge input set data
  useEffect(() => {
    refetchInputSetData({
      /**
       * Pass inputSetReferences and lastYamlToMerge both as BE first merge the data from inputSetReferences then from lastYamlToMerge
       * lastYamlToMerge is the latest values provided by the user. In this case its pipeline.
       */
      body: {
        inputSetReferences: inputSetRefs,
        stageIdentifiers: selectedStages.map((stage: SelectOption) => stage.value),
        lastYamlToMerge: yamlStringify({ pipeline })
      }
    })
  }, [selectedStages])

  useEffect(() => {
    if (
      (Array.isArray(stagesToExecute) && !stagesToExecute.length) ||
      !stagesToExecute ||
      (originalPipeline && !allowStageExecutions)
    ) {
      setAllStagesSelect(true)
    }
  }, [stagesToExecute, allowStageExecutions, originalPipeline])

  useEffect(() => {
    if (inputSetData?.data?.pipelineYaml) {
      const pipeObj = clearRuntimeInput(memoizedParse<any>(inputSetData.data.pipelineYaml)?.pipeline)
      formikProps?.setFieldValue('pipeline', pipeObj)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSetData?.data?.pipelineYaml])

  useEffect(() => {
    setExecutionStageList(list =>
      list.concat(
        (stageExecutionData?.data ?? []).map(
          (stage: StageExecutionResponse) =>
            ({
              label: defaultTo(stage?.stageIdentifier, ''),
              value: defaultTo(stage?.stageIdentifier, '')
            } as SelectOption)
        )
      )
    )
  }, [stageExecutionData?.data])

  /* if allowStageExecutions is false then stagesToExecute should be set to [] */
  useEffect(() => {
    if (originalPipeline && !allowStageExecutions && !stageExecutionData?.data?.length) {
      formikProps?.setFieldValue('stagesToExecute', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPipeline, allowStageExecutions, stageExecutionData?.data])

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
          const allStagesChecked = items?.length === executionStageList.length - 1
          const isAllStagesChecked = items.some(item => item.value === ALL_STAGE_VALUE)
          const isOnlyAllStagesUnChecked = allStagesChecked && !items.some(item => item.value === ALL_STAGE_VALUE)

          if (isOnlyAllStagesUnChecked || items?.length === 0 || (!allStagesSelected && isAllStagesChecked)) {
            setSelectedStages([])
            setAllStagesSelect(true)
            formikProps?.setFieldValue('stagesToExecute', [])
          } else {
            const newItems = items.filter((option: SelectOption) => {
              return option.value !== ALL_STAGE_VALUE
            })
            setSelectedStages(newItems)
            setAllStagesSelect(false)
            formikProps?.setFieldValue(
              'stagesToExecute',
              newItems.map((stage: SelectOption) => stage.value)
            )
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
