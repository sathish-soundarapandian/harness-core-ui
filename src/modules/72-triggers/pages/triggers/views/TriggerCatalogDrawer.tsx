/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AddDrawer, PageSpinner, useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { useGetTriggerCatalog } from 'services/pipeline-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { DrawerContext, ItemInterface } from '@common/components/AddDrawer/AddDrawer'
import { getTriggerCategoryDrawerMapFromTriggerCatalogItem } from '../utils/TriggersListUtils'
import { getErrorMessage } from '../utils/TriggersWizardPageUtils'

type TTriggerCatalogDrawerProps = {
  hideDrawer: () => void
  onSelect: (item: ItemInterface) => void
}

const TriggerCatalogDrawer: React.FC<TTriggerCatalogDrawerProps> = ({ hideDrawer, onSelect }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()
  const {
    data: triggerCatalogData,
    error: triggerCatalogError,
    loading: triggerCatalogLoading
  } = useGetTriggerCatalog({ queryParams: { accountIdentifier: accountId } })

  useEffect(() => {
    if (triggerCatalogError) {
      showError(getErrorMessage(triggerCatalogError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerCatalogError])

  if (triggerCatalogLoading) {
    return <PageSpinner />
  }

  if (triggerCatalogData?.data?.catalog) {
    return (
      <AddDrawer
        addDrawerMap={getTriggerCategoryDrawerMapFromTriggerCatalogItem(getString, triggerCatalogData.data.catalog)}
        onSelect={onSelect}
        onClose={hideDrawer}
        drawerContext={DrawerContext.STUDIO}
      />
    )
  } else {
    hideDrawer()
    return null
  }
}

export default TriggerCatalogDrawer
