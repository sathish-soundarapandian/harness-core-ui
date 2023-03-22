/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiSelectDropDown, SelectOption } from '@harness/uicore'
import { defaultTo } from 'lodash-es'

const StageSelection: React.FC<{ formikProps: any }> = ({ formikProps }) => {
  const [setStage] = React.useState<string[] | any>([''])
  //   const { getString } = useStrings()
  const executionStageList = formikProps.values?.originalPipeline?.stages?.map((stage: any) => {
    return {
      label: defaultTo(stage?.stage?.name, ''),
      value: defaultTo(stage?.stage?.identifier, '')
    }
  })

  return (
    <>
      <MultiSelectDropDown
        // popoverClassName={css.disabledStageDropdown}
        // hideItemCount={localSelectedStagesData.allStagesSelected}
        disabled={false}
        buttonTestId={'stage-select'}
        onChange={(items: SelectOption[]) => {
          const stages = items.map(item => item.value)
          setStage([...stages])
          formikProps.setFieldValue('selectedStages', stages)
        }}
        // onPopoverClose={() => setSelectedStageData(localSelectedStagesData)}
        // value={localSelectedStagesData.selectedStageItems}
        items={executionStageList}
        minWidth={150}
        usePortal={true}
        // placeholder={localSelectedStagesData.allStagesSelected ? getString('pipeline.allStages') : getString('stages')}
        // className={css.stagesDropdown}
      />
      {/* <HarnessDocTooltip tooltipId={stageExecutionDisabledTooltip} useStandAlone={true} /> */}
    </>
  )
}

export default StageSelection
