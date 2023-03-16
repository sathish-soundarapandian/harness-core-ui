/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DropDown, SelectOption } from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAllServicesPromise, ServiceResponse } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
interface ServiceDropdownProps {
  onChange: (item: SelectOption) => void
  value?: SelectOption
  className?: string
}

const ServiceDropdown: React.FC<ServiceDropdownProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const [query, setQuery] = useState<string>()

  function serviceListPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      getAllServicesPromise({ queryParams: { accountIdentifier: accountId, searchTerm: query } })
        .then(result => {
          let selectItems: Array<SelectOption> = []
          if (result?.data?.content?.length) {
            selectItems = result?.data?.content?.reduce?.((selected: Array<SelectOption>, item: ServiceResponse) => {
              if (item.service?.name && item.service?.identifier) {
                return [...selected, { label: item.service.name, value: item.service.identifier }]
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
      buttonTestId="service-select"
      onChange={props.onChange}
      value={props.value}
      items={serviceListPromise}
      usePortal={true}
      addClearBtn={true}
      query={query}
      onQueryChange={setQuery}
      placeholder={'Services'}
    />
  )
}

export default ServiceDropdown
