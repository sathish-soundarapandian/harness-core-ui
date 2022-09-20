/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import { ScheduleType } from '../../TriggerInterface'
import { ScheduledTrigger } from '../ScheduledTrigger'
import type { ScheduledInitialValuesInterface } from '../utils'

export class Cron extends ScheduledTrigger<ScheduledInitialValuesInterface> {
  protected type: ScheduleType = ScheduleType.Cron
  protected triggerDescription: keyof StringsMap = 'triggers.cronLabel'

  protected defaultValues = {
    triggerType: this.baseType,
    scheduleType: this.type
  }
}
