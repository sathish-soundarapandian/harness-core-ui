/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'

import type { NGTriggerResponse } from 'services/pipeline-ng'

import type { TriggerBaseType, TriggerSubType } from './TriggerInterface'
export interface TriggerProps<T> {
  isNewTrigger: boolean
  baseType?: TriggerBaseType
  type?: TriggerSubType
  triggerData?: NGTriggerResponse
  initialValues: T
}

export abstract class Trigger<T> {
  protected abstract baseType: TriggerBaseType
  protected abstract type: TriggerSubType
  protected abstract triggerDescription: keyof StringsMap | undefined
  protected abstract defaultValues: T

  getBaseType(): TriggerBaseType {
    return this.baseType
  }

  getType(): TriggerSubType {
    return this.type
  }

  getDescription(): keyof StringsMap | undefined {
    return this.triggerDescription
  }

  getDefaultValues(initialValues: T): T {
    return { ...this.defaultValues, ...initialValues }
  }

  abstract renderStepOne(): JSX.Element

  abstract renderStepTwo(): JSX.Element

  abstract renderStepThree(): JSX.Element

  abstract renderTrigger(props: TriggerProps<T>): JSX.Element
}
