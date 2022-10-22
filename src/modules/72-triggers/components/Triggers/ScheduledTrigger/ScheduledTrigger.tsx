/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import TriggerOverviewPanel from '@triggers/components/steps/TriggerOverviewPanel/TriggerOverviewPanel'
import SchedulePanel from '@triggers/components/steps/SchedulePanel/SchedulePanel'
import WebhookPipelineInputPanel from '@triggers/components/steps/WebhookPipelineInputPanel/WebhookPipelineInputPanel'

import { Trigger, TriggerProps } from '../Trigger'
import { TriggerBaseType } from '../TriggerInterface'
import ScheduledTriggerWizard from './ScheduledTriggerWizard'

export abstract class ScheduledTrigger<T> extends Trigger<T> {
  protected baseType = TriggerBaseType.SCHEDULE

  renderStepOne(): JSX.Element {
    return <TriggerOverviewPanel />
  }

  renderStepTwo(): JSX.Element {
    return <SchedulePanel />
  }

  renderStepThree(): JSX.Element {
    return <WebhookPipelineInputPanel />
  }

  renderTrigger(props: TriggerProps<T>): JSX.Element {
    return (
      <ScheduledTriggerWizard {...props}>
        {this.renderStepOne()}
        {this.renderStepTwo()}
        {this.renderStepThree()}
      </ScheduledTriggerWizard>
    )
  }
}
