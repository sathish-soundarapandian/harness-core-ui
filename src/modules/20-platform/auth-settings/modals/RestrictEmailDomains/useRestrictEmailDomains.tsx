/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import RestrictEmailDomainsForm from './views/RestrictEmailDomainsForm'
import css from './useRestrictEmailDomains.module.scss'

interface Props {
  onSuccess: () => void
  whitelistedDomains: string[]
}
interface ModalReturn {
  openRestrictEmailDomainsModal: () => void
  closeRestrictEmailDomainsModal: () => void
}

export const useRestrictEmailDomains = ({ onSuccess, whitelistedDomains }: Props): ModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <RestrictEmailDomainsForm
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={() => {
            hideModal()
          }}
          whitelistedDomains={whitelistedDomains}
        />
      </Dialog>
    ),
    [whitelistedDomains]
  )

  return {
    openRestrictEmailDomainsModal: showModal,
    closeRestrictEmailDomainsModal: hideModal
  }
}
