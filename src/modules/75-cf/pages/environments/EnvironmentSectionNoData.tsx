/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, PropsWithChildren } from 'react'
import SectionNoData from '@cf/components/NoData/SectionNoData/SectionNoData'
import { useStrings } from 'framework/strings'
import auditTrailsImg from '@cf/images/AuditTrails.svg'
import configurationsImg from '@cf/images/Configurations.svg'
import limitAccessImg from '@cf/images/LimitAccess.svg'

const EnvironmentSectionNoData: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { getString } = useStrings()

  return (
    <SectionNoData
      message={getString('environments')}
      description={getString('cf.environments.noEnvironmentSection.message')}
      panels={[
        {
          imageURL: configurationsImg,
          description: getString('cf.environments.noEnvironmentSection.configurations')
        },
        { imageURL: limitAccessImg, description: getString('cf.environments.noEnvironmentSection.limitation') },
        { imageURL: auditTrailsImg, description: getString('cf.environments.noEnvironmentSection.auditTrails') }
      ]}
    >
      {children}
    </SectionNoData>
  )
}

export default EnvironmentSectionNoData
