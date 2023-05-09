/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useCallback } from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { Column, Renderer, CellProps } from 'react-table'
import { Classes, Position, Menu, Intent, Callout } from '@blueprintjs/core'

import {
  ButtonVariation,
  Container,
  Card,
  Text,
  Toggle,
  Button,
  PageSpinner,
  Popover,
  useConfirmationDialog,
  useToaster,
  Layout,
  TableV2
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { IpAllowlistConfigResponse } from '@harnessio/react-ng-manager-client'
import {
  useDeleteIpAllowlistConfigMutation,
  UpdateIpAllowlistConfigOkResponse,
  useUpdateIpAllowlistConfigMutation,
  useGetIpAllowlistConfigsQuery
} from '@harnessio/react-ng-manager-client'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import RbacButton from '@rbac/components/Button/Button'
import { usePermission } from '@rbac/hooks/usePermission'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { buildUpdateIPAllowlistPayload } from '@auth-settings/utils'
import useCreateIPAllowlistModal from '@auth-settings/modals/IPAllowlistModal/useCreateIPAllowlistModal'
import useCheckIPModal from '@auth-settings/modals/CheckIPModal/useCheckIPModal'
import type { UseCreateIPAllowlistModalReturn } from '@auth-settings/modals/IPAllowlistModal/useCreateIPAllowlistModal'
import { mapIPAllowlistConfigDTOToFormData } from '@auth-settings/components/CreateIPAllowlist/CreateIPAllowlistWizard'
import {
  RenderColumnName,
  RenderColumnIPAddress
} from '@auth-settings/components/IPAllowlistTableColumns/IPAllowlistTableColumns'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import css from './Allowlist.module.scss'
import cssConfiguration from './Configuration.module.scss'

const RenderColumnEnabled: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ value, row, column }) => {
  const ipAllowlistConfig = row.original.ip_allowlist_config
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: updateIPAllowlist } = useUpdateIpAllowlistConfigMutation()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [canEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.AUTHSETTING,
        resourceIdentifier: ipAllowlistConfig.identifier
      },
      permissions: [PermissionIdentifier.EDIT_AUTHSETTING],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, ipAllowlistConfig.identifier]
  )

  const onEnabledToggle = async (checked: boolean): Promise<void> => {
    if (ipAllowlistConfig.identifier) {
      const dataInFormFormat = mapIPAllowlistConfigDTOToFormData(row.original)
      const updateIPAllowlistPayload = buildUpdateIPAllowlistPayload(dataInFormFormat, { enabled: checked })
      updateIPAllowlist(updateIPAllowlistPayload, {
        onSuccess: (updatedIPAllowlist: UpdateIpAllowlistConfigOkResponse) => {
          showSuccess(
            getString('authSettings.ipAddress.ipAllowlistUpdated', {
              name: updatedIPAllowlist.content?.ip_allowlist_config.name
            })
          )
          ;(column as any).refetchListingPageAPIs()
        },
        onError: error => {
          showError(
            defaultTo(
              error as string,
              getString('authSettings.ipAddress.errorWhileUpdating', {
                name: ipAllowlistConfig.name
              })
            )
          )
        }
      })
    }
  }

  return (
    <Toggle
      data-testid="toggleEnabled"
      checked={value === true}
      onToggle={onEnabledToggle}
      label={!value ? getString('common.disabled') : getString('enabledLabel')}
      disabled={!canEdit}
    />
  )
}

const RenderColumnApplicableFor: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ row }) => {
  const { getString } = useStrings()
  const allowSourceType = defaultTo(row.original.ip_allowlist_config.allowed_source_type, [])
  const applicableFor = allowSourceType.length > 0 ? allowSourceType.join(', ') : getString('na')
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }}>
      <Text>{applicableFor}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnMenu: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ row, column }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { isLoading: isDeleting, mutate: deleteIPAllowlist } = useDeleteIpAllowlistConfigMutation()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const ipAllowlistConfig = row.original.ip_allowlist_config

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('authSettings.ipAddress.deleteIpAddressDialogContent', { name: ipAllowlistConfig.name }),
    titleText: getString('authSettings.ipAddress.deleteIpAddressDialogTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async didConfirm => {
      if (didConfirm && ipAllowlistConfig.identifier) {
        deleteIPAllowlist(
          {
            'ip-config-identifier': ipAllowlistConfig.identifier
          },
          {
            onSuccess: () => {
              showSuccess(
                getString('authSettings.ipAddress.deleteSuccessful', {
                  name: ipAllowlistConfig.name
                })
              )
              ;(column as any).refetchListingPageAPIs()
            },
            onError: error => {
              showError(
                defaultTo(
                  error as string,
                  getString('authSettings.ipAddress.errorWhileDeleting', {
                    name: ipAllowlistConfig.name
                  })
                )
              )
            }
          }
        )
      }
    }
  })

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!ipAllowlistConfig.identifier) {
      return
    }
    ;(column as any).openIPAllowlistModal(true, undefined, row.original)
  }

  const handleDelete = async (): Promise<void> => {
    openDeleteDialog()
  }

  const editPermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.AUTHSETTING,
      resourceIdentifier: ipAllowlistConfig.identifier
    },
    permission: PermissionIdentifier.EDIT_AUTHSETTING
  }

  const deletePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.AUTHSETTING,
      resourceIdentifier: ipAllowlistConfig.identifier
    },
    permission: PermissionIdentifier.DELETE_AUTHSETTING
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          icon="Options"
          withoutBoxShadow
          data-testid={`menu-${ipAllowlistConfig.identifier}`}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          <RbacMenuItem icon="edit" text={getString('edit')} onClick={handleEdit} permission={editPermission} />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            disabled={isDeleting}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(false)
              handleDelete()
            }}
            permission={deletePermission}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const Allowlist: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { openIPAllowlistModal } = useCreateIPAllowlistModal({
    onClose: () => {
      refetchListingPageAPIs()
    }
  })
  const { openCheckIPModal } = useCheckIPModal()

  const { data, isFetching, refetch } = useGetIpAllowlistConfigsQuery({ queryParams: {} })

  const refetchListingPageAPIs = useCallback((): void => {
    refetch()
  }, [refetch])

  const columns: (Column<IpAllowlistConfigResponse> & {
    refetchListingPageAPIs?: () => void
    openIPAllowlistModal?: UseCreateIPAllowlistModalReturn['openIPAllowlistModal']
  })[] = useMemo(
    () => [
      {
        Header: getString('status'),
        id: 'enabled',
        accessor: row => row.ip_allowlist_config.enabled,
        width: '15%',
        Cell: RenderColumnEnabled,
        refetchListingPageAPIs
      },
      {
        Header: getString('name'),
        id: 'name',
        accessor: row => row.ip_allowlist_config.name,
        width: '20%',
        Cell: RenderColumnName
      },
      {
        Header: getString('authSettings.ipAddress.ipAddressCIDR'),
        id: 'ipAddress',
        accessor: row => row.ip_allowlist_config.ip_address,
        width: '20%',
        Cell: RenderColumnIPAddress
      },
      {
        Header: getString('authSettings.ipAddress.applicableFor'),
        id: 'applicableFor',
        width: '25%',
        Cell: RenderColumnApplicableFor
      },
      {
        id: 'menu',
        width: '20%',
        Cell: RenderColumnMenu,
        refetchListingPageAPIs,
        openIPAllowlistModal
      }
    ],
    [getString, openIPAllowlistModal, refetchListingPageAPIs]
  )

  const createPermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.AUTHSETTING
    },
    permission: PermissionIdentifier.EDIT_AUTHSETTING
  }

  const allowlistData = defaultTo(data?.content, [])
  const rowsExist = allowlistData.length > 0
  const permissionRequest = {
    resourceScope: {
      accountIdentifier: accountId
    },
    resource: {
      resourceType: ResourceType.AUTHSETTING
    }
  }

  const [canEdit] = usePermission(
    {
      ...permissionRequest,
      permissions: [PermissionIdentifier.EDIT_AUTHSETTING]
    },
    []
  )

  return (
    <>
      {!canEdit && (
        <Callout icon={null} className={cssConfiguration.callout}>
          <RBACTooltip
            permission={PermissionIdentifier.EDIT_AUTHSETTING}
            resourceType={permissionRequest.resource.resourceType}
            resourceScope={permissionRequest.resourceScope}
          />
        </Callout>
      )}
      <Container margin="xlarge" padding="large" background={Color.WHITE}>
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.H4 }}>{getString('authSettings.ipAllowlist')}</Text>
          {/* <Layout.Horizontal margin="large" spacing="large" className={css.center}> */}
          {rowsExist ? (
            <Layout.Horizontal margin="large" spacing="large">
              <RbacButton
                intent="primary"
                onClick={() => {
                  openIPAllowlistModal(false)
                }}
                variation={ButtonVariation.SECONDARY}
                text={getString('authSettings.ipAddress.addIpAddresses')}
                icon="plus"
                permission={createPermission}
                data-testid="addIpAddresses"
              />
              <RbacButton
                intent="none"
                onClick={() => {
                  openCheckIPModal()
                }}
                variation={ButtonVariation.LINK}
                text={getString('authSettings.ipAddress.checkIPForAllowlist')}
                permission={createPermission}
              />
            </Layout.Horizontal>
          ) : (
            <Layout.Horizontal margin="large" spacing="large" className={css.center}>
              <Card className={css.noDataCard}>
                <Layout.Vertical>
                  <Text
                    className={css.textCenter}
                    margin={{ bottom: 'small' }}
                    font={{ variation: FontVariation.BODY }}
                  >
                    {getString('authSettings.ipAddress.noIPsAllowlisted')}
                  </Text>
                  <RbacButton
                    intent="primary"
                    onClick={() => {
                      openIPAllowlistModal(false)
                    }}
                    variation={ButtonVariation.SECONDARY}
                    text={getString('authSettings.ipAddress.addIpAddresses')}
                    icon="plus"
                    permission={createPermission}
                  />
                </Layout.Vertical>
              </Card>
            </Layout.Horizontal>
          )}
          {isFetching ? (
            <PageSpinner />
          ) : (
            <TableV2 className={css.paddingTable} data={allowlistData} columns={columns} />
          )}
        </Layout.Vertical>
      </Container>
    </>
  )
}

export default Allowlist
