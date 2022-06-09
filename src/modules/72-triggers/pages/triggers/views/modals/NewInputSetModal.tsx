/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import css from './NewInputSetModal.module.scss'

interface NewInputSetModalProps {
  isModalOpen: boolean
  formikProps: any
  closeModal: () => void
}

const NewInputSetModal: React.FC<NewInputSetModalProps> = ({ isModalOpen, formikProps, closeModal }) => {
  const { values } = formikProps
  const { getString } = useStrings()

  const closeAndReset = () => {
    closeModal()
    // formikProps.setFieldValue('stages', undefined)
  }

  return (
    <Dialog
      className={cx(css.modal, 'padded-dialog')}
      isOpen={isModalOpen}
      enforceFocus={false}
      title="New Input Set" // i18n
      onClose={closeAndReset}
    >
      <EnhancedInputSetForm />
    </Dialog>
  )
}

export default NewInputSetModal
