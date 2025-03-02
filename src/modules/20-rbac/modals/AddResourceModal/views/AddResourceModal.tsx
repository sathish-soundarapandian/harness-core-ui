/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Container,
  DropDown,
  ExpandingSearchInput,
  Layout,
  sortByCreated,
  sortByLastModified,
  sortByName,
  SortMethod
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Page } from '@common/exports'
import css from './AddResourceModal.module.scss'

interface RoleModalData {
  resource: ResourceType
  selectedData: string[]
  isAttributeFilter: boolean
  onSuccess: (resources: string[]) => void
  onClose: () => void
}

const AddResourceModal: React.FC<RoleModalData> = ({
  resource,
  onSuccess,
  onClose,
  selectedData,
  isAttributeFilter
}) => {
  const resourceHandler = RbacFactory.getResourceTypeHandler(resource)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortMethod, setSortMethod] = useState<SortMethod>(SortMethod.Newest)
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedData)

  if (!resourceHandler) return <Page.Error />
  const ctaLabelVars = {
    count: selectedItems.length,
    resource: resourceHandler.labelSingular
      ? getString(resourceHandler.labelSingular)
      : getString(resourceHandler.label)
  }
  const ctaLabelForAttr =
    selectedItems.length === 1
      ? getString('rbac.addResourceModal.modalCtaLabelSingular', ctaLabelVars)
      : getString('rbac.addResourceModal.modalCtaLabelPlural', ctaLabelVars)
  const ctaLabel = `${getString('add')} ${selectedItems.length} ${
    resource === ResourceType['DASHBOARDS']
      ? getString(resourceHandler.labelOverride || 'dashboards.homePage.folders')
      : getString(resourceHandler.label)
  } `
  const addModalBody = isAttributeFilter
    ? resourceHandler?.addAttributeModalBody?.({
        onSelectChange: items => {
          setSelectedItems(items)
        },
        selectedData: selectedItems,
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      })
    : resourceHandler?.addResourceModalBody?.({
        searchTerm,
        sortMethod,
        onSelectChange: items => {
          setSelectedItems(items)
        },
        selectedData: selectedItems,
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      })

  return (
    <Layout.Vertical padding="xsmall">
      <Layout.Vertical>
        {!isAttributeFilter && (
          <Layout.Horizontal spacing="small">
            <ExpandingSearchInput
              alwaysExpanded
              onChange={text => {
                setSearchTerm(text.trim())
              }}
              className={css.searchInput}
            />
            {resourceHandler.resourceModalSortingEnabled ? (
              <DropDown
                onChange={option => setSortMethod(option.value as SortMethod)}
                icon="main-sort"
                items={[...sortByCreated, ...sortByLastModified, ...sortByName]}
                filterable={false}
                value={sortMethod}
              />
            ) : null}
          </Layout.Horizontal>
        )}
        <Container className={css.modal}>{addModalBody}</Container>
        <Layout.Horizontal spacing="small">
          <Button
            variation={ButtonVariation.PRIMARY}
            text={isAttributeFilter ? ctaLabelForAttr : ctaLabel}
            onClick={() => onSuccess(selectedItems)}
          />
          <Button text={getString('cancel')} onClick={onClose} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AddResourceModal
