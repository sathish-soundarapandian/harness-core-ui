/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  Icon,
  Layout,
  PageError,
  PageSpinner,
  Popover
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Error, ResponsePageSecretResponseWrapper, useListSecretsV2 } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { Page } from '@common/exports'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, SecretActions } from '@common/constants/TrackingConstants'
import { getPrincipalScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useCreateWinRmCredModal } from '@secrets/modals/CreateWinRmCredModal/useCreateWinRmCredModal'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { sortByCreated, sortByLastModified, sortByName, SortMethod } from '@common/utils/sortUtils'
import ListHeader from '@common/components/ListHeader/ListHeader'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { usePermission } from '@rbac/hooks/usePermission'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import SecretsList from './views/SecretsListView/SecretsList'
import SecretEmptyState from './secrets-empty-state.png'
import { SECRETS_DEFAULT_PAGE_INDEX, SECRETS_DEFAULT_PAGE_SIZE } from './Constants'

import css from './SecretsPage.module.scss'

interface CreateSecretBtnProp {
  size?: ButtonSize
}
interface SecretsPageProps {
  mock?: UseGetMockData<ResponsePageSecretResponseWrapper>
}

const SecretsPage: React.FC<SecretsPageProps> = ({ mock }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const scope = getPrincipalScopeFromDTO({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })
  const history = useHistory()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const { page: pageIndex, size: pageSize } = useQueryParams<CommonPaginationQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<CommonPaginationQueryParams>()
  const { preference: sortPreference = SortMethod.LastModifiedDesc, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.SecretsPage}`)
  useDocumentTitle(getString('common.secrets'))

  const {
    data: secretsResponse,
    loading,
    error,
    refetch
  } = useListSecretsV2({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm,
      pageIndex: pageIndex ?? SECRETS_DEFAULT_PAGE_INDEX,
      pageSize: pageSize ?? (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : SECRETS_DEFAULT_PAGE_SIZE),
      orgIdentifier,
      projectIdentifier,
      sortOrders: [sortPreference]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' },
    debounce: 300,
    mock
  })

  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: /* istanbul ignore next */ () => {
      refetch()
    }
  })
  const { openCreateSSHCredModal } = useCreateSSHCredModal({
    onSuccess: /* istanbul ignore next */ () => {
      refetch()
    }
  })
  const { openCreateWinRmCredModal } = useCreateWinRmCredModal({
    onSuccess: /* istanbul ignore next */ () => {
      refetch()
    }
  })
  const [canCreateSecret] = usePermission(
    {
      permissions: [PermissionIdentifier.UPDATE_SECRET],
      resource: {
        resourceType: ResourceType.SECRET
      }
    },
    []
  )

  const CreateSecretBtn: React.FC<CreateSecretBtnProp> = ({ size }) => {
    return (
      <Button
        intent="primary"
        text={getString('createSecretYAML.newSecret')}
        icon="plus"
        rightIcon="chevron-down"
        size={size}
        disabled={!canCreateSecret}
        tooltip={<RBACTooltip permission={PermissionIdentifier.UPDATE_SECRET} resourceType={ResourceType.SECRET} />}
        tooltipProps={{
          disabled: canCreateSecret
        }}
        variation={ButtonVariation.PRIMARY}
      />
    )
  }
  const CreateSecretBtnMenu: React.FC = () => {
    useTrackEvent(SecretActions.StartCreateSecret, {
      category: Category.SECRET
    })

    return (
      <Menu large>
        <Menu.Item
          labelClassName="menu-item-label"
          text={getString('secrets.secret.labelText')}
          labelElement={<Icon name="text" />}
          onClick={/* istanbul ignore next */ () => openCreateSecretModal('SecretText')}
        />
        <Menu.Item
          labelClassName="menu-item-label"
          text={getString('secrets.secret.labelFile')}
          labelElement={<Icon name="document" color={Color.BLUE_600} />}
          onClick={/* istanbul ignore next */ () => openCreateSecretModal('SecretFile')}
        />
        <Menu.Item
          labelClassName="menu-item-label"
          text={getString('ssh.sshCredential')}
          labelElement={<Icon name="secret-ssh" />}
          onClick={/* istanbul ignore next */ () => openCreateSSHCredModal()}
        />
        <Menu.Item
          labelClassName="menu-item-label"
          text={getString('secrets.typeWinRM')}
          labelElement={<Icon name="command-winrm" />}
          onClick={/* istanbul ignore next */ () => openCreateWinRmCredModal()}
        />
      </Menu>
    )
  }
  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: getString('common.secrets'),
              [Scope.ORG]: getString('secrets.secretsTitle'),
              [Scope.ACCOUNT]: getString('secrets.secretsTitle')
            }}
          />
        }
      />

      {secretsResponse?.data?.content?.length || searchTerm || loading || error ? (
        <Layout.Horizontal flex className={css.header}>
          <Layout.Horizontal spacing="small">
            <Popover
              minimal
              position={Position.BOTTOM_LEFT}
              interactionKind={PopoverInteractionKind.CLICK}
              disabled={!canCreateSecret}
            >
              <CreateSecretBtn />
              <CreateSecretBtnMenu />
            </Popover>

            <RbacButton
              text={getString('createViaYaml')}
              minimal
              onClick={
                /* istanbul ignore next */ () => {
                  history.push(routes.toCreateSecretFromYaml({ accountId, orgIdentifier, projectIdentifier, module }))
                }
              }
              permission={{
                permission: PermissionIdentifier.UPDATE_SECRET,
                resource: {
                  resourceType: ResourceType.SECRET
                },
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                }
              }}
              variation={ButtonVariation.SECONDARY}
            />
          </Layout.Horizontal>
          <ExpandingSearchInput
            alwaysExpanded
            onChange={text => {
              setSearchTerm(text.trim())
              updateQueryParams({ page: 0 })
            }}
            width={250}
          />
        </Layout.Horizontal>
      ) : null}

      <Page.Body
        className={css.body}
        noData={{
          when: () => !loading && !secretsResponse?.data?.content?.length,
          image: SecretEmptyState,
          message: searchTerm
            ? getString('secrets.secret.noSecretsFound')
            : getString('secrets.noSecrets', { resourceName: scope }),
          button: !searchTerm ? (
            <Popover minimal position={Position.BOTTOM_LEFT} interactionKind={PopoverInteractionKind.CLICK}>
              <CreateSecretBtn size={ButtonSize.LARGE} />
              <CreateSecretBtnMenu />
            </Popover>
          ) : undefined
        }}
      >
        {loading ? (
          <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
            <PageSpinner />
          </div>
        ) : error ? (
          <div style={{ paddingTop: '200px' }}>
            <PageError
              message={(error.data as Error)?.message || error.message}
              onClick={/* istanbul ignore next */ () => refetch()}
            />
          </div>
        ) : !secretsResponse?.data?.empty ? (
          <>
            <ListHeader
              selectedSortMethod={sortPreference}
              sortOptions={[...sortByLastModified, ...sortByCreated, ...sortByName]}
              onSortMethodChange={option => {
                setSortPreference(option.value as SortMethod)
              }}
              totalCount={secretsResponse?.data?.totalItems}
            />
            <SecretsList secrets={secretsResponse?.data} refetch={refetch} />
          </>
        ) : (
          <Container flex={{ align: 'center-center' }} padding="xxlarge">
            No Data
          </Container>
        )}
      </Page.Body>
    </>
  )
}

export default SecretsPage
