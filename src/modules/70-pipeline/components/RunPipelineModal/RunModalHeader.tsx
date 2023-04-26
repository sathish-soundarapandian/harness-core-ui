/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useState } from 'react'
import {
  Heading,
  HarnessDocTooltip,
  MultiSelectDropDown,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  SelectOption
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'

import type { FormikErrors } from 'formik'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type {
  CacheResponseMetadata,
  ResponseInputSetTemplateWithReplacedExpressionsResponse,
  ResponseListStageExecutionResponse,
  ResponsePMSPipelineResponseDTO
} from 'services/pipeline-ng'
import {
  ALL_STAGE_VALUE,
  getAllStageData,
  getAllStageItem,
  getStageIdentifierFromStageData,
  SelectedStageData,
  StageSelectionData
} from '@pipeline/utils/runPipelineUtils'
import type { InputSetDTO } from '@pipeline/utils/types'

import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import GitPopover from '../GitPopover/GitPopover'
import { ErrorsStrip } from '../ErrorsStrip/ErrorsStrip'

import { EntityCachedCopy } from '../PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import css from './RunPipelineForm.module.scss'

export interface RunModalHeaderProps {
  pipelineExecutionId?: string
  selectedStageData: StageSelectionData
  setSelectedStageData: (selectedStages: StageSelectionData) => void
  setSkipPreFlightCheck: Dispatch<SetStateAction<boolean>>
  selectedView: SelectedView
  handleModeSwitch(view: SelectedView): void
  runClicked: boolean
  executionView?: boolean
  pipelineResponse: ResponsePMSPipelineResponseDTO | null
  template: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
  formRefDom: React.MutableRefObject<HTMLElement | undefined>
  formErrors: FormikErrors<InputSetDTO>
  stageExecutionData: ResponseListStageExecutionResponse | null
  executionStageList: SelectOption[]
  runModalHeaderTitle: string
  refetchPipeline: any
  refetchTemplate: any
}

export default function RunModalHeader(props: RunModalHeaderProps): React.ReactElement | null {
  const {
    pipelineExecutionId,
    selectedStageData,
    setSelectedStageData,
    setSkipPreFlightCheck,
    handleModeSwitch,
    runClicked,
    executionView,
    selectedView,
    pipelineResponse,
    template,
    formRefDom,
    formErrors,
    stageExecutionData,
    executionStageList,
    runModalHeaderTitle,
    refetchPipeline,
    refetchTemplate
  } = props
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { getString } = useStrings()
  const [localSelectedStagesData, setLocalSelectedStagesData] = useState(selectedStageData)
  const isPipelineRemote =
    supportingGitSimplification &&
    pipelineResponse?.data?.gitDetails?.repoName &&
    pipelineResponse?.data?.gitDetails?.branch

  const isStageExecutionDisabled = (): boolean => {
    //stageExecutionData?.data is empty array when allowStageExecution is set to false in advanced tab
    return Boolean(pipelineExecutionId) || isEmpty(stageExecutionData?.data)
  }

  const handleReloadFromCache = () => {
    refetchPipeline({
      requestOptions: { headers: { 'Load-From-Cache': 'false' } }
    })
    refetchTemplate({
      body: {
        stageIdentifiers: getStageIdentifierFromStageData(selectedStageData)
      },
      requestOptions: { headers: { 'Load-From-Cache': 'false' } }
    })
  }

  const stageExecutionDisabledTooltip = isStageExecutionDisabled() ? 'stageExecutionDisabled' : undefined

  const onStageSelect = (items: SelectOption[]): void => {
    const allStagesSelected = items.find(item => item.value === ALL_STAGE_VALUE)
    const updatedSelectedStages: SelectedStageData[] = []
    const hasOnlyAllStagesUnChecked =
      items.length === stageExecutionData?.data?.length &&
      !items.find(item => item.value === getAllStageItem(getString).value)
    if (
      (!localSelectedStagesData.allStagesSelected && allStagesSelected) ||
      hasOnlyAllStagesUnChecked ||
      items?.length === 0
    ) {
      const updatedSelectedStageItems = []
      updatedSelectedStageItems.push(getAllStageItem(getString))
      updatedSelectedStages.push(getAllStageData(getString))

      setLocalSelectedStagesData({
        selectedStages: updatedSelectedStages,
        selectedStageItems: updatedSelectedStageItems,
        allStagesSelected: true
      })
    } else {
      const newItems = items.filter((option: SelectOption) => {
        const stageDetails = stageExecutionData?.data?.find(stageData => stageData.stageIdentifier === option.value)
        stageDetails && updatedSelectedStages.push(stageDetails)
        return option.value !== ALL_STAGE_VALUE
      })
      setLocalSelectedStagesData({
        selectedStages: updatedSelectedStages,
        selectedStageItems: newItems,
        allStagesSelected: false
      })
    }
    setSkipPreFlightCheck(true)
  }

  if (executionView) {
    return null
  }

  return (
    <>
      <div className={css.runModalHeader}>
        <Heading
          level={2}
          font={{ weight: 'bold' }}
          color={Color.BLACK_100}
          className={css.runModalHeaderTitle}
          data-tooltip-id="runPipelineFormTitle"
        >
          {runModalHeaderTitle}
          <HarnessDocTooltip tooltipId="runPipelineFormTitle" useStandAlone={true} />
        </Heading>
        {isGitSyncEnabled && (
          <GitSyncStoreProvider>
            <GitPopover
              data={pipelineResponse?.data?.gitDetails ?? {}}
              iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
            />
          </GitSyncStoreProvider>
        )}

        <div data-tooltip-id={stageExecutionDisabledTooltip}>
          <MultiSelectDropDown
            popoverClassName={css.disabledStageDropdown}
            hideItemCount={localSelectedStagesData.allStagesSelected}
            disabled={isStageExecutionDisabled()}
            buttonTestId={'stage-select'}
            onChange={onStageSelect}
            onPopoverClose={() => setSelectedStageData(localSelectedStagesData)}
            value={localSelectedStagesData.selectedStageItems}
            items={executionStageList}
            minWidth={150}
            usePortal={true}
            placeholder={
              localSelectedStagesData.allStagesSelected ? getString('pipeline.allStages') : getString('stages')
            }
            className={css.stagesDropdown}
          />
          <HarnessDocTooltip tooltipId={stageExecutionDisabledTooltip} useStandAlone={true} />
        </div>

        <div className={css.optionBtns}>
          <VisualYamlToggle
            selectedView={selectedView}
            onChange={handleModeSwitch}
            disableToggle={!template?.data?.inputSetTemplateYaml}
          />
        </div>
      </div>
      {isPipelineRemote && (
        <div className={css.gitRemoteDetailsWrapper}>
          <GitRemoteDetails
            repoName={pipelineResponse?.data?.gitDetails?.repoName}
            branch={pipelineResponse?.data?.gitDetails?.branch}
            filePath={pipelineResponse?.data?.gitDetails?.filePath}
            fileUrl={pipelineResponse?.data?.gitDetails?.fileUrl}
            flags={{ readOnly: true }}
          />
          {!isEmpty(pipelineResponse?.data?.cacheResponse) && (
            <EntityCachedCopy
              reloadContent={getString('common.pipeline')}
              cacheResponse={pipelineResponse?.data?.cacheResponse as CacheResponseMetadata}
              reloadFromCache={handleReloadFromCache}
            />
          )}
        </div>
      )}
      {runClicked ? <ErrorsStrip domRef={formRefDom} formErrors={formErrors} /> : null}
    </>
  )
}
