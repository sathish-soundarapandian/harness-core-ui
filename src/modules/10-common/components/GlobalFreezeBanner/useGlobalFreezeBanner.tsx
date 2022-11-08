/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetGlobalFreezeWithBannerDetails } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

export const useGlobalFreezeBanner = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const isNgDeploymentFreezeEnabled = useFeatureFlag(FeatureFlag.NG_DEPLOYMENT_FREEZE)

  const { data, refetch } = useGetGlobalFreezeWithBannerDetails({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: !isNgDeploymentFreezeEnabled
  })

  return { globalFreezes: data?.data?.activeOrUpcomingGlobalFreezes, refetch }
}
