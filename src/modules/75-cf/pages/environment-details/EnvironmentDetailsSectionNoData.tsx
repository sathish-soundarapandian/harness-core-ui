/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, PropsWithChildren } from 'react'
import SectionNoData from '@cf/components/NoData/SectionNoData/SectionNoData'
import { useStrings } from 'framework/strings'
import differentKeysEnvironmentImg from '@cf/images/differentKeysEnvironment.svg'
import differentKeysLanguagesImg from '@cf/images/differentKeysLanguages.svg'
import rotateMonitorKeysImg from '@cf/images/rotateMonitorKeys.svg'

const EnvironmentDetailsSectionNoData: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { getString } = useStrings()

  return (
    <SectionNoData
      message={getString('cf.environments.apiKeys.title')}
      description={getString('cf.environments.apiKeys.description')}
      panels={[
        {
          imageURL: differentKeysEnvironmentImg,
          description: getString('cf.environments.apiKeys.keysForEnvironment')
        },
        { imageURL: differentKeysLanguagesImg, description: getString('cf.environments.apiKeys.keysForLanguages') },
        { imageURL: rotateMonitorKeysImg, description: getString('cf.environments.apiKeys.rotateAndMonitor') }
      ]}
    >
      {children}
    </SectionNoData>
  )
}

export default EnvironmentDetailsSectionNoData
