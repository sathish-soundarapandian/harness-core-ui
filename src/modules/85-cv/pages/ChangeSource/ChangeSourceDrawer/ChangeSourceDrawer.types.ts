/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import type {
  ChangeSourceDTO,
  HarnessCDCurrentGenChangeSourceSpec,
  MonitoredServiceDTO,
  PagerDutyChangeSourceSpec
} from 'services/cv'

export interface UpdatedChangeSourceDTO extends Omit<ChangeSourceDTO, 'spec'> {
  spec: PagerDutyChangeSourceSpec | HarnessCDCurrentGenChangeSourceSpec
}

export interface ChangeSoureDrawerInterface {
  isEdit: boolean
  rowdata: UpdatedChangeSourceDTO
  tableData: UpdatedChangeSourceDTO[]
  onSuccess: (value: UpdatedChangeSourceDTO[]) => void
  hideDrawer?: () => void
  monitoredServiceType?: MonitoredServiceDTO['type']
}
export interface CardSelectOption extends Item {
  category?: string
  string?: string
}

export interface ChangeSourceProps {
  formik: FormikProps<UpdatedChangeSourceDTO>
  isEdit?: boolean
}
