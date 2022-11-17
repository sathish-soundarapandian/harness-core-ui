/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import type { AccessPoint } from 'services/lw'
import { PROVIDER_TYPES } from '@ce/constants'
import LoadBalancerDnsConfig from '../COGatewayAccess/LoadBalancerDnsConfig'
import AzureAPConfig from './AzureAPConfig'
import GCPAccessPointConfig from '../AccessPoint/GCPAccessPoint/GCPAccessPointConfig'

interface UseEditAccessPointProps {
  onUpdate?: (updatedAccessPoint: AccessPoint) => void
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    padding: 40,
    position: 'relative',
    minHeight: 500
  }
}

const useEditAccessPoint = (props: UseEditAccessPointProps) => {
  const [apToEdit, setApToEdit] = useState<AccessPoint>()
  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <>
          {apToEdit?.type === PROVIDER_TYPES.AWS ? (
            <LoadBalancerDnsConfig
              loadBalancer={apToEdit}
              cloudAccountId={apToEdit.cloud_account_id}
              onClose={closeModal}
              mode={'edit'}
              onSave={props.onUpdate}
            />
          ) : apToEdit?.type === PROVIDER_TYPES.AZURE ? (
            <AzureAPConfig
              cloudAccountId={apToEdit.cloud_account_id}
              onSave={lb => props.onUpdate?.(lb)}
              mode={'edit'}
              onClose={closeModal}
              loadBalancer={apToEdit}
            />
          ) : apToEdit?.type === PROVIDER_TYPES.GCP ? (
            <GCPAccessPointConfig
              cloudAccountId={apToEdit.cloud_account_id}
              onSave={lb => props.onUpdate?.(lb)}
              mode={'edit'}
              onClose={closeModal}
              loadBalancer={apToEdit}
            />
          ) : null}
        </>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            closeModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    ),
    [apToEdit]
  )
  return {
    openEditAccessPointModal: (accessPoint: AccessPoint) => {
      setApToEdit(accessPoint)
      openModal()
    }
  }
}

export default useEditAccessPoint
