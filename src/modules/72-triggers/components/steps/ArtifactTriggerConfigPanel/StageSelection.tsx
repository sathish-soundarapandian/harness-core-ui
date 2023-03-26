/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Heading, MultiSelectDropDown, SelectOption } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { getAllStageItem } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'

const StageSelection: React.FC<{ formikProps: any }> = ({ formikProps }) => {
  const { getString } = useStrings()
  const stagesArr = []
  for (const stage of formikProps.values.originalPipeline.stages) {
    if (formikProps.values.stagesToExecute.includes(stage.stage.identifier)) {
      stagesArr.push({ label: stage.stage.name, value: stage.stage.identifier })
    }
  }
  const executionStageList = formikProps.values?.originalPipeline?.stages?.map((stage: any) => {
    return {
      label: defaultTo(stage?.stage?.name, ''),
      value: defaultTo(stage?.stage?.identifier, '')
    }
  })

  executionStageList.unshift(getAllStageItem(getString))

  const [selectedStages, setStage] = React.useState<SelectOption[] | any>(stagesArr)

  const [allStagesSelected, setAllStagesSelect] = React.useState<boolean[] | any>(false)

  return (
    <div>
      <Heading level={5} font={{ variation: FontVariation.H5 }}>
        {getString('triggers.selectStagesToExecute')}
      </Heading>
      <MultiSelectDropDown
        // popoverClassName={css.disabledStageDropdown}
        hideItemCount={allStagesSelected}
        disabled={false}
        buttonTestId={'stage-select'}
        onChange={(items: SelectOption[]) => {
          const hasAllStagesChecked = items.find(item => item.value === getAllStageItem(getString).value)
          const allStagesChecked = items?.length === executionStageList?.length
          if (hasAllStagesChecked || allStagesChecked) {
            setStage([hasAllStagesChecked])
            setAllStagesSelect(true)
          } else {
            setAllStagesSelect(false)
            setStage(items)
          }
        }}
        onPopoverClose={() => {
          setStage(selectedStages)
          const stages = selectedStages.map((stage: SelectOption) => stage.value)
          const hasAllStagesChecked = selectedStages.find(
            (item: SelectOption) => item.value === getAllStageItem(getString).value
          )
          formikProps.setFieldValue('stagesToExecute', hasAllStagesChecked ? [] : stages)
        }}
        value={selectedStages}
        items={executionStageList}
        minWidth={50}
        usePortal={true}
        // placeholder={localSelectedStagesData.allStagesSelected ? getString('pipeline.allStages') : getString('stages')}
        // className={css.stagesDropdown}
      />
      {/* <HarnessDocTooltip tooltipId={stageExecutionDisabledTooltip} useStandAlone={true} /> */}
    </div>
  )
}

export default StageSelection
