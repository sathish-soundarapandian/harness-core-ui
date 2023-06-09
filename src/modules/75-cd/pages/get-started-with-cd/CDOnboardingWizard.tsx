/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useFeatureFlag } from '@harnessio/ff-react-client-sdk'
import { useQueryParams } from '@common/hooks'
import { FeatureFlag } from '@common/featureFlags'
import type { GitQueryParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import WithABFFProvider from '@common/components/WithFFProvider/WithFFProvider'
import { EXPOSURE_EVENT, PLG_EXPERIMENTS } from '@common/components/WithFFProvider/PLGExperiments'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingProvider } from './CDOnboardingStore'
import { DeployProvisioningWizard } from './DeployProvisioningWizard/DeployProvisioningWizard'

function CDOnboardingWizard(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const { currentUserInfo } = useAppStore()
  const { identifyUser } = useTelemetry()
  useEffect(() => {
    identifyUser(currentUserInfo.email)
  }, [currentUserInfo.email])

  return (
    <CDOnboardingProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      serviceIdentifier={serviceId}
    >
      <CDWizardWithAB />
    </CDOnboardingProvider>
  )
}

const CDWizardWithAB: React.FC = () => {
  const {
    currentUserInfo: { uuid }
  } = useAppStore()

  return (
    <WithABFFProvider
      fallback={<DeployProvisioningWizard />}
      featureFlagsToken={window.HARNESS_PLG_FF_SDK_KEY}
      config={{
        experimentKey: [PLG_EXPERIMENTS.PLG_SERVICE_DELEGATE_TEST, PLG_EXPERIMENTS.CD_GET_STARTED],
        identifier: uuid
      }}
    >
      <CDWizardHooks />
    </WithABFFProvider>
  )
}

const CDWizardHooks: React.FC = () => {
  const FLOW_TYPE = useFeatureFlag(FeatureFlag.PLG_SERVICE_DELEGATE_AB)
  const trackExposure = useFeatureFlag(FeatureFlag.PLG_SERVICE_DELEGATE_EXPOSURE_ENABLED)
  const ONBOARDING_FLOW_TYPE = useFeatureFlag(FeatureFlag.PLG_CD_GET_STARTED_AB)
  const trackOnobardingExposure = useFeatureFlag(FeatureFlag.PLG_GET_STARTED_EXPOSURE_ENABLED)
  const { trackEvent } = useTelemetry()
  useEffect(() => {
    trackExposure &&
      trackEvent(EXPOSURE_EVENT, {
        flag_key: FeatureFlag.PLG_SERVICE_DELEGATE_AB,
        variant: FLOW_TYPE
      })

    trackOnobardingExposure &&
      trackEvent(EXPOSURE_EVENT, {
        flag_key: FeatureFlag.PLG_CD_GET_STARTED_AB,
        variant: ONBOARDING_FLOW_TYPE
      })
  }, [])
  return <DeployProvisioningWizard flowType={FLOW_TYPE} />
}
export default CDOnboardingWizard
