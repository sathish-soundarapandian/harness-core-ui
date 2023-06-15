/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Connectors } from '@connectors/constants'
import {
  CE_AWS_CONNECTOR_CREATION_EVENTS,
  CE_AZURE_CONNECTOR_CREATION_EVENTS,
  CE_GCP_CONNECTOR_CREATION_EVENTS,
  CE_K8S_CONNECTOR_CREATION_EVENTS
} from '@connectors/trackingConstants'

export const connectorsTrackEventMap = {
  [Connectors.CE_KUBERNETES]: CE_K8S_CONNECTOR_CREATION_EVENTS.LOAD_CONNECTION_TEST,
  [Connectors.CEAWS]: CE_AWS_CONNECTOR_CREATION_EVENTS.LOAD_CONNECTION_TEST,
  [Connectors.CE_AZURE]: CE_AZURE_CONNECTOR_CREATION_EVENTS.LOAD_CONNECTION_TEST,
  [Connectors.CE_GCP]: CE_GCP_CONNECTOR_CREATION_EVENTS.LOAD_CONNECTION_TEST
}
