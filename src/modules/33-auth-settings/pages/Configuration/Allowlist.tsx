/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { Column, Renderer, CellProps } from 'react-table'
import { Classes, Position, Menu, Intent, Callout } from '@blueprintjs/core'

import {
  ButtonVariation,
  Container,
  Card,
  Checkbox,
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

import type { IpAllowlistConfigResponse, IpAllowlistConfigValidateResponse } from '@harnessio/react-ng-manager-client'
import {
  useDeleteIpAllowlistConfigMutation,
  UpdateIpAllowlistConfigOkResponse,
  useUpdateIpAllowlistConfigMutation,
  useGetIpAllowlistConfigsQuery,
  validateIpAddressAllowlistedOrNot
} from '@harnessio/react-ng-manager-client'

import SessionToken from 'framework/utils/SessionToken'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { useQueryParams } from '@common/hooks'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
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
  RenderColumnApplicableFor
} from '@auth-settings/components/IPAllowlistTableColumns/IPAllowlistTableColumns'
import { fetchCurrentIp } from '@auth-settings/services/ipAddressService'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import css from './Allowlist.module.scss'
import cssConfiguration from './Configuration.module.scss'

interface EnableIPAllowlistButtonsProps {
  onEnable: () => void
  onCancel: () => void
  intent?: Intent
}
export const EnableIPAllowlistButtons: React.FC<EnableIPAllowlistButtonsProps> = ({ onEnable, onCancel, intent }) => {
  const { getString } = useStrings()
  const [doubleCheck, setDoubleCheck] = useState<boolean>(false)
  return (
    <Layout.Vertical spacing="none">
      <Checkbox
        margin={{ top: 'none', bottom: 'medium' }}
        label={getString('authSettings.yesIamSure')}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          setDoubleCheck(event.currentTarget.checked)
        }}
      />
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'flex-start' }}>
        <Button
          disabled={!doubleCheck}
          text={getString('enable')}
          intent={intent}
          onClick={() => {
            onEnable?.()
          }}
        />
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={() => onCancel?.()} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const RenderColumnDescription: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ row }) => {
  const ipAllowlistConfig = row.original.ip_allowlist_config
  return (
    <Layout.Vertical padding={{ right: 'large' }}>
      <Text lineClamp={2} className={css.breakWord}>{`${ipAllowlistConfig.description ?? '-'}`}</Text>
    </Layout.Vertical>
  )
}

const RenderColumnEnabled: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ value, row, column }) => {
  const ipAllowlistConfig = row.original.ip_allowlist_config
  const currentIP = (column as any).currentIP
  const [currentIPPartOfAllowlist, setCurrentIPPartOfAllowlist] = useState<boolean>()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: updateIPAllowlist } = useUpdateIpAllowlistConfigMutation()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const dialogExtraMessage = (): JSX.Element | undefined => {
    if (currentIP) {
      if (currentIPPartOfAllowlist === false) {
        return (
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} margin={{ bottom: 'xxlarge' }}>
            {getString('authSettings.ipAddress.enableIpAddressDialogWarningFail', { ipAddress: currentIP })}
          </Text>
        )
      }
      if (currentIPPartOfAllowlist === true) {
        return (
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} margin={{ bottom: 'xxlarge' }}>
            {getString('authSettings.ipAddress.enableIpAddressDialogWarningSuccess')}
          </Text>
        )
      }
    }

    return (
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} margin={{ bottom: 'xxlarge' }}>
        {getString('authSettings.ipAddress.noCurrentIpEnableIpAddressDialogWarning')}
      </Text>
    )
  }

  const intent = !currentIPPartOfAllowlist ? Intent.DANGER : Intent.PRIMARY

  const { openDialog: openEnableDialog, closeDialog: closeEnableDialog } = useConfirmationDialog({
    titleText: getString('authSettings.ipAddress.enableIpAddressDialogTitle'),
    contentText: getString('authSettings.ipAddress.enableIpAddressDialogContent', { name: ipAllowlistConfig.name }),
    children: dialogExtraMessage(),
    customButtons: (
      <EnableIPAllowlistButtons
        onCancel={() => {
          closeEnableDialog()
        }}
        onEnable={() => {
          handleEnabledChange(true)
        }}
        intent={intent}
      />
    ),
    intent: intent,
    onCloseDialog: async didConfirm => {
      if (didConfirm) {
        handleEnabledChange(true)
      }
    }
  })

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

  const handleEnabledChange = async (checked: boolean): Promise<void> => {
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

  const onStatusToggle = async (checked: boolean): Promise<void> => {
    if (checked) {
      // When user is enabling the allowlist
      try {
        const response = await validateIpAddressAllowlistedOrNot({
          queryParams: { ip_address: currentIP, custom_ip_address_block: ipAllowlistConfig.ip_address }
        })
        const validatedResponse = response.content
        setCurrentIPPartOfAllowlist(validatedResponse.allowed_for_custom_block)
        openEnableDialog()
      } catch (e) {
        openEnableDialog()
      }
    } else {
      // When user is disabling the allowlist
      handleEnabledChange(checked)
    }
  }

  return (
    <Toggle
      data-testid="toggleEnabled"
      checked={value === true}
      onToggle={onStatusToggle}
      label={!value ? getString('common.disabled') : getString('enabledLabel')}
      disabled={!canEdit}
    />
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

export const RenderColumnIPAddress: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ value, row, column }) => {
  const { getString } = useStrings()
  const ipAllowlistConfig = row.original.ip_allowlist_config
  const ipAddressOfThisRow = ipAllowlistConfig.ip_address
  const validatedResponse = (column as any).validatedResponse
  const { allowlisted_configs } = validatedResponse
  const isCurrentRowValidated = allowlisted_configs?.find((config: IpAllowlistConfigResponse) => {
    return config?.ip_allowlist_config?.ip_address === ipAddressOfThisRow
  })

  return (
    <Layout.Vertical padding={{ right: 'xlarge' }}>
      <Text lineClamp={1}>{value}</Text>
      {isCurrentRowValidated ? (
        <Text font={{ size: 'small' }}>{getString('authSettings.ipAddress.includesYourIpAddress')}</Text>
      ) : null}
    </Layout.Vertical>
  )
}

const Allowlist: React.FC = () => {
  const { getString } = useStrings()
  const [fetchingCurrentIp, setFetchingCurrentIp] = useState<boolean>(true)
  const [currentIP, setCurrentIP] = useState<string | undefined>(undefined)
  const [validatedResponse, setValidatedResponse] = useState<IpAllowlistConfigValidateResponse>({})
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { page, size } = useQueryParams<CommonPaginationQueryParams>()

  const { openIPAllowlistModal } = useCreateIPAllowlistModal({
    onClose: () => {
      refetchListingPageAPIs()
    }
  })
  const { openCheckIPModal } = useCheckIPModal()

  const { data, isFetching, refetch } = useGetIpAllowlistConfigsQuery({ queryParams: { page: page, limit: size } })

  const refetchListingPageAPIs = useCallback((): void => {
    refetch()
  }, [refetch])

  useEffect(() => {
    const fetchIp = async (): Promise<void> => {
      try {
        const ip = await fetchCurrentIp(SessionToken.username(), accountId)
        setCurrentIP(ip)
      } catch (e) {
        // do nothing
      } finally {
        setFetchingCurrentIp(false)
      }
    }
    fetchIp()
  }, [])

  useEffect(() => {
    if (currentIP) {
      const validateIfCurrentIpIncludedInRow = async (): Promise<void> => {
        try {
          const response = await validateIpAddressAllowlistedOrNot({
            queryParams: { ip_address: currentIP }
          })
          setValidatedResponse(response.content)
        } catch (e) {
          setValidatedResponse({}) // Reset to initial value
        }
      }
      validateIfCurrentIpIncludedInRow()
    }
    // TODO: Remove "data" from dependecies when "validateIpAddressAllowlistedOrNot" API starts responding with both
    // ENABLED & DISABLED data. As of today, it returns only ENABLED rows.
  }, [currentIP, data])

  const columns: (Column<IpAllowlistConfigResponse> & {
    refetchListingPageAPIs?: () => void
    openIPAllowlistModal?: UseCreateIPAllowlistModalReturn['openIPAllowlistModal']
  })[] = useMemo(
    () => [
      {
        Header: getString('status'),
        id: 'enabled',
        accessor: row => row.ip_allowlist_config.enabled,
        width: '10%',
        Cell: RenderColumnEnabled,
        refetchListingPageAPIs,
        currentIP
      },
      {
        Header: getString('name'),
        id: 'name',
        accessor: row => row.ip_allowlist_config.name,
        width: '20%',
        Cell: RenderColumnName
      },
      {
        Header: getString('description'),
        id: 'description',
        accessor: row => row.ip_allowlist_config.name,
        width: '25%',
        Cell: RenderColumnDescription
      },
      {
        Header: getString('authSettings.ipAddress.ipAddressCIDR'),
        id: 'ipAddress',
        accessor: row => row.ip_allowlist_config.ip_address,
        width: '20%',
        Cell: RenderColumnIPAddress,
        validatedResponse
      },
      {
        Header: getString('authSettings.ipAddress.applicableFor'),
        id: 'applicableFor',
        width: '15%',
        Cell: RenderColumnApplicableFor
      },
      {
        id: 'menu',
        width: '10%',
        Cell: RenderColumnMenu,
        refetchListingPageAPIs,
        openIPAllowlistModal
      }
    ],
    [getString, openIPAllowlistModal, refetchListingPageAPIs, currentIP, validatedResponse]
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
  const total = defaultTo(data?.pagination?.total, 0)
  const pageSize = defaultTo(data?.pagination?.pageSize, COMMON_DEFAULT_PAGE_SIZE)
  const pageCount = defaultTo(data?.pagination?.pageCount, Math.ceil(total / pageSize))
  const pageNumber = defaultTo(data?.pagination?.pageNumber, 0)

  const paginationProps = useDefaultPaginationProps({
    itemCount: total,
    pageSize: pageSize,
    pageCount: pageCount,
    pageIndex: pageNumber
  })

  return (
    <>
      {!canEdit && (
        <Callout className={cssConfiguration.callout}>
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
          <Text font={{ size: 'small' }}>
            {fetchingCurrentIp
              ? getString('authSettings.ipAddress.determiningCurrentIp')
              : currentIP
              ? getString('authSettings.ipAddress.yourIpAddressIs', { ipAddress: currentIP })
              : getString('authSettings.ipAddress.unableToDetermineIp')}
          </Text>
          <Callout className={cssConfiguration.callout}>
            {getString('authSettings.ipAddress.changesMayTake5Minutes')}
          </Callout>
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
            rowsExist && (
              <TableV2
                className={css.paddingTable}
                data={allowlistData}
                columns={columns}
                pagination={paginationProps}
              />
            )
          )}
        </Layout.Vertical>
      </Container>
    </>
  )
}

export default Allowlist
