/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'

export interface SLONameProps<T> {
  children?: JSX.Element
  formikProps: FormikProps<T>
  identifier?: string
  monitoredServicesLoading?: boolean
  monitoredServicesOptions?: SelectOption[]
  fetchingMonitoredServices?: () => void
  isMultiSelect?: boolean
}

export interface ServiceAndEnv {
  environmentRef: string
  serviceRef: string
  type: string
}
