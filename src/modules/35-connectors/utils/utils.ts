/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGovernanceModalProps } from '@governance/hooks/useGovernanceMetaDataModal'
import { Scope } from '@common/interfaces/SecretsInterface'

export const connectorGovernanceModalProps = (): UseGovernanceModalProps => {
  return {
    errorHeaderMsg: 'connectors.policyEvaluations.failedToSave',
    warningHeaderMsg: 'connectors.policyEvaluations.warning',
    considerWarningAsError: false,
    skipGovernanceCheck: false
  }
}

export const getConnectorIdentifierWithScope = (scope: Scope, identifier: string): string => {
  return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${identifier}` : identifier
}
