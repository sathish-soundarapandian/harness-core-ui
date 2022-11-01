import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { IacStage } from '@iac/RouteDestinations'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'Iac',
  type: StageType.IAC,
  icon: 'sto-color-filled',
  iconColor: 'var(--primary-8)',
  isApproval: false,
  openExecutionStrategy: true
})

const getStageEditorImplementation = (isEnabled: boolean, _getString: UseStringsReturn['getString']): JSX.Element => {
  return (
    <IacStage
      icon={'sto-color-filled'}
      hoverIcon={'security-stage'}
      iconsStyle={{ color: 'var(--primary-8)' }}
      name={'Iac'}
      type={StageType.IAC}
      title={'Iac'}
      description={'Iac Stage'}
      isHidden={!isEnabled}
      isDisabled={false}
      isApproval={false}
    />
  )
}

stagesCollection.registerStageFactory(StageType.IAC, getStageAttributes, getStageEditorImplementation)
