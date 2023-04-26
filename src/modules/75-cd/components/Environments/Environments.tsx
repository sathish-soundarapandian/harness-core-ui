/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'

import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useToaster } from '@harness/uicore'

import { useGetSettingValue } from 'services/cd-ng'

import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { SettingType } from '@common/constants/Utils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import { Views, EnvironmentStoreContext } from './common'
import { EnvironmentList } from './EnvironmentList/EnvironmentsList'

export const Environments: React.FC = () => {
  const [view, setView] = useState(Views.INSIGHT)
  const fetchDeploymentList = useRef<() => void>(noop)
  const { accountId } = useParams<AccountPathProps>()

  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()

  const isSettingsEnabled = useFeatureFlag(FeatureFlag.NG_SETTINGS)
  const { data: forceDeleteSettings, error: forceDeleteSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_FORCE_DELETE,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: !isSettingsEnabled
  })

  React.useEffect(() => {
    if (forceDeleteSettingsError) {
      showError(getRBACErrorMessage(forceDeleteSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceDeleteSettingsError])

  return (
    <EnvironmentStoreContext.Provider
      value={{
        view,
        setView,
        fetchDeploymentList
      }}
    >
      <HelpPanel referenceId="environmentListing" type={HelpPanelType.FLOATING_CONTAINER} />
      <EnvironmentList isForceDeleteEnabled={forceDeleteSettings?.data?.value === 'true'} />
    </EnvironmentStoreContext.Provider>
  )
}
