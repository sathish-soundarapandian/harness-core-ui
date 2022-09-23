/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import TriggerDetailsV1 from '@triggers/pages/trigger-details/TriggerDetails'
import TriggersWizardPage from '@triggers/pages/triggers/TriggersWizardPage'

import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

import type { AbstractTriggerFactory } from '../../factory/AbstractTriggerFactory'
import TriggerDetails from '../TriggerDetails/TriggerDetails'
import type { TriggerProps } from './Trigger'

export interface TriggerWidgetProps<T> extends TriggerProps<T> {
  factory: AbstractTriggerFactory
}

export function TriggerWidget<T>({
  factory,
  type,
  baseType,
  initialValues,
  isNewTrigger,
  triggerData
}: TriggerWidgetProps<T>): JSX.Element {
  const isTriggersRefactor = useFeatureFlag(FeatureFlag.TRIGGERS_REFACTOR)

  // isTriggersRefactor check can be removed once triggers refactoring is complete.
  // Until then it gives us the freedom to selectively render only those triggers that have been refactored.
  const trigger = isTriggersRefactor && factory?.getTrigger<T>(type)

  if (!trigger) {
    return (
      <TriggerDetailsV1 wizard={true}>
        <TriggersWizardPage />
      </TriggerDetailsV1>
    )
  } else {
    const values = trigger.getDefaultValues(initialValues)
    return (
      <TriggerDetails>
        {trigger?.renderTrigger({
          type,
          baseType,
          initialValues: values,
          isNewTrigger,
          triggerData
        })}
      </TriggerDetails>
    )
  }
}
