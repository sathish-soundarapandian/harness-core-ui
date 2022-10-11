/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { PageError, PageSpinner } from '@harness/uicore'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useGetAllFeatures } from 'services/cf'
import routes from '@common/RouteDefinitions'

const ConfigurePath: React.FC = () => {
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const history = useHistory()

  const { data, loading, error, refetch } = useGetAllFeatures({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }
  })

  useEffect(() => {
    if (!loading && data) {
      if (data.itemCount) {
        history.push(
          routes.toCFFeatureFlags({
            projectIdentifier,
            orgIdentifier,
            accountId: accountIdentifier
          })
        )
      } else {
        history.push(
          routes.toCFOnboarding({
            projectIdentifier,
            orgIdentifier,
            accountId: accountIdentifier
          })
        )
      }
    }
  }, [data, loading])

  if (error) {
    return <PageError message={error.message} onClick={() => refetch()} />
  }
  return <PageSpinner />
}
export default ConfigurePath
