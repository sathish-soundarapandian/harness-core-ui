/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ManifestConditionsPanel from '@triggers/components/steps/ManifestConditionsPanel/ManifestConditionsPanel'
import ManifestPipelineInputPanel from '@triggers/components/steps/ManifestPipelineInputPanel/ManifestPipelineInputPanel'
import ManifestTriggerConfigPanel from '@triggers/components/steps/ManifestTriggerConfigPanel/ManifestTriggerConfigPanel'
import { Trigger, TriggerProps } from '../Trigger'
import { TriggerBaseType } from '../TriggerInterface'
import ManifestTriggerWizard from './ManifestTriggerWizard'

export abstract class ManifestTrigger<T> extends Trigger<T> {
  protected baseType = TriggerBaseType.MANIFEST

  renderStepOne(): JSX.Element {
    return <ManifestTriggerConfigPanel />
  }

  renderStepTwo(): JSX.Element {
    return <ManifestConditionsPanel />
  }

  renderStepThree(): JSX.Element {
    return <ManifestPipelineInputPanel />
  }

  renderTrigger(props: TriggerProps<T>): JSX.Element {
    return (
      <ManifestTriggerWizard {...props}>
        {this.renderStepOne()}
        {this.renderStepTwo()}
        {this.renderStepThree()}
      </ManifestTriggerWizard>
    )
  }
}
