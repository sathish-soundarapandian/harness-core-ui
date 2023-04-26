/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Dialog } from '@blueprintjs/core'
import type { ResponseInputSetResponse } from 'services/pipeline-ng'
import type { InputSetDTO } from '@pipeline/utils/types'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import InputSetFormV1 from '@pipeline/v1/components/InputSetFormV1/InputSetFormV1'
import css from './InputSetForm.module.scss'

export interface NewInputSetModalProps {
  inputSetInitialValue?: InputSetDTO
  isModalOpen: boolean
  closeModal: () => void
  onCreateSuccess: (response: ResponseInputSetResponse) => void
  isSimplifiedYAML?: boolean
}

export default React.memo(function NewInputSetModal({
  inputSetInitialValue,
  isModalOpen,
  closeModal,
  onCreateSuccess,
  isSimplifiedYAML
}: NewInputSetModalProps): React.ReactElement {
  return (
    <Dialog
      title=""
      isCloseButtonShown
      className={cx(css.inModal, 'padded-dialog')}
      isOpen={isModalOpen}
      enforceFocus={false}
      onClose={() => {
        closeModal()
      }}
    >
      {isSimplifiedYAML ? (
        <InputSetFormV1
          isNewInModal
          className={css.formInModal}
          onCancel={closeModal}
          onCreateSuccess={response => {
            closeModal()
            onCreateSuccess(response)
          }}
        />
      ) : (
        <EnhancedInputSetForm
          inputSetInitialValue={inputSetInitialValue}
          isNewInModal
          className={css.formInModal}
          onCancel={closeModal}
          onCreateSuccess={response => {
            closeModal()
            onCreateSuccess(response)
          }}
        />
      )}
    </Dialog>
  )
})
