/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Scope } from '@common/interfaces/SecretsInterface'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

export type ConnectorRefFormValueType = { value: string } & string
export const getConnectorRefValue = (connectorRef: ConnectorRefFormValueType) => {
  return connectorRef.value ?? connectorRef
}

export type SelectedConnectorType = { record: ConnectorReferenceDTO; scope: Scope }
export const getSelectedConnectorValue = (selectedConnector: SelectedConnectorType) => {
  const { record, scope } = selectedConnector
  return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record.identifier}` : record.identifier
}
