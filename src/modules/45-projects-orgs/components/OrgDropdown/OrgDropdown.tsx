/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DropDown, SelectOption } from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationListPromise, OrganizationResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface OrgDropdownProps {
  onChange: (item: SelectOption) => void
  value?: SelectOption
  className?: string
}

const OrgDropdown: React.FC<OrgDropdownProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const [query, setQuery] = useState<string>()
  const { getString } = useStrings()

  function orgListPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      getOrganizationListPromise({ queryParams: { accountIdentifier: accountId, searchTerm: query, pageSize: 100 } })
        .then(result => {
          let selectItems: Array<SelectOption> = []

          if (result?.data?.content?.length) {
            selectItems = result?.data?.content?.reduce?.(
              (selected: Array<SelectOption>, item: OrganizationResponse) => {
                if (item.organization?.name && item.organization?.identifier) {
                  return [...selected, { label: item.organization.name, value: item.organization.identifier }]
                }
                return selected
              },
              []
            )
          }

          resolve(selectItems)
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
