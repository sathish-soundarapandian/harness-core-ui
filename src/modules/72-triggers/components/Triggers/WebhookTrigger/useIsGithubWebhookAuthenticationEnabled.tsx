/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useToaster } from '@harness/uicore'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useGetSettingValue } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SettingType } from '@default-settings/interfaces/SettingType.types'
import { getErrorMessage } from '../utils'

const useIsGithubWebhookAuthenticationEnabled = (): {
  isGithubWebhookAuthenticationEnabled: boolean
  isGithubWebhookAuthenticationDataLoading: boolean
} => {
  const { showError } = useToaster()
  const { NG_SETTINGS } = useFeatureFlags()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const {
    data: projectSettingData,
    loading: isGithubWebhookAuthenticationDataLoading,
    error: projectSettingDataError
  } = useGetSettingValue({
    identifier: SettingType.WEBHOOK_GITHUB_TRIGGERS_AUTHENTICATION,
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    },
    lazy: !NG_SETTINGS
  })

  useEffect(() => {
    if (projectSettingDataError) {
      showError(getErrorMessage(projectSettingDataError))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSettingDataError])

  const isGithubWebhookAuthenticationEnabled = useMemo(
    () => projectSettingData?.data?.value === 'true',
    [projectSettingData]
  )

  return { isGithubWebhookAuthenticationEnabled, isGithubWebhookAuthenticationDataLoading }
}

export default useIsGithubWebhookAuthenticationEnabled
