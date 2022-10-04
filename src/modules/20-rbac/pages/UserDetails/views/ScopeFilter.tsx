/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Layout,
  DropDown,
  SelectOption,
  MultiSelectDropDown,
  MultiSelectOption,
  Text,
  FontVariation,
  Color,
  Page,
  Button,
  ButtonVariation
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { getOrganizationListPromise, useGetProjectList, UserAggregate } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ScopeSelector } from 'services/rbac'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getDefaultSelectedFilter, ScopeFilterItems } from '@rbac/utils/utils'
import UserRoleBindings from './UserRoleBindings'
import UserGroupTable from './UserGroupTable'
import css from '../UserDetails.module.scss'

export enum UserDetailsViews {
  MEMBERSHIPS = 'MEMBERSHIPS',
  ROLE_BINDING = 'ROLE_BINDING'
}

enum ProjectFilter {
  ALL = '$$ALL$$'
}

interface ProjectMultiSelectProps {
  accountIdentifier: string
  orgIdentifier?: string
  onChange: (opts: MultiSelectOption[]) => void
}

const DEFAULT_ORG_ID = 'default'

const ProjectMultiSelect: React.FC<ProjectMultiSelectProps> = ({ accountIdentifier, orgIdentifier, onChange }) => {
  const { getString } = useStrings()
  const allProjectsOption: MultiSelectOption = {
    label: getString('all'),
    value: ProjectFilter.ALL
  }
  const [items, setItems] = useState<MultiSelectOption[]>([allProjectsOption])
  const [allProjectsSelected, setAllProjectsSelected] = useState<boolean>(true)
  const { data } = useGetProjectList({
    queryParams: {
      accountIdentifier,
      orgIdentifier
    }
  })

  useEffect(() => {
    setItems([allProjectsOption])
    setAllProjectsSelected(true)
  }, [accountIdentifier, orgIdentifier])

  const projects: MultiSelectOption[] = [
    allProjectsOption,
    ...defaultTo(
      data?.data?.content?.map(project => {
        return {
          label: project.project.name,
          value: project.project.identifier
        }
      }),
      []
    )
  ]
  const isAllProjectsSelected = (opts: MultiSelectOption[]): boolean =>
    !!opts.find(opt => opt.value === allProjectsOption.value)

  return (
    <MultiSelectDropDown
      value={items}
      items={projects}
      hideItemCount={allProjectsSelected}
      onChange={values => {
        if ((isAllProjectsSelected(values) && !allProjectsSelected) || values.length === 0) {
          setItems(_items => [allProjectsOption])
          setAllProjectsSelected(true)
          onChange([allProjectsOption])
        } else {
          const newItems = values.filter(opt => opt.value !== allProjectsOption.value)
          setItems(newItems)
          setAllProjectsSelected(false)
          onChange(newItems)
        }
      }}
      placeholder={allProjectsSelected ? getString('rbac.scopeItems.allProjects') : getString('projectsText')}
    />
  )
}

interface OrgSelectProps {
  accountIdentifier: string
  orgFilter?: string
  onChange: (opt: SelectOption) => void
  onError?: (error?: any) => void
}
const OrgSelect: React.FC<OrgSelectProps> = ({ accountIdentifier, orgFilter, onChange, onError }) => {
  const [orgQuery, setOrgQuery] = useState<string>('')
  const [loadingOrgs, setLoadingOrgs] = useState<boolean>(false)
  const { getString } = useStrings()

  const orgsPromise = async (): Promise<SelectOption[]> => {
    setLoadingOrgs(true)
    let organizations: SelectOption[] = []
    try {
      const orgsData = await getOrganizationListPromise({
        queryParams: {
          accountIdentifier,
          searchTerm: orgQuery
        }
      })
      const orgsList = defaultTo(orgsData?.data?.content, [])
      organizations = orgsList?.map(org => {
        return {
          label: org.organization.name,
          value: org.organization.identifier
        }
      }) as SelectOption[]
      if (!orgsList) {
        onError?.()
      }
    } catch (error) {
      onError?.(error)
    } finally {
      setLoadingOrgs(false)
    }
    return organizations
  }

  return (
    <DropDown
      disabled={loadingOrgs}
      placeholder={getString('rbac.resourceScope.selectOrg')}
      value={orgFilter}
      items={orgsPromise}
      onQueryChange={query => {
        setOrgQuery(query)
      }}
      onChange={onChange}
      query={orgQuery}
    />
  )
}
interface ScopeFilterProps {
  view: UserDetailsViews
  userData: UserAggregate
}

const ScopeFilter: React.FC<ScopeFilterProps> = ({ view, userData }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ accountId, orgIdentifier, projectIdentifier })
  const { getString } = useStrings()
  const [accountFilter, setAccountFilter] = useState(getDefaultSelectedFilter(scope))
  const [orgFilter, setOrgFilter] = useState<string | undefined>(orgIdentifier)
  const [orgFetchError, setOrgFetchError] = useState<boolean>(false)
  const getScopeDropDownItems = (): SelectOption[] => {
    switch (scope) {
      case Scope.ACCOUNT:
        return [
          {
            label: getString('all'),
            value: ScopeFilterItems.ALL
          },
          {
            label: getString('rbac.scopeItems.accountOnly'),
            value: ScopeFilterItems.ACCOUNT_ONLY
          },
          {
            label: getString('rbac.scopeItems.orgOnly'),
            value: ScopeFilterItems.ORG_ONLY
          },
          {
            label: getString('rbac.scopeItems.orgWithProjects'),
            value: ScopeFilterItems.ORG_WITH_PROJECTS
          }
        ]
      case Scope.ORG:
        return [
          {
            label: getString('all'),
            value: ScopeFilterItems.ALL
          },
          {
            label: getString('rbac.scopeItems.orgOnly'),
            value: ScopeFilterItems.ORG_ONLY
          },
          {
            label: getString('rbac.scopeItems.orgWithProjects'),
            value: ScopeFilterItems.ORG_WITH_PROJECTS
          }
        ]
      default:
        return [
          {
            label: getString('all'),
            value: ScopeFilterItems.ALL
          },
          {
            label: getString('rbac.scopeItems.projectOnly'),
            value: ScopeFilterItems.PROJECT_ONLY
          }
        ]
    }
  }

  const getScopeFilter = (filter: ScopeFilterItems, organization?: string): ScopeSelector[] => {
    switch (scope) {
      case Scope.ACCOUNT:
        if (filter === ScopeFilterItems.ALL) {
          return [
            {
              accountIdentifier: accountId,
              filter: 'INCLUDING_CHILD_SCOPES'
            }
          ]
        } else if (filter === ScopeFilterItems.ACCOUNT_ONLY) {
          return [
            {
              accountIdentifier: accountId,
              filter: 'EXCLUDING_CHILD_SCOPES'
            }
          ]
        } else if (organization) {
          return [
            {
              accountIdentifier: accountId,
              orgIdentifier: organization,
              filter: filter === ScopeFilterItems.ORG_ONLY ? 'EXCLUDING_CHILD_SCOPES' : 'INCLUDING_CHILD_SCOPES'
            }
          ]
        }
        break
      case Scope.ORG:
        if (filter === ScopeFilterItems.ALL) {
          return [
            {
              accountIdentifier: accountId,
              filter: 'EXCLUDING_CHILD_SCOPES'
            },
            {
              accountIdentifier: accountId,
              orgIdentifier,
              filter: 'INCLUDING_CHILD_SCOPES'
            }
          ]
        } else if (filter === ScopeFilterItems.ORG_ONLY) {
          return [
            {
              accountIdentifier: accountId,
              orgIdentifier,
              filter: 'EXCLUDING_CHILD_SCOPES'
            }
          ]
        } else {
          return [
            {
              accountIdentifier: accountId,
              orgIdentifier,
              filter: 'INCLUDING_CHILD_SCOPES'
            }
          ]
        }
      case Scope.PROJECT:
        if (filter === ScopeFilterItems.ALL) {
          return [
            {
              accountIdentifier: accountId,
              filter: 'EXCLUDING_CHILD_SCOPES'
            },
            {
              accountIdentifier: accountId,
              orgIdentifier,
              filter: 'EXCLUDING_CHILD_SCOPES'
            },
            {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier,
              filter: 'EXCLUDING_CHILD_SCOPES'
            }
          ]
        }
        if (filter === ScopeFilterItems.PROJECT_ONLY) {
          return [
            {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier,
              filter: 'EXCLUDING_CHILD_SCOPES'
            }
          ]
        }
        break
    }
    return []
  }

  const [scopeFilters, setScopeFilters] = useState<ScopeSelector[]>(getScopeFilter(getDefaultSelectedFilter(scope)))

  const getPageBody = (): React.ReactElement => {
    if (
      (!orgFilter &&
        (accountFilter === ScopeFilterItems.ORG_ONLY || accountFilter === ScopeFilterItems.ORG_WITH_PROJECTS)) ||
      orgFetchError
    ) {
      let message = getString('rbac.userDetails.invalidScopeText', { scope: getString('rbac.scopeItems.orgOnly') })
      let btnText = getString('rbac.userDetails.scopeAll')
      if (orgFetchError) {
        message = getString('rbac.userDetails.errorFetchingOrgs')
        btnText = getString('retry')
      }
      return (
        <Page.NoDataCard
          message={message}
          button={
            <Button
              text={btnText}
              variation={ButtonVariation.SECONDARY}
              onClick={() => {
                setOrgFetchError(false)
                setAccountFilter(ScopeFilterItems.ALL)
                setScopeFilters(getScopeFilter(ScopeFilterItems.ALL))
              }}
            />
          }
        />
      )
    } else {
      if (view === UserDetailsViews.ROLE_BINDING) {
        return <UserRoleBindings scopeFilters={scopeFilters} user={userData} />
      } else {
        return <UserGroupTable user={userData} scopeFilters={scopeFilters} />
      }
    }
  }

  const onOrgFetchError = (): void => {
    setOrgFetchError(true)
  }

  return (
    <>
      <Layout.Horizontal spacing="small" className={css.secondaryHeader}>
        <DropDown
          items={getScopeDropDownItems()}
          value={accountFilter}
          getCustomLabel={item => (
            <Layout.Horizontal spacing="small">
              <Text color={Color.GREY_700} font={{ variation: FontVariation.SMALL_BOLD }}>
                {getString('rbac.scopeLabel')}
              </Text>
              <Text color={Color.GREY_700} font={{ variation: FontVariation.SMALL }}>
                {item.label}
              </Text>
            </Layout.Horizontal>
          )}
          filterable={false}
          onChange={item => {
            setOrgFetchError(false)
            setAccountFilter(item.value as ScopeFilterItems)
            if (scope === Scope.ACCOUNT) {
              setOrgFilter(DEFAULT_ORG_ID)
            }
            setScopeFilters(getScopeFilter(item.value as ScopeFilterItems, DEFAULT_ORG_ID))
          }}
        />
        {(accountFilter === ScopeFilterItems.ORG_ONLY || accountFilter === ScopeFilterItems.ORG_WITH_PROJECTS) &&
          scope === Scope.ACCOUNT && (
            <OrgSelect
              accountIdentifier={accountId}
              orgFilter={orgFilter}
              onChange={item => {
                setOrgFetchError(false)
                setOrgFilter(item.value.toString())
                setScopeFilters(getScopeFilter(accountFilter, item.value.toString()))
              }}
              onError={onOrgFetchError}
            />
          )}
        {orgFilter && accountFilter === ScopeFilterItems.ORG_WITH_PROJECTS ? (
          <ProjectMultiSelect
            accountIdentifier={accountId}
            orgIdentifier={orgFilter}
            onChange={items => {
              setScopeFilters(
                items.map(item =>
                  item.value === ProjectFilter.ALL
                    ? {
                        accountIdentifier: accountId,
                        orgIdentifier: orgFilter,
                        filter: 'INCLUDING_CHILD_SCOPES'
                      }
                    : {
                        accountIdentifier: accountId,
                        orgIdentifier: orgFilter,
                        projectIdentifier: item.value.toString(),
                        filter: 'EXCLUDING_CHILD_SCOPES'
                      }
                )
              )
            }}
          />
        ) : null}
      </Layout.Horizontal>
      <div className={css.userDetailsBody}>{getPageBody()}</div>
    </>
  )
}

export default ScopeFilter
