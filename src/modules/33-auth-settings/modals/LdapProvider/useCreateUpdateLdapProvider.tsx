/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { Button, Dialog } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { cloneDeep } from 'lodash-es'
import CreateUpdateLdapWizard from '@auth-settings/components/CreateUpdateLdapWizard/CreateUpdateLdapWizard'
import type { LDAPSettings } from 'services/cd-ng'
import css from './useCreateUpdateLdapProvider.module.scss'

export interface useLdapProviderModalProps {
  onSuccess: () => void
}

export interface useLdapProviderModalReturn {
  openLdapModal: (_ldapSettings?: LDAPSettings) => void
  closeLdapModal: () => void
}

const useCreateUpdateLdapProvider = ({ onSuccess }: useLdapProviderModalProps): useLdapProviderModalReturn => {
  const closeModal = (): void => {
    hideModal()
  }
  const [ldapSettings, setLdapSettings] = React.useState<LDAPSettings | undefined>()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} enforceFocus={false} onClose={closeModal} className={css.dialog}>
        <CreateUpdateLdapWizard
          onSuccess={onSuccess}
          isEdit={!!ldapSettings}
          ldapSettings={cloneDeep(ldapSettings)}
          closeWizard={closeModal}
        ></CreateUpdateLdapWizard>
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={closeModal}
          className={css.crossIcon}
          data-testId={ldapSettings ? 'close-ldap-edit-wizard' : 'close-ldap-setup-wizard'}
        />
      </Dialog>
    ),
    [ldapSettings]
  )

  return {
    openLdapModal: (_ldapSettings?: LDAPSettings) => {
      setLdapSettings(_ldapSettings)
      showModal()
    },
    closeLdapModal: hideModal
  }
}

export default useCreateUpdateLdapProvider
