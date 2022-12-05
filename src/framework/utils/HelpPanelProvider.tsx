/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HelpPanelContextProvider, HelpPanelEnvironment } from '@harness/help-panel'

const HelpPanelProvider: React.FC = props => {
  return (
    <HelpPanelContextProvider
      accessToken="iMDhj0H7-zbCwnAe4avVNNFBni6-dZr4vLcaRNi5UUY"
      space="jj62blws1bo9"
      environment={'production' as HelpPanelEnvironment}
    >
      {props.children}
    </HelpPanelContextProvider>
  )
}

export default HelpPanelProvider
