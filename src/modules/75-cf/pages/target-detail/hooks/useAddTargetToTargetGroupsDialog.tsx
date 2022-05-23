/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import AddTargetToTargetGroupsDialog, {
  AddTargetToTargetGroupsDialogProps
} from '../components/LeftBar/TargetGroups/AddTargetToTargetGroupsDialog/AddTargetToTargetGroupsDialog'

const useAddTargetToTargetGroupsDialog = (
  target: AddTargetToTargetGroupsDialogProps['target'],
  onChange: AddTargetToTargetGroupsDialogProps['onChange'],
  modalTitle: string,
  addButtonText: AddTargetToTargetGroupsDialogProps['addButtonText'],
  instructionKind: AddTargetToTargetGroupsDialogProps['instructionKind']
): ReturnType<typeof useModalHook> => {
  const [openModal, hideModal] = useModalHook(
    () => (
      <AddTargetToTargetGroupsDialog
        target={target}
        hideModal={hideModal}
        onChange={onChange}
        modalTitle={modalTitle}
        addButtonText={addButtonText}
        instructionKind={instructionKind}
      />
    ),
    [target, onChange, modalTitle]
  )

  return [openModal, hideModal]
}

export default useAddTargetToTargetGroupsDialog
