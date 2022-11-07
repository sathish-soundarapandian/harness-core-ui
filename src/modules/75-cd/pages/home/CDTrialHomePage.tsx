/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StartTrialTemplate } from '@rbac/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStrings } from 'framework/strings'
import { isOnPrem } from '@common/utils/utils'
import bgImageURL from './images/cd.svg'

const CDTrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const module = 'cd'
  const moduleType = 'CD'
  const isFreeEnabled = !isOnPrem()
  console.log(isFreeEnabled, 'hello')
  const startBtnDescription = isFreeEnabled
    ? getString('common.startFreePlan', { module: moduleType })
    : getString('cd.cdTrialHomePage.startTrial.startBtn.description')

  const startTrialProps = {
    description: getString('cd.cdTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cd.learnMore'),
      url: 'https://docs.harness.io/category/c9j6jejsws-cd-quickstarts'
    },
    startBtn: {
      description: startBtnDescription
    }
  }

  return (
    <StartTrialTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module={module}
    />
  )
}

export default CDTrialHomePage
