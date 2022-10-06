/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ArtifactConditionsPanel from '@triggers/components/steps/ArtifactTriggerConditionsPanel/ArtifactConditionsPanel'
import ArtifactTriggerInputPanel from '@triggers/components/steps/ArtifactTriggerInputPanel/ArtifactTriggerInputPanel'
import ArtifactTriggerConfigPanel from '@triggers/components/steps/ArtifactTriggerConfigPanel/ArtifactTriggerConfigPanel'
import { Trigger, TriggerProps } from '../Trigger'
import { TriggerBaseType } from '../TriggerInterface'
import ArtifactTriggerWizard from './ArtifactTriggerWizard'

export abstract class ArtifactTrigger<T> extends Trigger<T> {
  protected baseType: TriggerBaseType = TriggerBaseType.ARTIFACT

  renderStepOne(): JSX.Element {
    return <ArtifactTriggerConfigPanel />
  }

  renderStepTwo(): JSX.Element {
    return <ArtifactConditionsPanel />
  }

  renderStepThree(): JSX.Element {
    return <ArtifactTriggerInputPanel />
  }

  renderTrigger(props: TriggerProps<T>): JSX.Element {
    return (
      <ArtifactTriggerWizard {...props}>
        {this.renderStepOne()}
        {this.renderStepTwo()}
        {this.renderStepThree()}
      </ArtifactTriggerWizard>
    )
  }
}
