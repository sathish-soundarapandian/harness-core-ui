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
  const [selectedStages, setStage] = React.useState<string[] | any>(formikProps.values.stagesToExecute)
  //   const { getString } = useStrings()
  const executionStageList = formikProps.values?.originalPipeline?.stages?.map((stage: any) => {
    return {
      label: defaultTo(stage?.stage?.name, ''),
      value: defaultTo(stage?.stage?.identifier, '')
    }
  })

  return (
    <div>
      <label>Select Stages To Execute</label>
      <MultiSelectDropDown
        // popoverClassName={css.disabledStageDropdown}
        // hideItemCount={selectedStages.length}
        disabled={false}
        buttonTestId={'stage-select'}
        onChange={setStage}
        onPopoverClose={() => {
          setStage(selectedStages)
          const stages = selectedStages.map((stage: SelectOption) => stage.value)
          formikProps.setFieldValue('stagesToExecute', stages)
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
