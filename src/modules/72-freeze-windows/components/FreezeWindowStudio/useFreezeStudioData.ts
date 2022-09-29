/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { useGetOrganizationAggregateDTOList } from 'services/cd-ng'
import type { ResourcesInterface } from '@freeze-windows/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

export const useFreezeStudioData = ({ accountId }: AccountPathProps): ResourcesInterface => {
  const {
    loading: loadingOrgs,
    data: orgsData,
    refetch: refetchOrgs
    // error: orgsError
  } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const [orgs, setOrgs] = React.useState<SelectOption[]>([])
  // data.content[1].organizationResponse.organization.identifier
  React.useEffect(() => {
    refetchOrgs()
  }, [accountId])

  React.useEffect(() => {
    if (!loadingOrgs && orgsData?.data?.content) {
      const adaptedOrgsData = orgsData.data.content.map(org => {
        const organization = org?.organizationResponse?.organization
        return {
          label: organization?.name,
          value: organization?.identifier
        }
      })
      setOrgs(adaptedOrgsData)
    }
  }, [loadingOrgs])

  return {
    orgs,
    projects: []
  }
}
