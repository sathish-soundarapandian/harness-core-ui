/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DowntimeForm } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import type { CreateDowntimeSteps } from '../../CreateDowntimeForm.types'

export interface CreateDowntimePreviewProps {
  id: CreateDowntimeSteps
  data: DowntimeForm
}

export interface LabelValueProps {
  label: string
  value: string
  recurrenceText?: string
}
