/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IDialogProps } from '@blueprintjs/core'

export interface InputWithDynamicModalForJsonProps {
  onChange: (name: string, value: string) => void
  isQueryExecuted: boolean
  isDisabled: boolean
  sampleRecord: Record<string, any> | null
  inputLabel: string
  inputName: string
  noRecordModalHeader?: string
  noRecordInputLabel?: string
  recordsModalHeader: string
  fieldValue: string
  showExactJsonPath?: boolean
  dataTooltipId?: string
  isMultiType?: boolean
}

export const DialogProps: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 600, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

export type NoRecordForm = {
  name: string
}
