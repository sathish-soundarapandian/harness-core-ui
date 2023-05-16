/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@harness/uicore'
import type { Region, UseAllRegionsProps } from 'services/lw';
import { useAllRegions } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface UseRegionsForSelectionProps {
  cloudAccountId: string
  additionalProps: Omit<UseAllRegionsProps, 'account_id'>
}

interface UseRegionsForSelectionReturnProps {
  data: SelectOption[]
  loading: boolean
}

const useRegionsForSelection = ({
  cloudAccountId,
  additionalProps
}: UseRegionsForSelectionProps): UseRegionsForSelectionReturnProps => {
  const { accountId } = useParams<AccountPathProps>()

  const [regionsData, setRegionsData] = useState<SelectOption[]>([])

  const { data, loading } = useAllRegions({
    account_id: accountId,
    queryParams: {
      cloud_account_id: cloudAccountId,
      accountIdentifier: accountId
    },
    ...additionalProps
  })

  useEffect(() => {
    setRegionsForSelection(data?.response)
  }, [data?.response])

  const setRegionsForSelection = (response: Region[] = []) => {
    const loaded = response.map(r => ({ label: r.label as string, value: r.name as string }))
    setRegionsData(loaded)
  }

  return {
    data: regionsData,
    loading
  }
}

export default useRegionsForSelection
