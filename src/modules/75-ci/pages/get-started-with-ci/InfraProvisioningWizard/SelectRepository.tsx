/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash-es'
import type { Column, CellProps } from 'react-table'
import {
  Text,
  Layout,
  TableV2,
  Container,
  RadioButton,
  TextInput,
  FormError,
  Icon,
  Select,
  SelectOption,
  IconProps,
  IconName,
  Toggle,
  Label
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { ConnectorInfoDTO, useGetListOfAllReposByRefConnector, UserRepoResponse, Error } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { getFullRepoName } from '../../../utils/HostedBuildsUtils'

import css from './InfraProvisioningWizard.module.scss'

export interface SelectRepositoryRef {
  repository?: UserRepoResponse
  enableCloneCodebase: boolean
}

export type SelectRepositoryForwardRef =
  | ((instance: SelectRepositoryRef | null) => void)
  | React.MutableRefObject<SelectRepositoryRef | null>
  | null

interface SelectRepositoryProps {
  showError?: boolean
  validatedPreSelectedConnector?: ConnectorInfoDTO
  connectorsEligibleForPreSelection?: ConnectorInfoDTO[]
  onConnectorSelect?: (connector: ConnectorInfoDTO) => void
  disableNextBtn: () => void
  enableNextBtn: () => void
  updateFooterLabel?: React.Dispatch<React.SetStateAction<string>>
}

const SelectRepositoryRef = (
  props: SelectRepositoryProps,
  forwardRef: SelectRepositoryForwardRef
): React.ReactElement => {
  const {
    showError,
    validatedPreSelectedConnector,
    disableNextBtn,
    enableNextBtn,
    connectorsEligibleForPreSelection,
    onConnectorSelect,
    updateFooterLabel
  } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [repository, setRepository] = useState<UserRepoResponse | undefined>()
  const [repositories, setRepositories] = useState<UserRepoResponse[]>()
  const [selectedConnectorOption, setSelectedConnectorOption] = useState<SelectOption>()
  const [query, setQuery] = useState<string>()
  const {
    data: repoData,
    loading: fetchingRepositories,
    refetch: fetchRepositories,
    cancel: cancelRepositoriesFetch,
    error: errorWhileFetchingRepositories
  } = useGetListOfAllReposByRefConnector({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: ''
    },
    lazy: true
  })
  const [enableCloneCodebase, setEnableCloneCodebase] = useState(true)

  const getIcon = useCallback((type: ConnectorInfoDTO['type']): IconName | undefined => {
    switch (type) {
      case Connectors.GITHUB:
        return 'github'
      case Connectors.GITLAB:
        return 'gitlab'
      case Connectors.BITBUCKET:
        return 'bitbucket-blue'
      default:
        return
    }
  }, [])

  const ConnectorSelectionItems = useMemo((): SelectOption[] => {
    if (!validatedPreSelectedConnector) {
      return []
    }
    const items: ConnectorInfoDTO[] =
      Array.isArray(connectorsEligibleForPreSelection) && connectorsEligibleForPreSelection?.length > 0
        ? connectorsEligibleForPreSelection
        : [validatedPreSelectedConnector]
    return items?.map((item: ConnectorInfoDTO) => {
      const { type, name } = item
      return {
        icon: { name: getIcon(type), className: css.listIcon } as IconProps,
        label: name,
        value: getScopedValueFromDTO(item)
      }
    }) as SelectOption[]
  }, [connectorsEligibleForPreSelection, validatedPreSelectedConnector])

  useEffect(() => {
    if (validatedPreSelectedConnector && ConnectorSelectionItems.length > 0) {
      setSelectedConnectorOption(
        ConnectorSelectionItems.find(
          (item: SelectOption) => item.value === getScopedValueFromDTO(validatedPreSelectedConnector)
        )
      )
    }
  }, [ConnectorSelectionItems, validatedPreSelectedConnector])

  const getRepositories = useCallback((connectorRef: string): void => {
    cancelRepositoriesFetch()
    fetchRepositories({
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        connectorRef
      }
    })
  }, [])

  useEffect(() => {
    if (validatedPreSelectedConnector) {
      getRepositories(getScopedValueFromDTO(validatedPreSelectedConnector))
    }
  }, [validatedPreSelectedConnector])

  useEffect(() => {
    if (selectedConnectorOption) {
      setQuery('')
      getRepositories(selectedConnectorOption.value as string)
    }
  }, [selectedConnectorOption])

  useEffect(() => {
    if (selectedConnectorOption) {
      const matchingConnector = connectorsEligibleForPreSelection?.find(
        (item: ConnectorInfoDTO) => selectedConnectorOption?.value === getScopedValueFromDTO(item)
      )
      if (matchingConnector) {
        onConnectorSelect?.(matchingConnector)
      }
      setRepository(undefined)
    }
  }, [selectedConnectorOption, connectorsEligibleForPreSelection])

  useEffect(() => {
    if (!fetchingRepositories && !errorWhileFetchingRepositories) {
      setRepositories(repoData?.data)
    }
  }, [fetchingRepositories, errorWhileFetchingRepositories, repoData?.data])

  useEffect(() => {
    if (fetchingRepositories && enableCloneCodebase) {
      disableNextBtn()
    } else {
      enableNextBtn()
    }
  }, [fetchingRepositories, enableCloneCodebase])

  useEffect(() => {
    if (!forwardRef) {
      return
    }

    if (typeof forwardRef === 'function') {
      return
    }

    forwardRef.current = {
      repository,
      enableCloneCodebase
    }
  }, [repository, enableCloneCodebase])

  useEffect(() => {
    if (enableCloneCodebase) {
      updateFooterLabel?.(`${getString('next')}: ${getString('ci.getStartedWithCI.configurePipeline')}`)
    } else {
      updateFooterLabel?.(getString('ci.getStartedWithCI.createPipeline'))
    }
  }, [enableCloneCodebase])

  const debouncedRepositorySearch = debounce((queryText: string): void => {
    if (queryText) {
      setRepositories(
        (repoData?.data || []).filter(item => getFullRepoName(item).toLowerCase().includes(queryText.toLowerCase()))
      )
    } else {
      setRepositories(repoData?.data)
    }
  }, 500)

  const renderRepositories = useCallback((): JSX.Element => {
    if (fetchingRepositories) {
      return (
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" padding={{ top: 'xsmall' }}>
          <Icon name="steps-spinner" color="primary7" size={25} />
          <Text font={{ variation: FontVariation.H6 }}>{getString('common.getStarted.fetchingRepos')}</Text>
        </Layout.Horizontal>
      )
    } else {
      if (errorWhileFetchingRepositories) {
        const { status: fetchRepoStatus, data: fetchRepoError } = errorWhileFetchingRepositories || {}
        const errorMessages =
          (fetchRepoError as Error)?.responseMessages || [
            {
              level: 'ERROR',
              message: (fetchRepoError as any)?.error
            }
          ] ||
          []
        if (fetchRepoStatus !== 200 && errorMessages.length > 0) {
          disableNextBtn()
          return (
            <Container padding={{ top: 'small' }}>
              <ErrorHandler responseMessages={errorMessages} />
            </Container>
          )
        }
      } else if (repositories && Array.isArray(repositories)) {
        return repositories.length > 0 ? (
          <RepositorySelectionTable repositories={repositories} onRowClick={setRepository} />
        ) : (
          <Text flex={{ justifyContent: 'center' }} padding={{ top: 'medium' }}>
            {getString('noSearchResultsFoundPeriod')}
          </Text>
        )
      }
      return <></>
    }
  }, [fetchingRepositories, repositories, selectedConnectorOption, errorWhileFetchingRepositories])

  const showValidationErrorForRepositoryNotSelected = useMemo((): boolean => {
    return (!fetchingRepositories && showError && !repository?.name) || false
  }, [showError, repository?.name, fetchingRepositories])

  return (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xsmall' }}>
        {getString('common.selectYourRepo')}
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }} spacing="small">
        <Label className={css.toggleLabel}>{getString('ci.getStartedWithCI.cloneGitRepo')}</Label>
        <Toggle
          checked={enableCloneCodebase}
          onToggle={val => {
            setEnableCloneCodebase(val)
          }}
        />
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" padding={{ bottom: 'xsmall' }}>
        <Icon name="code-info" size={24} className={css.infoIcon} />
        <Text font={{ variation: FontVariation.BODY }}>{getString('ci.getStartedWithCI.cloneGitRepoHelpText')}</Text>
      </Layout.Horizontal>
      {enableCloneCodebase ? (
        <>
          <Container padding={{ top: 'small' }} width="65%">
            <Layout.Horizontal>
              <TextInput
                leftIcon="search"
                placeholder={getString('common.getStarted.searchRepo')}
                className={css.repositorySearch}
                leftIconProps={{ name: 'search', size: 18, padding: 'xsmall' }}
                onChange={e => {
                  const repoSearched = (e.currentTarget as HTMLInputElement).value
                  setQuery(repoSearched)
                  debouncedRepositorySearch(repoSearched)
                }}
                disabled={fetchingRepositories}
                value={query}
              />
              <Select
                items={ConnectorSelectionItems}
                value={selectedConnectorOption}
                className={css.connectorSelect}
                onChange={(item: SelectOption) => setSelectedConnectorOption(item)}
              />
            </Layout.Horizontal>
          </Container>
          <Container className={css.repositories}>
            {renderRepositories()}
            {showValidationErrorForRepositoryNotSelected ? (
              <Container padding={{ top: 'xsmall' }}>
                <FormError
                  name={'repository'}
                  errorMessage={getString('common.getStarted.plsChoose', {
                    field: `a ${getString('repository').toLowerCase()}`
                  })}
                />
              </Container>
            ) : null}
          </Container>
        </>
      ) : null}
    </Layout.Vertical>
  )
}

interface RepositorySelectionTableProps {
  repositories: UserRepoResponse[]
  onRowClick: (repo: UserRepoResponse) => void
}

function RepositorySelectionTable({ repositories, onRowClick }: RepositorySelectionTableProps): React.ReactElement {
  const [selectedRow, setSelectedRow] = useState<UserRepoResponse | undefined>(undefined)

  const columns: Column<UserRepoResponse>[] = [
    {
      accessor: 'name',
      width: '100%',
      Cell: ({ row }: CellProps<UserRepoResponse>) => {
        const { name: repositoryName } = row.original
        const isRowSelected = selectedRow && getFullRepoName(row.original) === getFullRepoName(selectedRow)
        return (
          <Layout.Horizontal
            data-testid={repositoryName}
            className={css.repositoryRow}
            flex={{ justifyContent: 'flex-start' }}
            spacing="small"
          >
            <RadioButton checked={isRowSelected} />
            <Text
              lineClamp={1}
              font={{ variation: FontVariation.BODY2 }}
              color={isRowSelected ? Color.PRIMARY_7 : Color.GREY_900}
            >
              {getFullRepoName(row.original)}
            </Text>
          </Layout.Horizontal>
        )
      },
      disableSortBy: true
    }
  ]

  return (
    <TableV2<UserRepoResponse>
      columns={columns}
      data={repositories || []}
      hideHeaders={true}
      minimal={true}
      resizable={false}
      sortable={false}
      className={css.repositoryTable}
      onRowClick={data => {
        setSelectedRow(data)
        onRowClick(data)
      }}
    />
  )
}

export const SelectRepository = React.forwardRef(SelectRepositoryRef)
