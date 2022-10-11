/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, PropsWithChildren } from 'react'
import SectionNoData from '@cf/components/NoData/SectionNoData/SectionNoData'
import { useStrings } from 'framework/strings'
import rampUpChangesImg from '@cf/images/ProgressiveDelivery.svg'
import teamImg from '@cf/images/Team.svg'
import canaryImg from '@cf/images/Canary.svg'
import rollbackImg from '@cf/images/Rollback.svg'

const FlagsSectionNoData: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { getString } = useStrings()

  return (
    <SectionNoData
      message={getString('cf.continuous')}
      description={getString('cf.featureFlags.noFeatureFlagsDescription')}
      panels={[
        { imageURL: rampUpChangesImg, description: getString('cf.featureFlags.rampUpChanges') },
        { imageURL: teamImg, description: getString('cf.featureFlags.targetUsers') },
        { imageURL: canaryImg, description: getString('cf.featureFlags.testChanges') },
        { imageURL: rollbackImg, description: getString('cf.featureFlags.rollbackChanges') }
      ]}
    >
      {children}
    </SectionNoData>
  )
}

export default FlagsSectionNoData
