/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikContextType } from 'formik'
import type { RowData } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { HealthSource, MonitoredServiceDTO } from 'services/cv'
import type { MonitoredServiceForm } from '../../Service.types'

export function createOpenHealthSourceTableProps({
  formik,
  tableData,
  isEdit,
  rowData
}: {
  formik: FormikContextType<MonitoredServiceForm>
  isEdit: boolean
  rowData: RowData | null
  tableData: HealthSource[]
}): {
  isEdit: boolean
  rowData: RowData | null
  serviceRef: string
  environmentRef: string
  monitoredServiceRef: {
    name: string
    identifier: string
  }
  tableData: HealthSource[]
  monitoredServiceType: MonitoredServiceDTO['type']
} {
  return {
    isEdit,
    rowData,
    serviceRef: formik?.values.serviceRef,
    environmentRef: formik?.values.environmentRef || '',
    monitoredServiceRef: {
      name: formik?.values.name,
      identifier: formik?.values.identifier
    },
    tableData,
    monitoredServiceType: formik.values.type
  }
}
