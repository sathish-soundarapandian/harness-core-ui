/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useStrings } from 'framework/strings'
import { CFTrialTemplate } from './CFTrialTemplate'

const CFTrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const startTrialProps = {
    description: getString('cf.cfTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cf.learnMore'),
      url: 'https://docs.harness.io/article/0a2u2ppp8s-getting-started-with-continuous-features'
    },
    startBtn: {
      description:
        window.deploymentType === 'ON_PREM'
          ? getString('cf.cfTrialHomePage.startTrial.startBtn.description')
          : getString('cf.cfTrialHomePage.startFreePlanBtn')
    }
  }

  return <CFTrialTemplate cfTrialProps={startTrialProps} />
}

export default CFTrialHomePage
