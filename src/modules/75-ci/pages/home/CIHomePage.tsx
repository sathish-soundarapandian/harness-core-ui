/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { ModuleName } from 'framework/types/ModuleName'
import { useCITrialModal } from '@pipeline/components/PipelineStudio/CITrial/useCITrialModal'
import HomePageByModule from '@pipeline/components/HomePageByModule/HomePageByModule'
import bgImageURL from './images/ci.svg'

const CIHomePage: React.FC = () => {
  return <HomePageByModule moduleName={ModuleName.CI} bgImageURL={bgImageURL} useTrialModal={useCITrialModal} />
}

export default CIHomePage
