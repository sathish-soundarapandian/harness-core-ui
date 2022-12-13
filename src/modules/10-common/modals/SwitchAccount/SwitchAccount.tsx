/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Text,
  Button,
  ButtonVariation,
  PageError,
  TableV2,
  useConfirmationDialog,
  useToaster,
  NoDataCard,
  Pagination
} from '@harness/uicore'
import type { Column, Renderer, CellProps } from 'react-table'
import { useParams, useHistory } from 'react-router-dom'
import { get } from 'lodash-es'
import { Intent } from '@blueprintjs/core'
import {
  useSetDefaultAccountForCurrentUser,
  RestResponseUser,
  useRestrictedSwitchAccount,
  useGetUserAccounts
} from 'services/portal'
import type { Account } from 'services/portal'
import { PageSpinner } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { UseGetMockData } from '@common/utils/testUtils'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import SecureStorage from 'framework/utils/SecureStorage'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGetCurrentUserInfo } from 'services/cd-ng'
import { getLocationPathName } from 'framework/utils/WindowLocation'
import css from './SwitchAccount.module.scss'

interface SwitchAccountProps {
  hideModal: () => void
  searchString?: string
  mock?: UseGetMockData<RestResponseUser>
}

interface ReAuthenticationNoteProps {
  accounts: Account[]
  accountId: string
}

const RenderColumnCompanyName: Renderer<CellProps<Account>> = ({ row }) => {
  const name = row.original.companyName
  return <Text lineClamp={1}>{name}</Text>
}

const RenderColumnAccountEdition: Renderer<CellProps<Account>> = ({ row }) => {
  const name = row.original.licenseInfo?.accountType
  return <Text>{name}</Text>
}

const ReAuthenticationNote: React.FC<ReAuthenticationNoteProps> = ({ accounts, accountId }) => {
  const { getString } = useStrings()

  return accounts.length > 1 || (accounts[0] && accounts[0].uuid !== accountId) ? (
    <Text intent="warning" padding={{ left: 'large', right: 'large', top: 'small' }}>
      {getString('common.noteAccountSwitch')}
    </Text>
  ) : null
}

const SwitchAccount: React.FC<SwitchAccountProps> = ({ searchString = '' }) => {
  const { accountId } = useParams<AccountPathProps>()
  const [page, setPage] = useState(0)
  const [switchAccountId, setSwitchAccountId] = useState<string | undefined>()
  const { showError } = useToaster()
  const history = useHistory()
  const { getString } = useStrings()
  const { currentUserInfo, updateAppStore } = useAppStore()

  const { data, loading, refetch, error } = useGetUserAccounts({
    queryParams: {
      pageIndex: page,
      pageSize: 10,
      searchTerm: searchString
    }
  })

  const {
    data: userInfo,
    loading: userInfoLoading,
    refetch: fetchCurrentUserInfo
  } = useGetCurrentUserInfo({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })
  const { mutate: setDefaultAccount, loading: settingDefault } = useSetDefaultAccountForCurrentUser({ accountId })
  const { mutate: switchAccount, loading: switchAccountLoading } = useRestrictedSwitchAccount({
    // requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  useEffect(() => {
    if (userInfo?.data?.defaultAccountId !== currentUserInfo.defaultAccountId) {
      updateAppStore({
        currentUserInfo: userInfo?.data
      })
    }
  }, [userInfo])

  useEffect(() => {
    setPage(0)
  }, [searchString])

  const RenderColumnAccountName: Renderer<CellProps<Account>> = ({ row }) => {
    const account = row.original

    const handleSwitchAccount = async (): Promise<void> => {
      try {
        setSwitchAccountId(account.uuid)
        const response = await switchAccount({ accountId: account.uuid })
        if (response.resource?.requiresReAuthentication) {
          const baseUrl = window.location.href.split('#')[0]
          const returnUrl = `${baseUrl}#${routes.toMainDashboard({ accountId: account.uuid })}`
          history.push({
            pathname: routes.toRedirect(),
            search: `?returnUrl=${encodeURIComponent(getLoginPageURL({ returnUrl }))}`
          })
        } else if (response.resource) {
          SecureStorage.set('acctId', account.uuid)
          // This may be overriden by the defaultExperience of the most recent account opened (in AppStoreContext)
          localStorage.setItem('defaultExperience', account.defaultExperience || '')
          // this needs to be a server-redirect to support cluster isolation
          window.location.href = getLocationPathName()
        } else {
          showError(getString('common.switchAccountError'))
        }
      } catch (err) {
        setSwitchAccountId(undefined)
        showError(getString('common.switchAccountError'))
      }
    }

    return (
      <Button
        onClick={handleSwitchAccount}
        text={account.accountName}
        loading={switchAccountLoading && switchAccountId === account.uuid}
        disabled={account.uuid === accountId}
        minimal={account.uuid === accountId}
        variation={ButtonVariation.LINK}
      />
    )
  }

  const RenderColumnDefaultAccount: Renderer<CellProps<Account>> = ({ row }) => {
    const account = row.original

    const handleSetDefault = async (): Promise<void> => {
      const { resource, responseMessages } = await setDefaultAccount(undefined, {
        pathParams: { accountId: account.uuid }
      })
      if (resource === true) {
        fetchCurrentUserInfo()
      } else {
        showError(get(responseMessages, '[0].message', getString('somethingWentWrong')))
      }
    }

    const { openDialog } = useConfirmationDialog({
      cancelButtonText: getString('cancel'),
      confirmButtonText: getString('continue'),
      titleText: getString('common.changeDefaultAccountTitle'),
      contentText: getString('common.changeDefaultAccountMessage', { name: account.accountName }),
      intent: Intent.WARNING,
      onCloseDialog: isConfirmed => {
        if (isConfirmed) {
          handleSetDefault()
        }
      }
    })

    const isDefaultAccount = account.uuid === currentUserInfo?.defaultAccountId
    // default account should not be actionable
    return isDefaultAccount ? (
      <Text flex={{ align: 'center-center' }}>Default</Text>
    ) : (
      <Button
        small
        variation={ButtonVariation.TERTIARY}
        text={getString('common.setAsDefault')}
        onClick={openDialog}
        data-testid={`set-default-account-${account.accountName}`}
      />
    )
  }

  const getAccounts = () => {
    return data?.resource?.content || []
  }

  const accounts = getAccounts()

  const columns: Column<Account>[] = useMemo(
    () => [
      {
        Header: getString('common.headerAccountName'),
        accessor: row => row.accountName,
        id: 'name',
        width: '30%',
        Cell: RenderColumnAccountName
      },
      {
        Header: getString('common.headerCompanyName'),
        accessor: row => row.companyName,
        id: 'companyName',
        width: '30%',
        Cell: RenderColumnCompanyName
      },
      {
        Header: getString('common.headerAccountEdition'),
        accessor: row => row.licenseInfo?.accountType,
        id: 'accountType',
        width: '20%',
        Cell: RenderColumnAccountEdition
      },
      {
        Header: getString('common.headerDefaultAccount'),
        accessor: row => row.defaults,
        id: 'defaultAccount',
        width: '20%',
        Cell: RenderColumnDefaultAccount
      }
    ],
    [accounts, currentUserInfo, switchAccountId]
  )

  return (
    <>
      <ReAuthenticationNote accounts={accounts} accountId={accountId} />
      <Container padding={{ left: 'large', right: 'large' }} className={css.container}>
        {loading || userInfoLoading || settingDefault ? <PageSpinner /> : undefined}

        {error ? (
          <PageError message={error.message || getString('somethingWentWrong')} onClick={() => refetch()} />
        ) : null}
        {!settingDefault && !error && accounts ? (
          accounts.length ? (
            <>
              <TableV2 columns={columns} data={accounts} sortable={false} className={css.table} />

              <Pagination
                itemCount={data?.resource?.totalItems || 0}
                pageSize={data?.resource?.pageSize || 10}
                pageCount={data?.resource?.totalPages || 0}
                pageIndex={data?.resource?.pageIndex || 0}
                gotoPage={setPage}
                className={css.pagination}
              />
            </>
          ) : (
            <NoDataCard
              message={getString('noData')}
              className={css.noDataCard}
              containerClassName={css.noDataCardContainer}
            />
          )
        ) : null}
      </Container>
    </>
  )
}

export default SwitchAccount
