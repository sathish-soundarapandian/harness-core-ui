/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, PropsWithChildren } from 'react'
import SectionNoData from '@cf/components/NoData/SectionNoData/SectionNoData'
import { useStrings } from 'framework/strings'
import accountLevelTargetsImg from '@cf/images/accountLevelTargets.svg'
import targetsByGeoImg from '@cf/images/targetsByGeo.svg'
import targetsForUsers from '@cf/images/targetsForUsers.svg'

const SegmentSectionNoData: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { getString } = useStrings()

  return (
    <SectionNoData
      message={getString('cf.shared.segment')}
      description={getString('cf.targetDetail.targetGroupDescription')}
      panels={[
        {
          imageURL: targetsForUsers,
          description: getString('cf.targetDetail.vipTargets')
        },
        { imageURL: accountLevelTargetsImg, description: getString('cf.targetDetail.groupsForLocations') },
        { imageURL: targetsByGeoImg, description: getString('cf.targetDetail.regions') }
      ]}
    >
      {children}
    </SectionNoData>
  )
}

export default SegmentSectionNoData
