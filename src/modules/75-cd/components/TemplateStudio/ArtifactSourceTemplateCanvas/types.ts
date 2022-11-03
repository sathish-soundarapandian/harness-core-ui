/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ArtifactConfig, ConnectorConfigDTO } from 'services/cd-ng'

export interface ArtifactSourceConfigFormData {
  artifactType: ArtifactType
  connectorId: string | undefined | ConnectorConfigDTO
  artifactConfig: ArtifactConfig
}

export interface ArtifactSourceConfigDetails {
  type: ArtifactType
  spec: ArtifactConfig
}
