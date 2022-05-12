/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { EditStageView } from '@ci/components/PipelineStudio/BuildStage/EditStageView/EditStageView'
import BuildStageSetupShell from '@ci/components/PipelineStudio/BuildStageSetupShell/BuildStageSetupShell'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { DeployStageErrorProvider } from '@pipeline/context/StageErrorContext'
import { PipelineStage } from '@pipeline/components/PipelineStages/PipelineStage'

interface SecurityTestsStageProps {
  data?: StageElementWrapper<BuildStageElementConfig>
  onSubmit?: (values: StageElementWrapper<BuildStageElementConfig>, identifier: string) => void
}

export class SecurityTestsStage extends PipelineStage<SecurityTestsStageProps> {
  render(): JSX.Element {
    const { minimal, stageProps } = this.props
    if (minimal) {
      return <EditStageView {...stageProps} moduleIcon="sto-color-filled" />
    }
    return (
      <DeployStageErrorProvider>
        <BuildStageSetupShell moduleIcon="sto-grey" />
      </DeployStageErrorProvider>
    )
  }
}
