/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import WebhookConditionsPanel from '@triggers/components/steps/WebhookConditionsPanel/WebhookConditionsPanel'
import WebhookPipelineInputPanel from '@triggers/components/steps/WebhookPipelineInputPanel/WebhookPipelineInputPanel'
import WebhookTriggerConfigPanel from '@triggers/components/steps/WebhookTriggerConfigPanel/WebhookTriggerConfigPanel'
import WebhookPipelineInputPanelV1 from '@triggers/pages/triggers/views/V1/WebhookPipelineInputPanelV1'
import { Trigger, TriggerProps } from '../Trigger'
import { TriggerBaseType } from '../TriggerInterface'
import WebhookTriggerWizard from './WebhookTriggerWizard'

export abstract class WebhookTrigger<T> extends Trigger<T> {
  protected baseType = TriggerBaseType.WEBHOOK

  renderStepOne(): JSX.Element {
    return <WebhookTriggerConfigPanel />
  }

  renderStepTwo(): JSX.Element {
    return <WebhookConditionsPanel />
  }

  renderStepThree(isSimplifiedYAML?: boolean): JSX.Element {
    return isSimplifiedYAML ? <WebhookPipelineInputPanelV1 /> : <WebhookPipelineInputPanel />
  }

  renderTrigger(props: TriggerProps<T>): JSX.Element {
    return (
      <WebhookTriggerWizard {...props}>
        {this.renderStepOne()}
        {this.renderStepTwo()}
        {this.renderStepThree(props.isSimplifiedYAML)}
      </WebhookTriggerWizard>
    )
  }
}
