/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AddDrawerMapInterface } from '@common/components/AddDrawer/AddDrawer'
import type { UseGetMockData } from '@common/utils/testUtils'
import type { ConnectorCatalogueItem, ConnectorInfoDTO, ResponseConnectorCatalogueResponse } from 'services/cd-ng'

export interface ComputedDrawerMapData {
  categoriesMap: AddDrawerMapInterface
  categoriesList: ConnectorInfoDTO['type']
}

export interface UseGetConnectorsListHookProps {
  catalogueMockData?: UseGetMockData<ResponseConnectorCatalogueResponse>
  lazy?: boolean
}

export interface UseGetConnectorsListHookReturn {
  connectorsList: ConnectorInfoDTO['type'] | undefined
  loading: boolean
  categoriesMap: AddDrawerMapInterface
  connectorCatalogueOrder: Array<ConnectorCatalogueItem['category']>
}
