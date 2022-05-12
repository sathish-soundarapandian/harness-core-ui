/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useMemo, useState } from 'react'
import {
  Container,
  Heading,
  Layout,
  Pagination,
  Tab,
  Tabs,
  Text,
  Utils,
  PageError,
  TableV2
} from '@wings-software/uicore'
import type { Column } from 'react-table'
import { FontVariation, Color, Intent } from '@harness/design-system'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { ApiKey, useDeleteAPIKey, useGetAllAPIKeys } from 'services/cf'
import { useToaster } from '@common/exports'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useEnvStrings } from '@cf/hooks/environment'
import { CF_DEFAULT_PAGE_SIZE, EnvironmentSDKKeyType, getErrorMessage, showToaster } from '@cf/utils/CFUtils'
import { withTableData } from '@cf/utils/table-utils'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useConfirmAction } from '@common/hooks'
import { NoData } from '@cf/components/NoData/NoData'
import { String } from 'framework/strings'
import AddKeyDialog from '../../components/AddKeyDialog/AddKeyDialog'
import EmptySDKs from './NoSDKs.svg'

import css from './EnvironmentDetails.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T>

type RowFunctions = {
  environmentIdentifier: string
  isNew: (id: string) => boolean
  onDelete: (id: string, name: string) => void
  getSecret: (id: string, fallback: string) => string
}
const defaultContext = { environmentIdentifier: '', isNew: () => false, onDelete: () => false, getSecret: () => '' }
const RowContext = React.createContext<RowFunctions>(defaultContext)

const withApiKey = withTableData<ApiKey, { apiKey: ApiKey }>(({ row }) => ({ apiKey: row.original }))

const NameCell = withApiKey(({ apiKey }) => <Text font={{ weight: 'bold' }}>{apiKey.name}</Text>)
const TypeCell = withApiKey(({ apiKey }) => {
  const { getEnvString } = useEnvStrings()

  return <Text>{getEnvString(`apiKeys.${apiKey.type.toLowerCase()}Type`)}</Text>
})

const ApiInfoCell = withApiKey(({ apiKey }) => {
  const { environmentIdentifier, isNew, onDelete, getSecret } = useContext(RowContext) ?? defaultContext
  const { getString, getEnvString } = useEnvStrings()
  const { showSuccess, showError } = useToaster()
  const showCopy = isNew(apiKey.identifier)

  const apiKeyText = showCopy ? getSecret(apiKey.identifier, apiKey.apiKey) : apiKey.apiKey

  const handleCopy = (): void => {
    Utils.copy(apiKeyText)
      .then(() => showSuccess(getString('clipboardCopySuccess')))
      .catch(() => showError(getString('clipboardCopyFail'), undefined, 'cf.copy.text.error'))
  }

  const deleteSDKKey = useConfirmAction({
    intent: Intent.DANGER,
    title: getEnvString('apiKeys.deleteTitle'),
    message: <String stringID="cf.environments.apiKeys.deleteMessage" vars={{ keyName: apiKey.name }} />,
    action: () => {
      onDelete(apiKey.identifier, apiKey.name)
    }
  })

  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }} className={css.keyContainer}>
        <Text font={{ weight: 'bold' }} className={css.keyType}>
          {apiKey.type === EnvironmentSDKKeyType.CLIENT ? getString(`common.clientId`) : getString('secretType')}:
        </Text>
        {showCopy ? (
          <div className={css.keyCopyContainer}>
            <Text
              font={{ mono: true }}
              rightIcon="main-clone"
              rightIconProps={{
                onClick: handleCopy,
                color: Color.GREY_350,
                className: css.keyCopyIcon
              }}
              padding="small"
              className={css.keyCopy}
            >
              {apiKeyText}
            </Text>
            <Text font={{ variation: FontVariation.TINY }} color={Color.ORANGE_900} className={css.keyRedactionWarning}>
              {getEnvString('apiKeys.redactionWarning')}
            </Text>
          </div>
        ) : (
          <Text>{apiKeyText}</Text>
        )}
      </Layout.Horizontal>
      <Container>
        <RbacButton
          minimal
          icon="trash"
          iconProps={{
            size: 16
          }}
          className={css.keyDeleteButton}
          onClick={deleteSDKKey}
          permission={{
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environmentIdentifier },
            permission: PermissionIdentifier.EDIT_ENVIRONMENT
          }}
        />
      </Container>
    </Layout.Horizontal>
  )
})

const EnvironmentSDKKeys: React.FC<{ environment: EnvironmentResponseDTO }> = ({ environment }) => {
  const { showError } = useToaster()
  const { getString, getEnvString } = useEnvStrings()
  const [recents, setRecents] = useState<ApiKey[]>([])
  const [page, setPage] = useState<number>(0)

  const queryParams = {
    projectIdentifier: environment.projectIdentifier as string,
    environmentIdentifier: environment.identifier as string,
    accountIdentifier: environment.accountId as string,
    orgIdentifier: environment.orgIdentifier as string
  }

  const { data, loading, error, refetch } = useGetAllAPIKeys({
    queryParams: {
      ...queryParams,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber: page
    }
  })

  const { mutate: deleteKey } = useDeleteAPIKey({ queryParams })
  const handleDelete = (id: string, keyName: string): void => {
    deleteKey(id)
      .then(() => showToaster(getString('cf.environments.apiKeys.deleteSuccess', { keyName })))
      .then(() => refetch())
      .catch(deleteError => showError(getErrorMessage(deleteError), undefined, 'cf.delete.api.key.error'))
  }

  const { apiKeys, ...pagination } = data ?? {
    itemCount: 0,
    pageCount: 0,
    pageIndex: 0,
    pageSize: CF_DEFAULT_PAGE_SIZE
  }
  const hasData = !error && !loading && (apiKeys || []).length > 0
  const emptyData = !error && !loading && (apiKeys || []).length === 0

  const columns: CustomColumn<ApiKey>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        accessor: 'name',
        width: '25%',
        Cell: NameCell
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        accessor: 'type',
        width: '10%',
        Cell: TypeCell
      },
      {
        id: 'info',
        width: '65%',
        Cell: ApiInfoCell
      }
    ],
    []
  )

  return (
    <Container width="100%" height="calc(100vh - 174px)">
      {hasData && (
        <Layout.Vertical
          padding={{ top: 'xxxlarge', left: 'xxlarge' }}
          height="100%"
          flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
        >
          <Layout.Horizontal width="100%" flex={{ distribution: 'space-between', alignItems: 'baseline' }}>
            <Heading level={2} font={{ variation: FontVariation.H5 }}>
              {getEnvString('apiKeys.title')}
            </Heading>
            <AddKeyDialog
              environment={environment}
              onCreate={(newKey: ApiKey, hideCreate) => {
                setRecents([...recents, newKey])
                hideCreate()
                refetch()
              }}
            />
          </Layout.Horizontal>
          <Text color={Color.GREY_800} padding={{ top: 'small', bottom: 'xxlarge' }}>
            {getEnvString('apiKeys.message')}
          </Text>
          <Container className={css.content}>
            <Container className={css.table}>
              <RowContext.Provider
                value={{
                  environmentIdentifier: environment.identifier as string,
                  isNew: (id: string) => Boolean(recents.find(r => r.identifier === id)),
                  onDelete: handleDelete,
                  getSecret: (id: string, fallback: string) =>
                    recents.find(r => r.identifier === id)?.apiKey || fallback
                }}
              >
                <TableV2<ApiKey> data={(apiKeys || []) as ApiKey[]} columns={columns} />
              </RowContext.Provider>
            </Container>
            {!!pagination.itemCount && (
              <Container className={css.paginationContainer}>
                <Pagination
                  itemCount={pagination.itemCount}
                  pageCount={pagination.pageCount}
                  pageIndex={pagination.pageIndex}
                  pageSize={CF_DEFAULT_PAGE_SIZE}
                  gotoPage={(index: number) => {
                    setPage(index)
                    refetch({ queryParams: { ...queryParams, pageNumber: index } })
                  }}
                />
              </Container>
            )}
          </Container>
        </Layout.Vertical>
      )}

      {emptyData && (
        <Container height="100%" flex={{ align: 'center-center' }}>
          <NoData
            imageURL={EmptySDKs}
            message={getString('cf.environments.apiKeys.noKeysFoundTitle')}
            description={<String useRichText stringID="cf.environments.apiKeys.noKeysFoundMessage" />}
          >
            <AddKeyDialog
              primary
              environment={environment}
              onCreate={(newKey: ApiKey, hideCreate) => {
                setRecents([...recents, newKey])
                hideCreate()
                refetch()
              }}
            />
          </NoData>
        </Container>
      )}

      {loading && (
        <Layout.Horizontal width="100%" height="100%" flex={{ align: 'center-center' }}>
          <ContainerSpinner />
        </Layout.Horizontal>
      )}

      {error && (
        <PageError
          message={getErrorMessage(error)}
          onClick={() => {
            setPage(0)
            refetch()
          }}
        />
      )}
    </Container>
  )
}

const CFEnvironmentDetailsBody: React.FC<{
  environment: EnvironmentResponseDTO
}> = ({ environment }) => {
  return (
    <Container className={css.envTabs}>
      <Tabs id="envDetailsTabs">
        <Tab id="settings" title="Settings" panel={<EnvironmentSDKKeys environment={environment} />} />
      </Tabs>
    </Container>
  )
}

export default CFEnvironmentDetailsBody
