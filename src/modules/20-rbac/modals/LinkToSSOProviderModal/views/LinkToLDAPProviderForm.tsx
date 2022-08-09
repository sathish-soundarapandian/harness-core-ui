/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Layout, FormInput, Radio, TableV2, Text, ButtonVariation, PageError } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { LdapGroupResponse, useSearchLdapGroups } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../useLinkToSSOProviderModal.module.scss'

const LinkToLDAPProviderForm: React.FC = () => {
  const { setFieldValue, getFieldProps } = useFormikContext()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [groupSearchText, setGroupSearchText] = useState<string>('')

  const {
    data: groupSearchDataResponse,
    loading: groupSearchLoading,
    refetch: refetchLdapGroups,
    error: errorGroupSearch
  } = useSearchLdapGroups({
    ldapId: getFieldProps('sso')?.value as string, // pass only id
    queryParams: {
      accountIdentifier: accountId,
      name: groupSearchText,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const groupSearchData = groupSearchDataResponse?.resource as LdapGroupResponse[]

  const RenderColumnName: Renderer<CellProps<LdapGroupResponse>> = ({ row }) => {
    const data = row.original
    return (
      <div className={css.wrapper}>
        <Radio
          key={row.index}
          label={data.name}
          checked={getFieldProps('selectedRadioValue')?.value?.dn === data.dn}
          onChange={() => {
            setFieldValue('selectedRadioValue', data)
          }}
        />
      </div>
    )
  }

  const RenderColumnDescription: Renderer<CellProps<LdapGroupResponse>> = ({ row }) => {
    const data = row.original
    return data.description ? <Text>{data.description}</Text> : null
  }

  const RenderColumnTotalMembers: Renderer<CellProps<LdapGroupResponse>> = ({ row }) => {
    const data = row.original
    return data.totalMembers ? <Text>{data.totalMembers}</Text> : null
  }

  return (
    <Layout.Vertical>
      <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'medium' }}>
        {getString('rbac.userDetails.linkToSSOProviderModal.groupSearchLabel')}
      </Text>
      <Layout.Horizontal spacing="small">
        <FormInput.Text
          disabled={!getFieldProps('sso').value || groupSearchLoading}
          name="groupSearch"
          placeholder={getString('common.searchByNamePlaceholder')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setGroupSearchText(e.target.value?.trim())
          }}
          className={css.select}
        />
        <Button
          small
          variation={ButtonVariation.SECONDARY}
          padding="xsmall"
          data-testid="searchLdapGroup"
          text={getString('search')}
          onClick={() => {
            setFieldValue('selectedRadioValue', undefined)
            refetchLdapGroups()
          }}
          disabled={groupSearchLoading || !groupSearchText}
        />
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_400}>
        {getString('rbac.userDetails.linkToSSOProviderModal.groupSearchInfo')}
      </Text>
      {errorGroupSearch && <PageError message={getRBACErrorMessage(errorGroupSearch as any)} />}
      {groupSearchData && groupSearchData.length === 0 && (
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_700} padding="medium">
          {getString('common.filters.noResultsFound')}
        </Text>
      )}
      {groupSearchData && groupSearchData.length > 0 && (
        <TableV2
          columns={[
            {
              Header: getString('name'),
              id: 'name',
              accessor: 'name',
              width: '40%',
              Cell: RenderColumnName,
              disableSortBy: true
            },
            {
              Header: getString('description'),
              id: 'description',
              width: '45%',
              disableSortBy: true,
              Cell: RenderColumnDescription
            },
            {
              Header: getString('members'),
              id: 'members',
              width: '15%',
              disableSortBy: true,
              Cell: RenderColumnTotalMembers
            }
          ]}
          data={groupSearchData.slice(0, 10)}
          hideHeaders={false}
          minimal
        />
      )}
    </Layout.Vertical>
  )
}

export default LinkToLDAPProviderForm
