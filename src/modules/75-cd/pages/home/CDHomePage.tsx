/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { ModuleName } from 'framework/types/ModuleName'
import { useCDTrialModal } from '@pipeline/components/PipelineStudio/CDTrial/useCDTrialModal'
import HomePageByModule from '@pipeline/components/HomePageByModule/HomePageByModule'
import bgImageURL from './images/cd.svg'

const CDHomePage: React.FC = () => {
  return <HomePageByModule moduleName={ModuleName.CD} bgImageURL={bgImageURL} useTrialModal={useCDTrialModal} />
}

export default CDHomePage
