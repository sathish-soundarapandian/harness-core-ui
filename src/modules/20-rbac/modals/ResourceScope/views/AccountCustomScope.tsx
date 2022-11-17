/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Text,
  Button,
  Card,
  Checkbox,
  DropDown,
  Label,
  Layout,
  SelectOption,
  ButtonVariation,
  PageSpinner,
  ButtonSize
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useLayoutEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import { defaultTo } from 'lodash-es'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetOrganizationList } from 'services/cd-ng'
import type { ScopeSelector } from 'services/resourcegroups'
import { getAllProjects, includeProjects, includesCurrentScope } from '@rbac/pages/ResourceGroupDetails/utils'
import { Scope } from '@common/interfaces/SecretsInterface'
import OrgSelectionRenderer from './OrgSelectionRenderer'
import css from './ResourceScopeForm.module.scss'

interface AccountCustomScopeProps {
  selectedScopes: ScopeSelector[][]
  setSelectedScopes: React.Dispatch<React.SetStateAction<ScopeSelector[][]>>
  hasCurrentScope: boolean
  onCurrentScopeChange: (value: boolean) => void
}

const AccountCustomScope: React.FC<AccountCustomScopeProps> = ({
  selectedScopes,
  setSelectedScopes,
  hasCurrentScope,
  onCurrentScopeChange
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const newOrgAdded = useRef(false)
  const { getString } = useStrings()

  if (selectedScopes.length < (hasCurrentScope ? 2 : 1)) {
    selectedScopes.push([])
  }
  const { data: orgData, loading } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })

  const organizations: SelectOption[] = defaultTo(
    orgData?.data?.content?.map(org => {
      return {
        label: org.organization.name,
        value: org.organization.identifier
      }
    }),
    []
  )

  useLayoutEffect(() => {
    if (!newOrgAdded.current) {
      return
    }
    const elem = document.getElementById(`ORG-CARD-${selectedScopes.length - 1}`)
    elem?.scrollIntoView()
  }, [selectedScopes])

  return (
    <Layout.Vertical spacing="small">
      {loading && /* istanbul ignore next */ <PageSpinner />}
      <Checkbox
        label={getString('rbac.resourceScope.includeAccResources')}
        data-testid={`INCLUDE_ACC_RESOURCES`}
        defaultChecked={hasCurrentScope}
        onChange={event => {
          onCurrentScopeChange(event.currentTarget.checked)
        }}
      />
      <Layout.Vertical spacing="medium">
        <Layout.Horizontal flex>
          <Text color={Color.BLACK} font={{ variation: FontVariation.H6 }}>
            {getString('rbac.scopeItems.orgsAndProjects')}
          </Text>
          <Button
            text={getString('rbac.resourceScope.selectOrgsandProjects')}
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            onClick={() => {
              setSelectedScopes(
                produce(selectedScopes, draft => {
                  draft.push([])
                })
              )
              newOrgAdded.current = true
            }}
          />
        </Layout.Horizontal>
        <Layout.Vertical spacing="medium" className={css.orgSelection}>
          {selectedScopes.map((scope, index) => {
            const org = scope?.[0]?.orgIdentifier
            return includesCurrentScope(scope, Scope.ACCOUNT) ? null : (
              <Card key={`${scope}-${index}-${org}`} id={`ORG-CARD-${index}`}>
                <Label>{getString('rbac.resourceScope.selectOrg')}</Label>
                <DropDown
                  value={org}
                  items={organizations}
                  width={200}
                  usePortal={true}
                  onChange={item => {
                    setSelectedScopes(
                      produce(selectedScopes, draft => {
                        draft[index] = [
                          {
                            filter: 'INCLUDING_CHILD_SCOPES',
                            accountIdentifier: accountId,
                            orgIdentifier: item.value.toString()
                          }
                        ]
                      })
                    )
                  }}
                />
                {typeof org === 'string' ? (
                  <OrgSelectionRenderer
                    accountIdentifier={accountId}
                    orgIdentifier={org}
                    includeProjects={includeProjects(selectedScopes[index])}
                    projects={getAllProjects(selectedScopes[index])}
                    onChange={scopes => {
                      setSelectedScopes(
                        produce(selectedScopes, draft => {
                          draft[index] = scopes
                        })
                      )
                    }}
                  />
                ) : null}
                <Button
                  variation={ButtonVariation.ICON}
                  icon="main-trash"
                  iconProps={{ size: 20 }}
                  className={css.deleteButton}
                  onClick={() => {
                    setSelectedScopes(
                      produce(selectedScopes, draft => {
                        draft.splice(index, 1)
                      })
                    )
                  }}
                />
              </Card>
            )
          })}
        </Layout.Vertical>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AccountCustomScope
