/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { extractServiceMethods } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/DynatraceMetricPacksToService.utils'
import {
  EXPECTED_SERVICE_METHODS,
  SERVICE_LIST_MOCK
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/__tests__/DynatraceMetricPacksToService.mock'

describe('Validate Dynatrace Custom Metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should extract selected service methods from service list', async () => {
    expect(extractServiceMethods(SERVICE_LIST_MOCK, 'mock_entity_id_1')).toEqual(EXPECTED_SERVICE_METHODS)
  })
  test('should return undefined when service not found in provided list', async () => {
    expect(extractServiceMethods(SERVICE_LIST_MOCK, 'non_existing_service_id')).toEqual([])
  })
})
