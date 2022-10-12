/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import type { DynatraceServiceDTO } from 'services/cv'

export function extractServiceMethods(
  serviceList: DynatraceServiceDTO[],
  selectedServiceId: string
): string[] | undefined {
  return defaultTo(serviceList.find(service => service.entityId === selectedServiceId)?.serviceMethodIds, [])
}
