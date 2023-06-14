import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'

import {
  Container,
  Layout,
  Text,
  shouldShowError,
  useToaster,
  ExpandingSearchInput,
  SelectOption
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope, scopeStringKey } from '@common/interfaces/SecretsInterface'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ServiceResponseDto, useGetServiceAccessListQuery } from 'services/cd-ng-rq'

import css from './ScopedEntitySelect.module.scss'

export default function ServiceEntityList({
  onSelect,
  scope
}: {
  onSelect(option: SelectOption): void
  scope?: Scope
}): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [selectOptions, setSelectOptions] = useState<ServiceResponseDto[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()
  const { getString } = useStrings()

  const {
    data: listResponse,
    error: listError,
    isInitialLoading: loadingList
  } = useGetServiceAccessListQuery({
    queryParams: {
      searchTerm,
      accountIdentifier: accountId,
      ...((scope === Scope.PROJECT || scope === Scope.ORG || (isNil(scope) && orgIdentifier)) && { orgIdentifier }),
      ...((scope === Scope.PROJECT || (isNil(scope) && orgIdentifier)) && { projectIdentifier }),
      includeAllAccessibleAtScope: isNil(scope)
    }
  })

  useEffect(() => {
    const listData = listResponse?.data
    if (!loadingList && listData && !isEmpty(listData)) {
      setSelectOptions(
        !isEmpty(listData) ? listData.map(entityInList => entityInList.service as ServiceResponseDto) : []
      )
    }
  }, [loadingList, listResponse])

  useEffect(() => {
    /* istanbul ignore else */
    if (listError?.message) {
      /* istanbul ignore else */
      if (shouldShowError(listError)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        showError(getRBACErrorMessage(listError as any))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listError])

  return (
    <>
      <ExpandingSearchInput throttle={300} alwaysExpanded onChange={setSearchTerm} className={css.searchInput} />
      <Container
        height={240}
        margin={{ top: 'medium' }}
        padding={{ left: 'medium', right: 'medium' }}
        className={css.listContainer}
      >
        {loadingList ? (
          <ContainerSpinner height={'100%'} width={'100%'} flex={{ justifyContent: 'center', alignItems: 'center' }} />
        ) : selectOptions.length === 0 ? (
          getString('noSearchResultsFoundPeriod')
        ) : (
          selectOptions.map(selectOption => {
            const { name, identifier } = selectOption
            const entityScope = getScopeFromDTO(selectOption)

            return (
              <Layout.Horizontal
                key={identifier}
                flex={{ justifyContent: 'flex-start' }}
                spacing="small"
                margin={{ bottom: 'small' }}
                padding={'small'}
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  onSelect({
                    label: name as string,
                    value:
                      entityScope === Scope.ORG || entityScope === Scope.ACCOUNT
                        ? `${entityScope}.${identifier}`
                        : (identifier as string)
                  })
                }
              >
                <Text color={Color.BLACK} lineClamp={1}>
                  {name}
                </Text>
                <Text color={Color.BLACK} lineClamp={1} border={{ left: true }} padding={{ left: 'small' }}>
                  {getString(scopeStringKey[entityScope])}
                </Text>
              </Layout.Horizontal>
            )
          })
        )}
      </Container>
    </>
  )
}
