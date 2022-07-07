/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, FC } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Dialog, ExpandingSearchInput, Button } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { PageSpinner } from '@common/components'
import DelegateInstallationError from '@delegates/components/CreateDelegate/components/DelegateInstallationError/DelegateInstallationError'

import {
  GetDelegateGroupsUsingTokenQueryParams,
  useGetDelegateGroupsUsingToken,
  DelegateGroupDetails
} from 'services/cd-ng'
import css from '../DelegateTokens.module.scss'

interface DelegateItemParams {
  delegate: DelegateGroupDetails
}
const DelegateItem: FC<DelegateItemParams> = ({ delegate }) => {
  const { getString } = useStrings()

  const [troubleshooterOpen, setOpenTroubleshooter] = useState<boolean>(false)
  const statusColor: Color = delegate.activelyConnected ? Color.GREEN_600 : Color.GREY_400
  const text = delegate.activelyConnected ? getString('connected') : getString('delegate.notConnected')
  return (
    <div className={css.delegateItemContainer}>
      <Dialog
        isOpen={!!troubleshooterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshooter(false)}
      >
        <DelegateInstallationError showDelegateInstalledMessage={false} />
      </Dialog>
      <Text
        icon={delegateTypeToIcon(delegate.delegateType as string)}
        iconProps={{ size: 24 }}
        margin={{ left: 'xxlarge' }}
      />
      <Layout.Vertical className={css.tokenItemColumn} margin={{ left: 'large' }}>
        <Text color={Color.GREY_800}>{delegate.groupName}</Text>
      </Layout.Vertical>
      <Layout.Vertical className={css.tokenItemColumn}>
        <Text icon="full-circle" iconProps={{ size: 6, color: statusColor, padding: 'small' }} color={Color.GREY_800}>
          {text}
        </Text>
        {!delegate.activelyConnected && delegate.delegateType === 'KUBERNETES' && (
          <Button
            minimal
            className={css.troubleshootLink}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              setOpenTroubleshooter(true)
            }}
          >
            {getString('delegates.troubleshootOption')}
          </Button>
        )}
      </Layout.Vertical>
    </div>
  )
}

interface DelegateTokensListParams {
  tokenName: string
}
const DelegateTokensList: FC<DelegateTokensListParams> = ({ tokenName }) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const [searchTerm, setSearchTerm] = useState('')

  const { data, loading } = useGetDelegateGroupsUsingToken({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      delegateTokenName: tokenName
    } as GetDelegateGroupsUsingTokenQueryParams
  })

  const delegates = data?.resource?.delegateGroupDetails || []

  const filteredDelegates = useMemo(() => {
    if (!searchTerm) {
      return delegates
    }
    return (
      delegates?.filter((del: DelegateGroupDetails) =>
        del?.groupName?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    )
  }, [delegates, searchTerm])

  let noDelegatesMessage
  if (delegates !== undefined) {
    if (delegates?.length === 0) {
      noDelegatesMessage = getString('delegates.tokens.tokenNotUsedByDelegates')
    } else if (filteredDelegates.length === 0) {
      noDelegatesMessage = getString('delegates.tokens.tokenBySearchNameNotExisting')
    }
  }

  return (
    <Layout.Vertical>
      {loading ? (
        <PageSpinner />
      ) : delegates?.length ? (
        <ExpandingSearchInput
          alwaysExpanded
          width={250}
          placeholder={getString('search')}
          throttle={200}
          onChange={setSearchTerm}
          className={css.search}
        />
      ) : null}
      <Layout.Vertical spacing="small" className={css.tokenListDelegateContainer}>
        {noDelegatesMessage && <Text>{noDelegatesMessage}</Text>}
        {filteredDelegates.map(delegate => (
          <DelegateItem key={delegate.groupId} delegate={delegate} />
        ))}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default DelegateTokensList
