/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState } from 'react'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'

import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

interface SecretManagersConnectors {
  secretsManager: ConnectorInfoDTO['type'][]
}

export const useGetSecretsManagerConnectorsHook = (): SecretManagersConnectors => {
  const { VAULT, AWS_KMS, AZURE_KEY_VAULT, AWS_SECRET_MANAGER, GCP_KMS, CUSTOM_SECRET_MANAGER, GcpSecretManager } =
    Connectors
  const [connectorsTypes, setConnectorsTypes] = useState<ConnectorInfoDTO['type'][]>([
    VAULT,
    AWS_KMS,
    AZURE_KEY_VAULT,
    AWS_SECRET_MANAGER,
    GCP_KMS,
    CUSTOM_SECRET_MANAGER
  ])

  const isGcpSMEnabled = useFeatureFlag(FeatureFlag.PL_ENABLE_GOOGLE_SECRET_MANAGER_IN_NG)

  if (isGcpSMEnabled && !connectorsTypes.includes(GcpSecretManager)) {
    setConnectorsTypes([...connectorsTypes, GcpSecretManager])
  }

  return {
    secretsManager: connectorsTypes
  }
}
