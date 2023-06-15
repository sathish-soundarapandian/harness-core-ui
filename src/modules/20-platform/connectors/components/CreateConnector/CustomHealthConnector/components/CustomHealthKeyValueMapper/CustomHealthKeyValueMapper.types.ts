/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ConnectorConfigDTO } from 'services/cv'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'

export interface CustomHealthKeyValueMapperProps {
  name: string
  formik: FormData
  prevStepData: ConnectorConfigDTO
  addRowButtonLabel: string
  className?: string
}
