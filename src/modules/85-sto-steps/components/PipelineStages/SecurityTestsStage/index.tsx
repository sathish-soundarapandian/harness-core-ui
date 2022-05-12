/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { SecurityTestsStage } from './SecurityTestsStage'

const titleKey = 'common.purpose.sto.continuous'

const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString(titleKey),
  type: StageType.SECURITY,
  icon: 'sto-color-filled',
  iconColor: 'var(--primary-8)',
  isApproval: false,
  openExecutionStrategy: true
})

const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']) => {
  const title = getString(titleKey)

  return (
    <SecurityTestsStage
      icon={'sto-color-filled'}
      hoverIcon={'security-stage'}
      iconsStyle={{ color: 'var(--primary-8)' }}
      name={title}
      type={StageType.SECURITY}
      title={title}
      description={getString('stoSteps.securityStage.description')}
      isHidden={!isEnabled}
      isDisabled={false}
      isApproval={false}
    />
  )
}

stagesCollection.registerStageFactory(StageType.SECURITY, getStageAttributes, getStageEditorImplementation)
