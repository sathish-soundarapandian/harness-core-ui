/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { AddDrawer, PageSpinner, useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { useGetTriggerCatalog } from 'services/pipeline-ng'
import type { GitQueryParams, OrgPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DrawerContext, ItemInterface } from '@common/components/AddDrawer/AddDrawer'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { getTriggerCategoryDrawerMapFromTriggerCatalogItem } from '../utils/TriggersListUtils'
import { TriggerTypes } from '../utils/TriggersWizardPageUtils'

type TTriggerCatalogDrawerProps = {
  hideDrawer: () => void
}

const TriggerCatalogDrawer: React.FC<TTriggerCatalogDrawerProps> = ({ hideDrawer }) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier, module } =
    useParams<PipelineType<OrgPathProps & PipelinePathProps>>()
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const { showError } = useToaster()
  const {
    data: triggerCatalogData,
    error: triggerCatalogError,
    loading: triggerCatalogLoading
  } = useGetTriggerCatalog({ queryParams: { accountIdentifier: accountId } })

  const onSelect = ({ categoryValue, value }: ItemInterface): void => {
    if (categoryValue) {
      hideDrawer()
      history.push(
        routes.toTriggersWizardPage({
          accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier,
          triggerIdentifier: 'new', // new is a reserved identifier
          triggerType: categoryValue,
          sourceRepo: (categoryValue === TriggerTypes.WEBHOOK && value) || undefined,
          manifestType: (categoryValue === TriggerTypes.MANIFEST && value) || undefined,
          artifactType: (categoryValue === TriggerTypes.ARTIFACT && value) || undefined,
          scheduleType: (categoryValue === TriggerTypes.SCHEDULE && value) || undefined,
          module,
          repoIdentifier,
          connectorRef,
          repoName,
          branch,
          storeType
        })
      )
    }
  }

  useEffect(() => {
    if (triggerCatalogError) {
      showError(triggerCatalogError.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerCatalogError])

  if (triggerCatalogLoading) {
    return <PageSpinner />
  }

  if (triggerCatalogData?.data?.catalog) {
    return (
      <AddDrawer
        addDrawerMap={getTriggerCategoryDrawerMapFromTriggerCatalogItem(getString, triggerCatalogData.data?.catalog)}
        onSelect={onSelect}
        onClose={hideDrawer}
        drawerContext={DrawerContext.STUDIO}
        drawerProps={{ isOpen: true }}
      />
    )
  } else {
    hideDrawer()
    return null
  }
}

export default TriggerCatalogDrawer
