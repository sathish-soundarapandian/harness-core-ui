/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepProps } from '@common/components/WizardWithProgress/WizardWithProgress'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'

export interface ConnectionConfigProps extends StepProps<ConnectorConfigDTO> {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  isEditMode: boolean
  identifier?: string
  connectorInfo?: ConnectorInfoDTO | void
}
