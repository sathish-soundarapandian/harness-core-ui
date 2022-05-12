/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import type { ResourceGroupV2 } from 'services/resourcegroups'
import ResourceGroupModalFrom from './views/ResourceGroupModalForm'

export interface UseResourceGroupModalProps {
  onSuccess: (resourceGroup: ResourceGroupV2) => void
  onCloseModal?: () => void
}

export interface UseResourceGroupModalReturn {
  openResourceGroupModal: () => void
  closeResourceGroupModal: () => void
}

export const useResourceGroupModal = ({ onSuccess }: UseResourceGroupModalProps): UseResourceGroupModalReturn => {
  const [resourceGroupData, setResourceGroupData] = useState<ResourceGroupV2>()
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        title={
          resourceGroupData
            ? getString('rbac.resourceGroup.updateResourceGroupDialogTitle')
            : getString('rbac.resourceGroup.newResourceGroup')
        }
        onClose={hideModal}
      >
        <ResourceGroupModalFrom
          data={resourceGroupData}
          onSubmit={resourceGroup => {
            onSuccess(resourceGroup)
            hideModal()
          }}
          onCancel={hideModal}
          editMode={!!resourceGroupData}
        />
      </Dialog>
    ),
    [resourceGroupData, onSuccess]
  )
  const open = useCallback(
    (_resourceGroup?: ResourceGroupV2) => {
      setResourceGroupData(_resourceGroup)
      showModal()
    },
    [showModal]
  )
  return {
    openResourceGroupModal: (resourceGroup?: ResourceGroupV2) => open(resourceGroup),
    closeResourceGroupModal: hideModal
  }
}
