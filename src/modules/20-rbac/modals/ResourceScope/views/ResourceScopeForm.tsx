/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { groupBy, isEqual, uniqWith } from 'lodash-es'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ModulePathParams, ResourceGroupDetailsPathProps } from '@common/interfaces/RouteInterfaces'
import { includesCurrentScope } from '@rbac/pages/ResourceGroupDetails/utils'
import { useStrings } from 'framework/strings'
import type { ScopeSelector } from 'services/resourcegroups'
import { Scope } from '@common/interfaces/SecretsInterface'
import AccountCustomScope from './AccountCustomScope'
import OrgCustomScope from './OrgCustomScope'
import css from './ResourceScopeForm.module.scss'

interface ResourceScopeFormProps {
  scopes: ScopeSelector[]
  onSubmit: (scopes: ScopeSelector[]) => void
  onCancel: () => void
}
const ResourceScopeForm: React.FC<ResourceScopeFormProps> = ({ scopes, onSubmit, onCancel }) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ResourceGroupDetailsPathProps & ModulePathParams>()
  const resourceGroupScope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  const scopeGroup = groupBy(scopes, 'orgIdentifier')
  const [isUpdated, setIsUpdated] = useState<boolean>(false)
  const [hasCurrentScope, setHasCurrentScope] = useState(includesCurrentScope(scopes, resourceGroupScope))
  const [selectedScopes, setSelectedScopes] = useState(Object.values(scopeGroup))
  const { getString } = useStrings()

  const isCurrentScope = (scope: ScopeSelector): boolean => {
    return (
      scope.accountIdentifier === accountId &&
      scope.orgIdentifier === orgIdentifier &&
      scope.projectIdentifier === projectIdentifier &&
      scope.filter === 'EXCLUDING_CHILD_SCOPES'
    )
  }

  const getIncludedScopes = (): ScopeSelector[] => {
    const scopeArray = selectedScopes.flat()
    if (hasCurrentScope) {
      return uniqWith(
        [
          {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            filter: 'EXCLUDING_CHILD_SCOPES'
          },
          ...scopeArray
        ],
        isEqual
      )
    } else {
      return uniqWith(
        scopeArray.filter(scope => !isCurrentScope(scope)),
        isEqual
      )
    }
  }

  const onCurrentScopeChange = (value: boolean): void => {
    setIsUpdated(true)
    setHasCurrentScope(_value => value)
  }

  return (
    <Layout.Vertical>
      <Layout.Vertical className={cx(css.main, css.custom)}>
        {resourceGroupScope === Scope.ACCOUNT && (
          <AccountCustomScope
            selectedScopes={selectedScopes}
            setSelectedScopes={_scopes => {
              setIsUpdated(true)
              setSelectedScopes(_scopes)
            }}
            hasCurrentScope={hasCurrentScope}
            onCurrentScopeChange={onCurrentScopeChange}
          />
        )}
        {resourceGroupScope === Scope.ORG && (
          <OrgCustomScope
            selectedScopes={selectedScopes}
            setSelectedScopes={_scopes => {
              setIsUpdated(true)
              setSelectedScopes(_scopes)
            }}
            hasCurrentScope={hasCurrentScope}
            onCurrentScopeChange={onCurrentScopeChange}
          />
        )}
      </Layout.Vertical>
      <Layout.Horizontal spacing="small" padding={{ top: 'small' }}>
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('common.apply')}
          disabled={!isUpdated}
          onClick={() => {
            onSubmit(getIncludedScopes())
          }}
        />
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default ResourceScopeForm
