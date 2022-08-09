/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import type { ResourceScope } from 'services/rbac/index'
import RbacFactory from '@rbac/factories/RbacFactory'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { StringsMap } from 'stringTypes'
import css from './RBACTooltip.module.scss'

interface Props {
  permission: PermissionIdentifier
  resourceType: ResourceType
  resourceScope?: ResourceScope
  resourceTypeLabel?: string
  className?: string
}

const RBACTooltip: React.FC<Props> = ({ permission, resourceType, resourceScope, resourceTypeLabel, className }) => {
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const resourceTypeHandler = RbacFactory.getResourceTypeHandler(resourceType)
  const currentScope = getScopeFromDTO(
    resourceScope || {
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    }
  )

  const getProjectScopeSuffix = (): string => {
    if (
      selectedProject?.identifier === resourceScope?.projectIdentifier ||
      selectedProject?.identifier === projectIdentifier
    ) {
      return selectedProject?.name || resourceScope?.projectIdentifier || projectIdentifier
    } else {
      return resourceScope?.projectIdentifier || projectIdentifier
    }
  }

  const getScopeSuffix = (): string => {
    const currentScopeLabel = getString(`rbac.${currentScope}` as keyof StringsMap)
    switch (currentScope) {
      case Scope.PROJECT: {
        return `${currentScopeLabel} "${getProjectScopeSuffix()}"`
      }
      case Scope.ORG: {
        return `${currentScopeLabel} "${resourceScope?.orgIdentifier || orgIdentifier}"`
      }
      case Scope.ACCOUNT: {
        return getString('rbac.accountScope')
      }
    }
  }

  return (
    <Layout.Vertical padding="small" spacing="small" className={className}>
      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_800}>
        {`${getString('rbac.youAreNotAuthorizedTo')} `}
        <span className={css.textToLowercase}>{resourceTypeHandler?.permissionLabels?.[permission] || permission}</span>
        <span>{` ${resourceTypeHandler?.label ? getString(resourceTypeHandler?.label) : resourceTypeLabel}.`}</span>
      </Text>
      <Text font={{ size: 'small' }} color={Color.GREY_800}>
        {getString('rbac.youAreMissingTheFollowingPermission')}
      </Text>
      <Text font={{ size: 'small' }} color={Color.GREY_800}>
        {'"'}
        {resourceTypeHandler?.permissionLabels?.[permission] || permission}
        <span>{` ${resourceTypeHandler?.label ? getString(resourceTypeHandler?.label) : resourceTypeLabel}`}</span>
        {'"'}
        <span>{` ${getString('rbac.in')} ${getScopeSuffix()}`}</span>
      </Text>
    </Layout.Vertical>
  )
}

export default RBACTooltip
