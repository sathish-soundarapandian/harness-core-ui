/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { MonitoredServiceDTO } from 'services/cv'

export interface TemplateDataInterface {
  identifier: string
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  versionLabel: string
}

export interface MonitoredServiceInputSetInterface {
  environmentRef: string | SelectOption
  serviceRef: MonitoredServiceDTO['serviceRef']
  sources: MonitoredServiceDTO['sources']
  type: MonitoredServiceDTO['type']
  variables?: { name: string }
}

export interface MonitoredServiceTemplateInterface extends Omit<TemplateDataInterface, 'accountId'> {
  name: string
  tags: { [key: string]: string }
  type: 'MonitoredService'
  spec?: MonitoredServiceInputSetInterface
}

export interface YamlResponseInterface {
  template: MonitoredServiceTemplateInterface
}
