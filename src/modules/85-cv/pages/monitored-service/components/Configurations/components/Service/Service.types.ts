/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MonitoredServiceDTO } from 'services/cv'

export interface MonitoredServiceRef {
  name: string
  tags?: { [key: string]: any }
  identifier: string
  description?: string
}

export interface MonitoredServiceForm extends Omit<MonitoredServiceDTO, 'projectIdentifier' | 'orgIdentifier'> {
  isEdit: boolean
  isMonitoredServiceEnabled?: boolean
}
