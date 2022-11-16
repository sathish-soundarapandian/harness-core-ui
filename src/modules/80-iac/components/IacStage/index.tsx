import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { PipelineStageProps } from '@pipeline/components/PipelineStages/PipelineStage'
import { IacComponentMounter } from '../IacApp'

const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString('common.iacm'),
  type: StageType.IAC,
  icon: 'sto-color-filled',
  iconColor: 'var(--primary-8)',
  isApproval: false,
  openExecutionStrategy: true
})

const IacStage = (props: PipelineStageProps): React.ReactElement => (
  <IacComponentMounter<PipelineStageProps> component="IacStage" childProps={props} />
)

const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']): JSX.Element => {
  return (
    <IacStage
      icon={'iacm'}
      hoverIcon={'iacm'}
      iconsStyle={{ color: 'var(--primary-8)' }}
      name={getString('common.iacm')}
      type={StageType.IAC}
      title={getString('iac.stageTitle')}
      description={getString('iac.stageDescription')}
      isHidden={!isEnabled}
      isDisabled={false}
      isApproval={false}
    />
  )
}

stagesCollection.registerStageFactory(StageType.IAC, getStageAttributes, getStageEditorImplementation)
