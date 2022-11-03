/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useStrings } from 'framework/strings'
import bgImageURL from './ff.svg'
import { Hosting } from '@cd/pages/get-started-with-cd/DeployProvisioningWizard/Constants'

const CFTrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const isOnPrem = (): boolean => window.deploymentType === Hosting.OnPrem
  const isFreeEnabled = !isOnPrem

  const startBtnDescription = isFreeEnabled
    ? getString('common.startFreePlan', { module: 'FF' })
    : getString('cf.cfTrialHomePage.startTrial.startBtn.description')
  import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
  import { FeatureFlag } from '@common/featureFlags'
  import { CFTrialTemplate } from './CFTrialTemplate'

  const startTrialProps = {
    description: getString('cf.cfTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cf.learnMore'),
      url: 'https://docs.harness.io/article/0a2u2ppp8s-getting-started-with-continuous-features'
    },
    startBtn: {
      description: !isOnPrem
        ? getString('cf.cfTrialHomePage.startFreePlanBtn')
        : getString('cf.cfTrialHomePage.startTrial.startBtn.description')
    }
  }

  return <CFTrialTemplate cfTrialProps={startTrialProps} />
}

export default CFTrialHomePage
