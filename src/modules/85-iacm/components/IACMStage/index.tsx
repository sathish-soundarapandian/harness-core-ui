/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { PipelineStageProps } from '@pipeline/components/PipelineStages/PipelineStage'
import { IACMComponentMounter } from '../IACMApp'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: _getString('common.iacm'),
  type: StageType.IACM,
  icon: 'iacm',
  iconColor: 'var(--pipeline-custom-stage-color)',
  isApproval: false,
  openExecutionStrategy: true
})

const IACMStage = (props: PipelineStageProps): React.ReactElement => (
  <IACMComponentMounter<PipelineStageProps> component="IACMStage" childProps={props} />
)

const getStageEditorImplementation = (isEnabled: boolean, _getString: UseStringsReturn['getString']): JSX.Element => (
  <IACMStage
    name={_getString('common.iacm')}
    type={StageType.IACM}
    title={_getString('iacm.stageTitle')}
    description={_getString('iacm.stageDescription')}
    icon="iacm"
    hoverIcon="iacm"
    isHidden={!isEnabled}
    isDisabled={false}
    isApproval={false}
  />
)

stagesCollection.registerStageFactory(StageType.IACM, getStageAttributes, getStageEditorImplementation)
