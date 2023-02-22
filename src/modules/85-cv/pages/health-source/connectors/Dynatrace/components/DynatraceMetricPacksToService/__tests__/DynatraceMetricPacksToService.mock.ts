/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MockDynatraceMetricData } from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'
import type { DynatraceServiceDTO } from 'services/cv'
import type { DynatraceMetricPacksToServiceProps } from '../DynatraceMetricPacksToService.types'

export const DynatraceMetricPacksToServicePropsMock: DynatraceMetricPacksToServiceProps = {
  connectorIdentifier: 'mock_connector_identifier',
  dynatraceMetricData: MockDynatraceMetricData,
  setDynatraceMetricData: jest.fn(),
  metricValues: MockDynatraceMetricData
}

export const EXPECTED_SERVICE_METHODS = ['1', '2', '3']
export const SERVICE_LIST_MOCK: DynatraceServiceDTO[] = [
  {
    displayName: 'mock_service_name_1',
    entityId: 'mock_entity_id_1',
    serviceMethodIds: EXPECTED_SERVICE_METHODS
  },
  {
    displayName: 'mock_service_name_2',
    entityId: 'mock_entity_id_2',
    serviceMethodIds: ['a', 'b', 'c']
  }
]
