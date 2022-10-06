/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'

import type { StringsMap } from 'stringTypes'

import type { Trigger } from '../components/Triggers/Trigger'

export abstract class AbstractTriggerFactory {
  protected triggerBank: Map<string, Trigger<unknown>>

  constructor() {
    this.triggerBank = new Map()
  }

  registerTrigger<T>(trigger: Trigger<T>): void {
    this.triggerBank.set(trigger.getType(), trigger as Trigger<unknown>)
  }

  deregisterTrigger(type: string): void {
    const deletedTrigger = this.triggerBank.get(type)
    if (deletedTrigger) {
      this.triggerBank.delete(type)
    }
  }

  getTrigger<T>(sourceRepo?: string): Trigger<T> | undefined {
    if (sourceRepo && !isEmpty(sourceRepo)) {
      return this.triggerBank.get(sourceRepo) as Trigger<T>
    }
    return
  }

  getTriggerBaseType(type: string): string | undefined {
    return this.triggerBank.get(type)?.getBaseType()
  }

  getTriggerType(type: string): string | undefined {
    return this.triggerBank.get(type)?.getType()
  }

  getDescription(type: string): keyof StringsMap | undefined {
    return this.triggerBank.get(type)?.getDescription()
  }
}
