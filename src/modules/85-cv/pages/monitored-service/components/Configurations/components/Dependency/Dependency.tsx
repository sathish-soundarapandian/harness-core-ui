/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Layout, Text, Container, Pagination, PageError, NoDataCard } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useGetMonitoredServiceList } from 'services/cv'
import { PageSpinner } from '@common/components'
import SaveAndDiscardButton from '@cv/components/SaveAndDiscardButton/SaveAndDiscardButton'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { MonitoredServiceForm } from '../Service/Service.types'
import SelectServiceCard from './component/SelectServiceCard'
import type { DependencyMetaData } from './component/SelectServiceCard.types'
import {
  updateMonitoredServiceWithDependencies,
  filterCurrentMonitoredServiceFromList,
  initializeDependencyMap
} from './Dependency.utils'
import css from './Dependency.module.scss'

export default function Dependency({
  value,
  onSuccess,
  cachedInitialValues,
  onDiscard
}: {
  value: MonitoredServiceForm
  onSuccess: (val: any) => Promise<void>
  cachedInitialValues?: MonitoredServiceForm | null
  setDBData?: (val: MonitoredServiceForm) => void
  onDiscard?: () => void
  dependencyTabformRef?: any
}): JSX.Element {
  const { getString } = useStrings()
  const [dependencyMap, setDependencyMap] = useState<Map<string, DependencyMetaData>>(new Map())
  const [isDirty, setIsDirty] = useState(false)
  const { accountId, identifier, orgIdentifier, projectIdentifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const [queryParams, setQueryParams] = useState({
    offset: 0,
    pageSize: 10,
    projectIdentifier,
    orgIdentifier,
    accountId,
    environmentIdentifiers: identifier
      ? value.environmentRefList
      : value.type === 'Application'
      ? [cachedInitialValues?.environmentRef as string]
      : (cachedInitialValues?.environmentRef as unknown as string[]) ?? []
  })

  const {
    data,
    loading: loadingGetMonitoredService,
    error: errorGetMonitoredService,
    refetch
  } = useGetMonitoredServiceList({
    queryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    resolve: response => filterCurrentMonitoredServiceFromList(response, value.identifier)
  })

  const initalDependencies = useMemo(() => {
    const dependencies = initializeDependencyMap(value?.dependencies)
    setDependencyMap(dependencies)
    return dependencies
  }, [value?.dependencies])

  if (errorGetMonitoredService) {
    return <PageError message={getErrorMessage(errorGetMonitoredService)} onClick={() => refetch()} />
  }

  const {
    pageIndex = -1,
    pageSize = 0,
    totalPages = 1,
    totalItems = 0,
    content: monitoredServiceList = []
  } = data?.data || {}

  return (
    <Container>
      {loadingGetMonitoredService && <PageSpinner />}
      <SaveAndDiscardButton
        className={css.saveDiscardBlock}
        isUpdated={isDirty}
        onSave={async () => {
          await onSuccess(updateMonitoredServiceWithDependencies(Array.from(dependencyMap.values()), value))
        }}
        onDiscard={() => {
          setDependencyMap(initalDependencies)
          setIsDirty(false)
          onDiscard?.()
        }}
      />
      <Layout.Horizontal>
        <Container className={css.leftSection}>
          <Container margin={{ left: 'medium', right: 'medium' }}>
            <Text margin={{ bottom: 'large' }} color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('cv.Dependency.serviceList')}
            </Text>
            <Text margin={{ bottom: 'medium' }} color={Color.BLACK} font={{ size: 'small', weight: 'semi-bold' }}>
              {getString('total')} {monitoredServiceList.length}
            </Text>
          </Container>
          {!monitoredServiceList.length ? (
            <NoDataCard icon="join-table" message={getString('cv.monitoredServices.youHaveNoMonitoredServices')} />
          ) : (
            monitoredServiceList.map(service => (
              <SelectServiceCard
                key={service.monitoredService.identifier}
                monitoredService={service.monitoredService}
                dependencyMetaData={dependencyMap.get(service.monitoredService.identifier)}
                onChange={(isChecked, dependencyMetaData) =>
                  setDependencyMap(oldMap => {
                    const newMap = new Map(oldMap)
                    if (isChecked && dependencyMetaData) {
                      newMap.set(service.monitoredService.identifier, dependencyMetaData)
                    } else {
                      newMap.delete(service.monitoredService.identifier)
                    }
                    setIsDirty(!isEqual(initalDependencies, newMap))
                    return newMap
                  })
                }
              />
            ))
          )}
          <Pagination
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={totalPages}
            itemCount={totalItems - 1}
            gotoPage={pageNumber => setQueryParams(prevParams => ({ ...prevParams, offset: pageNumber }))}
          />
        </Container>
        <Container className={css.rightSection}>
          <NoDataCard message={getString('cv.Dependency.noData')} icon="warning-sign" />
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}
