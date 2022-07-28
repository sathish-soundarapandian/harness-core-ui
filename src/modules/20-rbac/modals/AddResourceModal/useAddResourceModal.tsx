/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Dialog } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import RbacFactory from '@rbac/factories/RbacFactory'
import AddResourceModal from './views/AddResourceModal'
import css from './useAddResourceModal.module.scss'

export interface UseAddResourceModalProps {
  onSuccess: (resources: string[]) => void
}

export interface UseAddResourceModalReturn {
  openAddResourceModal: (resource: ResourceType, selectedItems: string[], isAttributeFilter: boolean) => void
  closeAddResourceModal: () => void
}

const useAddResourceModal = (props: UseAddResourceModalProps): UseAddResourceModalReturn => {
  const [resource, setResource] = useState<ResourceType>()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isAttributeFilter, setIsAttributeFilter] = useState<boolean>(false)
  const { getString } = useStrings()
  const { onSuccess } = props
  const resourceHandler = resource ? RbacFactory.getResourceTypeHandler(resource) : null
  const resourceLabel = resourceHandler ? getString(resourceHandler.label) : ''
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
        }}
        enforceFocus={false}
        className={cx(css.dialog)}
        title={
          isAttributeFilter
            ? `${getString('add')} ${resourceLabel} ${getString('common.types')}`
            : `${getString('add')} ${resourceLabel}`
        }
      >
        {resource && (
          <AddResourceModal
            resource={resource}
            isAttributeFilter={isAttributeFilter}
            onSuccess={resources => {
              onSuccess(resources)
              hideModal()
            }}
            selectedData={selectedItems}
            onClose={hideModal}
          />
        )}
      </Dialog>
    ),
    [resource, selectedItems, isAttributeFilter]
  )

  return {
    openAddResourceModal: (_resource: ResourceType, _selectedItems: string[], _isAttributeFilter: boolean) => {
      setResource(_resource)
      setSelectedItems(_selectedItems)
      setIsAttributeFilter(_isAttributeFilter)
      showModal()
    },
    closeAddResourceModal: hideModal
  }
}

export default useAddResourceModal
