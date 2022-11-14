import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { PipelineStageProps } from '@pipeline/components/PipelineStages/PipelineStage'
import { IacComponentMounter } from '../IacApp'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: _getString('common.iacm'),
  type: StageType.IAC,
  icon: 'iacm',
  iconColor: 'var(--pipeline-custom-stage-color)',
  isApproval: false,
  openExecutionStrategy: true
})

const IacStage = (props: PipelineStageProps): React.ReactElement => (
  <IacComponentMounter<PipelineStageProps> component="IacStage" childProps={props} />
)

const getStageEditorImplementation = (isEnabled: boolean, _getString: UseStringsReturn['getString']): JSX.Element => {
  return (
    <IacStage
      name={_getString('common.iacm')}
      type={StageType.IAC}
      title={_getString('iac.stageTitle')}
      description={_getString('iac.stageDescription')}
      icon={'iacm'}
      hoverIcon={'iacm'}
      isHidden={!isEnabled}
      isDisabled={false}
      isApproval={false}
    />
  )
}

stagesCollection.registerStageFactory(StageType.IAC, getStageAttributes, getStageEditorImplementation)
