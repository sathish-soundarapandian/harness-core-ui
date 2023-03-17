/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'

export interface OrgAccountLevelServiceEnvFieldProps {
  isTemplate: boolean
  serviceOnSelect: (service: SelectOption) => void
  environmentOnSelect: (environment: SelectOption) => void
}

export interface onChangeProps {
  // type is any in the parent onChange
  value: any
  isTemplate: boolean
  onSuccess:
    | OrgAccountLevelServiceEnvFieldProps['serviceOnSelect']
    | OrgAccountLevelServiceEnvFieldProps['environmentOnSelect']
}

export interface ServiceEnvModalProps {
  service: {
    isModalOpen: boolean
    closeModal: () => void
    onSelect: OrgAccountLevelServiceEnvFieldProps['serviceOnSelect']
  }
  environment: {
    isModalOpen: boolean
    closeModal: () => void
    onSelect: OrgAccountLevelServiceEnvFieldProps['environmentOnSelect']
  }
}
