/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { ConnectorReferenceFieldProps } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

export type MapType = { [key: string]: string }
export type MultiTypeMapType = MapType | string
export type MapUIType = { id: string; key: string; value: string }[]
export type MultiTypeMapUIType = MapUIType | string
export type ListType = string[]
export type MultiTypeListType = ListType | string
export type ListUIType = { id: string; value: string }[]
export type MultiTypeListUIType = ListUIType | string
export type PullOption = 'ifNotExists' | 'never' | 'always'
export type MultiTypePullOption = PullOption | string
export type ArchiveFormatOption = 'Tar' | 'Gzip'
export type MultiTypeArchiveFormatOption = ArchiveFormatOption | string
export type ConnectorRef = ConnectorReferenceFieldProps['selected']
export type MultiTypeConnectorRef = ConnectorRef | string
export { SelectOption }
export type MultiTypeSelectOption = SelectOption | string
export interface Limits {
  memory?: string
  cpu?: string
}
export interface Resources {
  limits?: Limits
}
