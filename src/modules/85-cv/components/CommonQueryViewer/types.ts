/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { IDrawerProps, Position } from '@blueprintjs/core'
import type { TextAreaProps } from '@harness/uicore/dist/components/FormikForm/FormikForm'
import type { TimeSeriesSampleDTO } from 'services/cv'
import type { RecordsProps } from '../Records/types'

export interface QueryContentProps {
  handleFetchRecords: () => void
  query?: string
  loading?: boolean
  isDialogOpen?: boolean
  onEditQuery?: () => void
  textAreaProps?: TextAreaProps['textArea']
  onClickExpand?: (isOpen: boolean) => void
  isAutoFetch?: boolean
  mandatoryFields?: any[]
  staleRecordsWarning?: string
  textAreaPlaceholder?: string
  isTemplate?: boolean
  expressions?: string[]
  isConnectorRuntimeOrExpression?: boolean
  fetchButtonText?: string
  isFetchButtonDisabled?: boolean
  isQueryButtonDisabled: boolean
  runQueryBtnTooltip: string
}

export interface CommonQueryViewerProps {
  isManualQuery?: boolean
  className?: string
  records?: TimeSeriesSampleDTO[]
  loading: boolean
  error: any
  query: string
  isQueryExecuted?: boolean
  postFetchingRecords?: () => void
  fetchRecords: () => void
  queryInputs?: Array<any>
  queryNotExecutedMessage?: string
  queryTextAreaProps?: TextAreaProps['textArea']
  queryContentMandatoryProps?: any[]
  dataTooltipId?: string
  isConnectorRuntimeOrExpression?: boolean
  queryTextareaName?: string
  querySectionTitle?: string
  queryFieldIdentifier?: string
}

export interface CommonQueryViewDialogProps extends RecordsProps {
  onHide: () => void
  isManualQuery?: boolean
  query?: string
  fetchRecords: () => void
  isOpen: boolean
  isQueryButtonDisabled: boolean
  runQueryBtnTooltip: string
}

export const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: false,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '70%'
}
