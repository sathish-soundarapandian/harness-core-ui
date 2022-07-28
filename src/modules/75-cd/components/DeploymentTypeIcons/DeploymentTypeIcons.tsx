/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { deploymentTypeIcon, ServiceTypes } from '@pipeline/utils/DeploymentTypeUtils'

export interface DeploymentTypeIconsProps {
  deploymentTypes: string[]
  limit?: number
  size?: number
}

export const DeploymentTypeIcons: React.FC<DeploymentTypeIconsProps> = props => {
  const { deploymentTypes, size = 18, limit = 2 } = props
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      {deploymentTypes.slice(0, limit).map((deploymentType: string) => {
        return (
          <Icon
            key={deploymentType}
            name={deploymentTypeIcon[deploymentType as ServiceTypes]}
            size={size}
            padding={{ left: 'xsmall', right: 'xsmall' }}
          />
        )
      })}
      {deploymentTypes.length > limit ? <Text>{`+ ${deploymentTypes.length - limit}`}</Text> : <></>}
    </Layout.Horizontal>
  )
}
