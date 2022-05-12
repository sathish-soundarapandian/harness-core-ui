/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, Text } from '@harness/uicore'
import type { Prerequisite } from 'services/cf'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import { VariationTypeIcon } from '../VariationTypeIcon/VariationTypeIcon'

interface PrerequisiteItemProps {
  prerequisite: Prerequisite
  permission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  flagArchived: boolean
  handlePrerequisiteInteraction: (action: 'edit' | 'delete', prereq: Prerequisite) => void
}

export const PrerequisiteItem: React.FC<PrerequisiteItemProps> = ({
  prerequisite,
  permission,
  flagArchived,
  handlePrerequisiteInteraction
}) => {
  const { getString } = useStrings()
  const isFlagTypeBoolean = ['true', 'false'].includes(prerequisite.variations[0])
  const flagVariation = prerequisite.variations[0]

  return (
    <Layout.Horizontal flex={{ alignItems: 'center' }}>
      <Text width="45%" lineClamp={1} color={Color.GREY_800} font={{ variation: FontVariation.SMALL }}>
        <VariationTypeIcon style={{ transform: 'translateY(1px)' }} multivariate={!isFlagTypeBoolean} />
        {prerequisite.feature}
      </Text>
      <Text width="45%" color={Color.GREY_800} font={{ variation: FontVariation.SMALL }}>
        {!isFlagTypeBoolean
          ? flagVariation
          : getString(flagVariation === 'true' ? 'cf.featureFlags.true' : 'cf.featureFlags.false')}
      </Text>
      <RbacOptionsMenuButton
        data-testid="prerequisiteMenuBtn"
        items={[
          {
            role: 'link',
            icon: 'edit',
            text: getString('edit'),
            onClick: () => handlePrerequisiteInteraction('edit', prerequisite),
            disabled: flagArchived,
            permission: permission
          },
          {
            role: 'link',
            icon: 'cross',
            text: getString('delete'),
            onClick: () => handlePrerequisiteInteraction('delete', prerequisite),
            disabled: flagArchived,
            permission: permission
          }
        ]}
      />
    </Layout.Horizontal>
  )
}
