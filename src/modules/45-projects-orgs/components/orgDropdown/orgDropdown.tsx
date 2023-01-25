/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DropDown, SelectOption } from '@harness/uicore'
import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getOrganizationListPromise } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface OrgDropdownProps {
  onChange: (item: SelectOption) => void
  value?: string
  className?: string
}
enum OrgFilter {
  ALL = '$$ALL$$'
}
const OrgDropdown: React.FC<OrgDropdownProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const [query, setQuery] = useState<string>()
  const { getString } = useStrings()
  const allOrgsSelectOption: SelectOption = useMemo(
    () => ({
      label: getString('all'),
      value: OrgFilter.ALL
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  function orgListPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      getOrganizationListPromise({ queryParams: { accountIdentifier: accountId, searchTerm: query } })
        .then(result => {
          const selectItems = result?.data?.content?.map(item => {
            return { label: item.organization.name || '', value: item.organization.identifier || '' }
          }) as SelectOption[]
          resolve([allOrgsSelectOption, ...selectItems] || [])
        })
        .catch(() => {
          resolve([])
        })
    })
  }

  return (
    <DropDown
      className={props.className}
      buttonTestId="org-select"
      onChange={props.onChange}
      value={props.value}
      items={orgListPromise}
      usePortal={true}
      addClearBtn={true}
      query={query}
      onQueryChange={setQuery}
      placeholder={getString('orgsText')}
    />
  )
}

export default OrgDropdown
