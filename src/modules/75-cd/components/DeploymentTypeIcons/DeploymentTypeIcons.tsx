/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName, Layout, Text } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { deploymentTypeIcon, ServiceTypes } from '@pipeline/utils/DeploymentTypeUtils'
import { ImagePreview } from '@common/components/ImagePreview/ImagePreview'
import type { IconDTO } from 'services/cd-ng'

export interface DeploymentTypeIconsProps {
  deploymentTypes: string[]
  limit?: number
  size?: number
  deploymentIconList?: IconDTO[]
}

export const DeploymentTypeIcons: React.FC<DeploymentTypeIconsProps> = ({
  deploymentTypes,
  deploymentIconList = [],
  size = 18,
  limit = 2
}) => {
  const deploymentTypeToIconMap = React.useMemo(() => {
    const map = new Map<string, IconName | string>()
    deploymentIconList.forEach(item => {
      if (item && item.deploymentType) {
        const icon = defaultTo(item.icon, deploymentTypeIcon[item.deploymentType as ServiceTypes])
        map.set(item.deploymentType, icon)
      }
    })
    return map
  }, [deploymentIconList])

  const remainingTypesCount = deploymentTypes.length - limit
  const shouldRenderRemainingTypesCount = remainingTypesCount > 0

  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      {deploymentTypes.slice(0, limit).map((deploymentType: string) => {
        const typeIcon = deploymentTypeToIconMap.get(deploymentType)
        return typeIcon ? (
          <ImagePreview
            key={deploymentType}
            size={size}
            src={typeIcon}
            alt={deploymentType}
            fallbackIcon={deploymentTypeIcon[deploymentType as ServiceTypes]}
          />
        ) : (
          <Icon key={deploymentType} name={deploymentTypeIcon[deploymentType as ServiceTypes]} size={size} />
        )
      })}
      {shouldRenderRemainingTypesCount ? (
        <Text
          key="remainingTypesCount"
          font={{ variation: FontVariation.SMALL }}
          color={Color.GREY_600}
          padding={{ left: 'small' }}
        >{` + ${remainingTypesCount}`}</Text>
      ) : null}
    </Layout.Horizontal>
  )
}
