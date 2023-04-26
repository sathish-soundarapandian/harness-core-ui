/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  ExpandingSearchInput,
  ListHeader,
  sortByCreated,
  sortByName,
  SortMethod
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { useParams, useHistory } from 'react-router-dom'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { GetTriggerListForTargetQueryParams, useGetTriggerListForTarget } from 'services/pipeline-ng'
import { useGetListOfBranchesWithStatus } from 'services/cd-ng'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { AddDrawer } from '@common/components'
import { DrawerContext } from '@common/components/AddDrawer/AddDrawer'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { getErrorMessage } from '@triggers/components/Triggers/utils'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'

import { TriggersListSection, GoToEditWizardInterface } from './TriggersListSection'
import { TriggerTypes } from '../utils/TriggersWizardPageUtils'
import { getCategoryItems, ItemInterface, TriggerDataInterface } from '../utils/TriggersListUtils'
import TriggerCatalogDrawer from './TriggerCatalogDrawer'
import css from './TriggersList.module.scss'

interface TriggersListPropsInterface {
  onNewTriggerClick: (val: TriggerDataInterface) => void
  isPipelineInvalid?: boolean
  gitAwareForTriggerEnabled?: boolean
}

export default function TriggersList(props: TriggersListPropsInterface & GitQueryParams): JSX.Element {
  const { onNewTriggerClick, isPipelineInvalid, gitAwareForTriggerEnabled } = props
  const { preference: sortPreference = SortMethod.Newest, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.TriggersPage}`)
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const {
    branch,
    repoIdentifier,
    connectorRef,
    repoName,
    storeType,
    page = DEFAULT_PAGE_INDEX,
    size = PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE,
    searchTerm
  } = useQueryParams<GitQueryParams & Pick<GetTriggerListForTargetQueryParams, 'page' | 'size' | 'searchTerm'>>()
  const { CD_TRIGGER_V2, CD_TRIGGER_CATALOG_API_ENABLED, CDS_GOOGLE_CLOUD_FUNCTION, BAMBOO_ARTIFACT_NG } =
    useFeatureFlags()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps>>()
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<Pick<GetTriggerListForTargetQueryParams, 'page' | 'searchTerm'>>()

  const {
    data: triggerListResponse,
    error: triggerListDataLoadingError,
    refetch: fetchTriggerList,
    loading: triggerListDataLoading
  } = useGetTriggerListForTarget({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier,
      searchTerm,
      size,
      page,
      sort: [sortPreference]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' }
  })

  const triggerList = triggerListResponse?.data?.content || undefined
  const history = useHistory()
  const [isEditable] = usePermission(
    {
      resourceScope: {
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const { data: branchesWithStatusData, refetch: getDefaultBranchName } = useGetListOfBranchesWithStatus({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      yamlGitConfigIdentifier: repoIdentifier,
      page: 0,
      size: 20
    },
    lazy: true
  })

  // should be disabled when project is git sync enabled & the branch in the URL is not the default branch name
  const [incompatibleGitSyncBranch, setIncompatibleGitSyncBranch] = React.useState(false)

  React.useEffect(() => {
    if (repoIdentifier) {
      getDefaultBranchName()
    }
  }, [repoIdentifier])

  React.useEffect(() => {
    if (
      branchesWithStatusData?.data?.defaultBranch &&
      branchesWithStatusData?.data?.defaultBranch?.branchName !== branch
    ) {
      setIncompatibleGitSyncBranch(true)
    } else {
      setIncompatibleGitSyncBranch(false)
    }
  }, [branchesWithStatusData, branch])

  const goToEditWizard = ({ triggerIdentifier, triggerType }: GoToEditWizardInterface): void => {
    history.push(
      routes.toTriggersWizardPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        triggerType,
        module,
        repoIdentifier,
        branch,
        connectorRef,
        repoName,
        storeType
      })
    )
  }
  const goToDetails = ({ triggerIdentifier }: GoToEditWizardInterface): void => {
    /* istanbul ignore next */
    history.push(
      routes.toTriggersDetailPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        module,
        repoIdentifier,
        branch,
        connectorRef,
        repoName,
        storeType
      })
    )
  }

  const [openDrawer, hideDrawer] = useModalHook(() => {
    /* istanbul ignore next */
    const onSelect = (val: ItemInterface): void => {
      if (val?.categoryValue) {
        hideDrawer()
        onNewTriggerClick({
          triggerType: val.categoryValue,
          sourceRepo: (val.categoryValue === TriggerTypes.WEBHOOK && val.value) || undefined,
          artifactType: (val.categoryValue === TriggerTypes.ARTIFACT && val.value) || undefined,
          manifestType: (val.categoryValue === TriggerTypes.MANIFEST && val.value) || undefined,
          scheduleType: (val.categoryValue === TriggerTypes.SCHEDULE && val.value) || undefined
        })
      }
    }

    if (CD_TRIGGER_CATALOG_API_ENABLED) {
      return <TriggerCatalogDrawer hideDrawer={hideDrawer} onSelect={onSelect} />
    }

    return (
      <AddDrawer
        addDrawerMap={getCategoryItems(getString, false, CD_TRIGGER_V2, CDS_GOOGLE_CLOUD_FUNCTION, BAMBOO_ARTIFACT_NG)}
        onSelect={onSelect}
        onClose={hideDrawer}
        drawerContext={DrawerContext.STUDIO}
      />
    )
  })
  const buttonProps = incompatibleGitSyncBranch
    ? {
        tooltip: getString('triggers.tooltip.defaultGitSyncBranchOnly')
      }
    : {}

  return (
    <>
      <HelpPanel referenceId="triggers" type={HelpPanelType.FLOATING_CONTAINER} />
      <Page.SubHeader>
        <Button
          disabled={!isEditable || incompatibleGitSyncBranch || isPipelineInvalid}
          tooltip={isPipelineInvalid ? getString('pipeline.cannotAddTriggerInvalidPipeline') : ''}
          text={getString('triggers.newTrigger')}
          variation={ButtonVariation.PRIMARY}
          onClick={openDrawer}
          {...buttonProps}
        ></Button>
        <ExpandingSearchInput
          alwaysExpanded
          placeholder={getString('search')}
          onChange={text => {
            updateQueryParams(text ? { searchTerm: text, page: DEFAULT_PAGE_INDEX } : { searchTerm: undefined })
          }}
          defaultValue={searchTerm}
          className={css.searchWrapper}
          throttle={300}
        />
      </Page.SubHeader>

      <Page.Body
        loading={triggerListDataLoading}
        error={getErrorMessage(triggerListDataLoadingError)}
        retryOnError={() => fetchTriggerList()}
        noData={
          !searchTerm
            ? {
                when: () => (Array.isArray(triggerList) && triggerList.length === 0) || incompatibleGitSyncBranch,
                icon: 'yaml-builder-trigger',
                message: getString('triggers.aboutTriggers'),
                buttonText: getString('triggers.addNewTrigger'),
                onClick: openDrawer,
                buttonDisabled: !isEditable || incompatibleGitSyncBranch || isPipelineInvalid,
                buttonDisabledTooltip: isPipelineInvalid ? getString('pipeline.cannotAddTriggerInvalidPipeline') : ''
              }
            : {
                when: () => Array.isArray(triggerList) && triggerList.length === 0,
                icon: 'yaml-builder-trigger',
                message: getString('triggers.noTriggersFound')
              }
        }
      >
        <ListHeader
          selectedSortMethod={sortPreference}
          sortOptions={[...sortByCreated, ...sortByName]}
          onSortMethodChange={option => {
            setSortPreference(option.value as SortMethod)
            updateQueryParams({ page: DEFAULT_PAGE_INDEX })
          }}
          totalCount={triggerListResponse?.data?.totalItems}
          className={css.listHeader}
        />
        <TriggersListSection
          triggerListData={triggerListResponse?.data}
          refetchTriggerList={fetchTriggerList}
          goToEditWizard={goToEditWizard}
          goToDetails={goToDetails}
          isPipelineInvalid={isPipelineInvalid}
          gitAwareForTriggerEnabled={gitAwareForTriggerEnabled}
        />
      </Page.Body>
    </>
  )
}
