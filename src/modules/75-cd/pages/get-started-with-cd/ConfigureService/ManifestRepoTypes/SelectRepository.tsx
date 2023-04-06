/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { Text, Layout, Container, FormError, DropDown, SelectOption, Button } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useGetListOfAllReposByRefConnector, UserRepoResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ACCOUNT_SCOPE_PREFIX, getFullRepoName } from '../../DeployProvisioningWizard/Constants'

import css from '../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface SelectRepositoryRefInstance {
  repository: UserRepoResponse
}

interface RepoOption extends SelectOption {
  repository: UserRepoResponse
}
interface SelectRepositoryProps {
  selectedRepository?: UserRepoResponse
  showError?: boolean
  validatedConnectorRef?: string
  onChange?: (repository: UserRepoResponse) => void
}

export const SelectRepository = (props: SelectRepositoryProps): React.ReactElement => {
  const { selectedRepository, showError, validatedConnectorRef, onChange } = props
  const { getString } = useStrings()
  const [repository, setRepository] = useState<UserRepoResponse | undefined>(selectedRepository)
  const [query, setQuery] = useState<string>('')
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const {
    data: repoData,
    loading: fetchingRepositories,
    refetch: fetchRepositories
  } = useGetListOfAllReposByRefConnector({
    queryParams: {
      accountIdentifier: accountId,
      connectorRef: ''
    },
    lazy: true
  })

  const fetchRepositoryList = useCallback((): void => {
    fetchRepositories({
      queryParams: {
        accountIdentifier: accountId,
        connectorRef: `${ACCOUNT_SCOPE_PREFIX}${validatedConnectorRef}`
      }
    })
  }, [accountId, fetchRepositories, validatedConnectorRef])

  useEffect(() => {
    if (validatedConnectorRef) {
      fetchRepositoryList()
    }
  }, [accountId, fetchRepositoryList, orgIdentifier, projectIdentifier, validatedConnectorRef])

  useEffect(() => {
    if (selectedRepository) {
      setRepository(selectedRepository)
    }
  }, [selectedRepository])

  const repositories = useMemo(() => {
    if (query) {
      return (repoData?.data || []).filter(item => item.name?.includes(query))
    } else {
      return repoData?.data
    }
  }, [query, repoData?.data])

  useEffect(() => {
    !isEmpty(repository) && onChange?.(repository as UserRepoResponse)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository])

  const showValidationErrorForRepositoryNotSelected = showError && !repository?.name

  const selectOptions = React.useMemo((): RepoOption[] => {
    return defaultTo(repositories, []).map(repo => ({
      label: getFullRepoName(repo),
      value: repo.name as string,
      repository: repo
    }))
  }, [repositories])

  return (
    <Layout.Vertical spacing="small" padding={{ bottom: 'xxlarge' }}>
      <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'small' }}>
        {getString('common.selectYourRepo')}
      </Text>
      <Container padding={{ top: 'small' }} className={cx(css.repositories)}>
        <Layout.Horizontal>
          <DropDown
            className={cx(css.repositorySearch, {
              [css.disable]: fetchingRepositories
            })}
            items={selectOptions}
            value={repository?.name as string}
            onChange={item => {
              setRepository((item as RepoOption).repository)
            }}
            disabled={fetchingRepositories}
            usePortal={true}
            popoverClassName={css.dropdownPopover}
            addClearBtn={true}
            onQueryChange={setQuery}
            placeholder={fetchingRepositories ? getString('cd.fetchingRepository') : getString('cd.selectRepository')}
          />
          {showValidationErrorForRepositoryNotSelected ? (
            <Container padding={{ top: 'xsmall' }}>
              <FormError
                name={'repository'}
                errorMessage={getString('common.getStarted.plsChoose', {
                  field: getString('repository').toLowerCase()
                })}
              />
            </Container>
          ) : null}
          <Button
            icon="refresh"
            onClick={fetchRepositoryList}
            minimal
            tooltipProps={{ isDark: true }}
            tooltip={getString('common.refresh')}
            disabled={fetchingRepositories}
          />
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}
