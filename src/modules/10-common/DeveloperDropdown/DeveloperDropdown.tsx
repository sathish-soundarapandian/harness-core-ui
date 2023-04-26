/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DropDown, SelectOption } from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { listActiveDevelopersPromise } from 'services/ci'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface DeveloperDropdownProps {
  onChange: (item: SelectOption) => void
  value?: SelectOption
  className?: string
}

const DeveloperDropdown: React.FC<DeveloperDropdownProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const [query, setQuery] = useState<string>()
  const { getString } = useStrings()

  function developerListPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      listActiveDevelopersPromise({ queryParams: { accountIdentifier: accountId, timestamp: new Date().getTime() } })
        .then(result => {
          let selectItems: Array<SelectOption> = []
          if (result?.data?.length) {
            selectItems = result?.data?.reduce?.((selected: Array<SelectOption>, item: string) => {
              if (item) {
                return [...selected, { label: item, value: item }]
              }
              return selected
            }, [])
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
      buttonTestId="developer-select"
      onChange={props.onChange}
      value={props.value}
      items={developerListPromise}
      usePortal={true}
      addClearBtn={true}
      query={query}
      onQueryChange={setQuery}
      placeholder={getString('common.subscriptions.usage.developers')}
    />
  )
}

export default DeveloperDropdown
