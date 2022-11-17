/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import type { ServiceAccountDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import ServiceAccountForm from './views/ServiceAccountForm'

export interface useServiceAccountModalProps {
  onSuccess: (serviceAccount: ServiceAccountDTO) => void
  onCloseModal?: () => void
}

export interface useServiceAccountModalReturn {
  openServiceAccountModal: (serviceAccount?: ServiceAccountDTO) => void
  closeServiceAccountModal: () => void
}

export const useServiceAccountModal = ({ onSuccess }: useServiceAccountModalProps): useServiceAccountModalReturn => {
  const [serviceAccountData, setServiceAccountData] = useState<ServiceAccountDTO>()
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideModal}
        title={
          serviceAccountData
            ? getString('rbac.serviceAccounts.form.editServiceAccount')
            : getString('rbac.serviceAccounts.newServiceAccount')
        }
      >
        <ServiceAccountForm
          data={serviceAccountData}
          isEdit={!!serviceAccountData}
          onClose={hideModal}
          onSubmit={serviceAccount => {
            onSuccess(serviceAccount)
            hideModal()
          }}
        />
      </Dialog>
    ),
    [serviceAccountData]
  )
  const open = useCallback(
    (_serviceAccount?: ServiceAccountDTO) => {
      setServiceAccountData(_serviceAccount)
      showModal()
    },
    [showModal]
  )

  return {
    openServiceAccountModal: open,
    closeServiceAccountModal: hideModal
  }
}
