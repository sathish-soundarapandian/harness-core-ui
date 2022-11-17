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
  Card,
  Collapse,
  Container,
  Layout,
  Popover,
  Text,
  useConfirmationDialog
} from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'
import ReactTimeago from 'react-timeago'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { ApiKeyAggregateDTO, ApiKeyDTO, TokenDTO, useDeleteApiKey } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { TagsPopover, useToaster } from '@common/components'
import TokenList from '@rbac/components/TokenList/TokenList'
import { useApiKeyModal } from '@rbac/modals/ApiKeyModal/useApiKeyModal'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import css from '../ApiKeyList.module.scss'

interface ApiKeyCardProps {
  data: ApiKeyAggregateDTO
  openTokenModal: (apiKeyIdentifier: string, token?: TokenDTO, _isRotate?: boolean) => void
  refetchApiKeys: () => void
  onRefetchComplete: () => void
  refetchTokens: boolean
}

const RenderColumnDetails = (data: ApiKeyDTO): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="xsmall">
      <Layout.Horizontal spacing="small">
        <Text font={{ variation: FontVariation.BODY2 }} color={Color.BLACK} lineClamp={1} className={css.wordBreak}>
          {data.name}
        </Text>
        {data.tags && Object.keys(data.tags).length ? <TagsPopover tags={data.tags} /> : null}
      </Layout.Horizontal>
      <Text color={Color.GREY_400} lineClamp={1} font={{ size: 'small' }} className={css.wordBreak}>
        {getString('idLabel', { id: data.identifier })}
      </Text>
    </Layout.Vertical>
  )
}

const RenderColumnMenu: React.FC<{
  data: ApiKeyDTO
  reload: () => void
}> = ({ data, reload }) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier, identifier, parentIdentifier, apiKeyType } = data
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { mutate: deleteApiKey } = useDeleteApiKey({
    queryParams: {
      accountIdentifier: accountIdentifier || '',
      orgIdentifier,
      projectIdentifier,
      apiKeyType,
      parentIdentifier: parentIdentifier || ''
    }
  })

  const { openApiKeyModal } = useApiKeyModal({ onSuccess: reload })

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('rbac.apiKey.confirmDelete', { name: data.name }),
    titleText: getString('rbac.apiKey.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteApiKey(identifier || '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(getString('rbac.apiKey.successMessage', { name: data.name }))
            reload()
          } else {
            showError(getString('deleteError'))
          }
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDeleteDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openApiKeyModal(data)
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          variation={ButtonVariation.ICON}
          icon="Options"
          data-testid={`apiKey-menu-${data.identifier}`}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          <RbacMenuItem
            icon="edit"
            text={getString('edit')}
            onClick={handleEdit}
            permission={{
              permission: PermissionIdentifier.MANAGE_SERVICEACCOUNT,
              resource: {
                resourceType: ResourceType.SERVICEACCOUNT,
                resourceIdentifier: parentIdentifier
              },
              options: {
                skipCondition: () => apiKeyType === 'USER'
              }
            }}
          />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={handleDelete}
            permission={{
              permission: PermissionIdentifier.MANAGE_SERVICEACCOUNT,
              resource: {
                resourceType: ResourceType.SERVICEACCOUNT,
                resourceIdentifier: parentIdentifier
              },
              options: {
                skipCondition: () => apiKeyType === 'USER'
              }
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  data,
  openTokenModal,
  refetchApiKeys,
  onRefetchComplete,
  refetchTokens
}) => {
  const { apiKey, createdAt, lastModifiedAt, tokensCount } = data
  const { getString } = useStrings()
  return (
    <Card key={apiKey.identifier} className={css.card}>
      <div className={css.apiKeyList}>
        <RenderColumnDetails {...apiKey} />
        <Text>
          {`${getString('created')} `}
          <ReactTimeago date={createdAt} minPeriod={60} />
        </Text>
        <Text>
          {`${getString('common.lastModifiedTime')} `}
          <ReactTimeago date={lastModifiedAt} minPeriod={60} />
        </Text>
        <RenderColumnMenu data={apiKey} reload={refetchApiKeys} />
      </div>
      <Container padding={{ top: 'small' }}>
        {tokensCount ? (
          <Collapse
            collapsedIcon="chevron-right"
            expandedIcon="chevron-up"
            isRemovable={false}
            collapseClassName={css.collapse}
            heading={
              <div data-testid={`tokens-${apiKey.identifier}`}>
                <Text> {`${getString('common.tokens')} (${tokensCount})`}</Text>
              </div>
            }
          >
            <TokenList
              apiKeyIdentifier={apiKey.identifier}
              apiKeyType={apiKey.apiKeyType}
              openTokenModal={openTokenModal}
              reloadApiKey={refetchApiKeys}
              refetchTokens={refetchTokens}
              onRefetchComplete={onRefetchComplete}
              parentIdentifier={apiKey.parentIdentifier}
            />
            <RbacButton
              text={getString('plusNumber', { number: getString('token') })}
              data-testid={`new_token-${apiKey.identifier}`}
              margin={{ top: 'medium' }}
              variation={ButtonVariation.LINK}
              onClick={() => openTokenModal(apiKey.identifier)}
              permission={{
                permission: PermissionIdentifier.MANAGE_SERVICEACCOUNT,
                resource: {
                  resourceType: ResourceType.SERVICEACCOUNT,
                  resourceIdentifier: apiKey.parentIdentifier
                },
                options: {
                  skipCondition: () => apiKey.apiKeyType === 'USER'
                }
              }}
            />
          </Collapse>
        ) : (
          <RbacButton
            text={getString('plusNumber', { number: getString('token') })}
            variation={ButtonVariation.LINK}
            data-testid={`new_token-${apiKey.identifier}`}
            onClick={() => openTokenModal(apiKey.identifier)}
            permission={{
              permission: PermissionIdentifier.MANAGE_SERVICEACCOUNT,
              resource: {
                resourceType: ResourceType.SERVICEACCOUNT,
                resourceIdentifier: apiKey.parentIdentifier
              },
              options: {
                skipCondition: () => apiKey.apiKeyType === 'USER'
              }
            }}
          />
        )}
      </Container>
    </Card>
  )
}

export default ApiKeyCard
