/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, MultiTypeInputType } from '@harness/uicore'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export interface MapQueriesToHarnessServiceLayoutProps {
  formikProps: any
  connectorIdentifier: any
  onChange: (name: string, value: string | SelectOption | boolean) => void
  isTemplate?: boolean
  expressions?: string[]
  isConnectorRuntimeOrExpression?: boolean
}

export interface MultiTextOrSelectInputProps {
  options: SelectOption[]
  connectorIdentifier?: string
  formikAppDynamicsValue?: string
  setFieldValue: (field: string, value: string) => void
  isTemplate?: boolean
  expressions?: string[]
  allowedTypes: AllowedTypes
  applicationError?: string | string[]
  appdMultiType: MultiTypeInputType
  setAppdMultiType: React.Dispatch<React.SetStateAction<MultiTypeInputType>>
  areOptionsLoading?: boolean
  handleSelectChange: () => void
  value?: SelectOption
  label: string
  placeholder: string
  name: string
}
