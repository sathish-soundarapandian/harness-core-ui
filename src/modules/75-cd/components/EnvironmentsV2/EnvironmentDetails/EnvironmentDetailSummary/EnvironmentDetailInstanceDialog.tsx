/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useCallback, useMemo, useRef, useState } from 'react'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Container, Dialog, ExpandingSearchInput, ExpandingSearchInputHandle, Text } from '@harness/uicore'
import type {
  InstanceGroupedByArtifactV2,
  InstanceGroupedByInfrastructureV2,
  InstanceGroupedByService
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { EnvironmentPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EnvironmentDetailTable, InfraViewFilters, TableType } from './EnvironmentDetailTable'
import EnvironmentDetailInfraView from './EnvironmentDetailInfraView'

import css from './EnvironmentDetailSummary.module.scss'

export interface EnvironmentDetailInstanceDialogProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  data?: InstanceGroupedByService[]
  serviceFilter?: string
}

export default function EnvironmentDetailInstanceDialog(
  props: EnvironmentDetailInstanceDialogProps
): React.ReactElement {
  const { isOpen, setIsOpen, serviceFilter, data: serviceArtifactData } = props
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')
  const isSearchApplied = useRef<boolean>(!isEmpty(searchTerm))
  const [searchTermInfra, setSearchTermInfra] = useState('')
  const searchInfraRef = useRef({} as ExpandingSearchInputHandle)
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const isSearchAppliedInfra = useRef<boolean>(!isEmpty(searchTermInfra))
  const [rowClickFilter, setRowClickFilter] = useState<InfraViewFilters>({
    artifactFilter: {
      artifactPath: '',
      artifactVersion: ''
    },
    serviceFilter: ''
  })

  const resetSearchInfra = (): void => /* istanbul ignore next */ {
    searchInfraRef.current.clear()
  }

  const resetSearch = (): void => /* istanbul ignore next */ {
    searchRef.current.clear()
  }

  const { environmentIdentifier: envFilter } = useParams<ProjectPathProps & EnvironmentPathProps>()
  const data = defaultTo(serviceArtifactData, [])

  //filter by serviceName, artifactVersion and infraName
  const filteredData = useMemo(() => /* istanbul ignore next */ {
    isSearchApplied.current = !isEmpty(searchTerm)
    if (!searchTerm) {
      return data
    }
    const searchValue = searchTerm.toLocaleLowerCase()

    const artifactSearch = (artifact: InstanceGroupedByArtifactV2): boolean => {
      return ((artifact.artifactVersion && artifact.artifactVersion?.toLocaleLowerCase().includes(searchValue)) ||
        artifact.instanceGroupedByEnvironmentList?.some(
          env =>
            (env.instanceGroupedByInfraList?.length &&
              env.instanceGroupedByInfraList?.some(
                infra => infra.infraName && infra.infraName?.toLocaleLowerCase().includes(searchValue)
              )) ||
            (env.instanceGroupedByClusterList?.length &&
              env.instanceGroupedByClusterList?.some(
                cluster =>
                  cluster.clusterIdentifier && cluster.clusterIdentifier?.toLocaleLowerCase().includes(searchValue)
              ))
        )) as boolean
    }

    //search and filter on service only
    const serviceOnlyFilter = data.filter(
      service =>
        service.serviceName &&
        service.serviceName.toLocaleLowerCase().includes(searchValue) &&
        !service.instanceGroupedByArtifactList?.some(artifact => artifactSearch(artifact))
    )

    //search and filter on artifact only
    const artifactOnlyFilter = data
      .map(service => {
        const filteredArtifact = service.instanceGroupedByArtifactList?.filter(artifact => artifactSearch(artifact))
        if (filteredArtifact?.length) {
          return {
            ...service,
            instanceGroupedByArtifactList: filteredArtifact
          }
        }
      })
      .filter(i => i)

    if (serviceOnlyFilter.length) {
      return serviceOnlyFilter
    }
    if (artifactOnlyFilter.length) {
      return artifactOnlyFilter
    }
    return data.filter(
      deployment =>
        (deployment.serviceName || '').toLocaleLowerCase().includes(searchValue) ||
        deployment.instanceGroupedByArtifactList?.some(artifact => artifactSearch(artifact))
    )
  }, [searchTerm, data]) as InstanceGroupedByService[]

  const onSearch = useCallback((val: string) => /* istanbul ignore next */ {
    setSearchTerm(val.trim())
    isSearchApplied.current = !isEmpty(val.trim())
  }, [])

  const onSearchInfra = useCallback((val: string) => /* istanbul ignore next */ {
    setSearchTermInfra(val.trim())
    isSearchAppliedInfra.current = !isEmpty(val.trim())
  }, [])

  const dataInfra = useMemo((): InstanceGroupedByInfrastructureV2[][] => {
    const finalArray = [] as InstanceGroupedByInfrastructureV2[][]

    filteredData?.forEach(service => {
      if (rowClickFilter.serviceFilter && service?.serviceId === rowClickFilter.serviceFilter) {
        /* istanbul ignore else */
        if (service.instanceGroupedByArtifactList) {
          service.instanceGroupedByArtifactList.forEach(artifact => {
            if (
              rowClickFilter.artifactFilter &&
              artifact.artifactVersion === rowClickFilter.artifactFilter.artifactVersion &&
              artifact.artifactPath === rowClickFilter.artifactFilter.artifactPath
            ) {
              /* istanbul ignore else */
              if (artifact.instanceGroupedByEnvironmentList) {
                artifact.instanceGroupedByEnvironmentList.forEach(env => {
                  /* istanbul ignore else */
                  if (envFilter && env.envId === envFilter) {
                    /* istanbul ignore else */
                    if (env.instanceGroupedByInfraList?.length) {
                      finalArray.push(env.instanceGroupedByInfraList)
                    }
                    if (env.instanceGroupedByClusterList?.length) {
                      finalArray.push(env.instanceGroupedByClusterList)
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
    return finalArray
  }, [envFilter, filteredData, rowClickFilter.artifactFilter, rowClickFilter.serviceFilter])

  //filter by infraName/clusterId and lastPipelineExecutionName
  const filteredDataInfra = useMemo(() => /* istanbul ignore next */ {
    isSearchAppliedInfra.current = !isEmpty(searchTermInfra)
    /* istanbul ignore else */
    if (!searchTermInfra) {
      return dataInfra
    }
    const searchValue = searchTermInfra.toLocaleLowerCase()
    return dataInfra.map(infraArray =>
      infraArray.filter(
        infra =>
          (infra.infraName && infra.infraName?.toLocaleLowerCase().includes(searchValue)) ||
          (infra.clusterIdentifier && infra.clusterIdentifier?.toLocaleLowerCase().includes(searchValue)) ||
          infra.instanceGroupedByPipelineExecutionList?.some(
            infraDetail =>
              infraDetail.lastPipelineExecutionName &&
              infraDetail.lastPipelineExecutionName.toLocaleLowerCase().includes(searchValue)
          )
      )
    )
  }, [searchTermInfra, dataInfra])

  const infraDetailView = useMemo(() => {
    return (
      <Container className={css.instanceDetailView}>
        <Container className={css.instanceViewHeader}>
          <Text className={css.instanceDetailTitle}>{getString('cd.serviceDashboard.instanceDetails')}</Text>
          <ExpandingSearchInput
            placeholder={getString('search')}
            throttle={200}
            onChange={onSearchInfra}
            className={css.searchIconStyle}
            alwaysExpanded
            ref={searchInfraRef}
          />
        </Container>
        <EnvironmentDetailInfraView
          artifactPath={rowClickFilter.artifactFilter.artifactPath}
          artifactVersion={rowClickFilter.artifactFilter.artifactVersion}
          envFilter={envFilter}
          serviceFilter={rowClickFilter.serviceFilter}
          data={filteredDataInfra}
          isSearchApplied={isSearchAppliedInfra.current}
          resetSearch={resetSearchInfra}
        />
      </Container>
    )
  }, [
    getString,
    onSearchInfra,
    rowClickFilter.artifactFilter,
    rowClickFilter.serviceFilter,
    envFilter,
    filteredDataInfra
  ])

  return (
    <Dialog
      className={cx('padded-dialog', css.dialogBase)}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        setRowClickFilter({ artifactFilter: { artifactPath: '', artifactVersion: '' }, serviceFilter: '' })
      }}
      enforceFocus={false}
    >
      <div className={css.dialogWrap}>
        <Container className={css.detailSummaryView}>
          <ExpandingSearchInput
            placeholder={getString('search')}
            throttle={200}
            onChange={onSearch}
            className={css.searchIconStyle}
            alwaysExpanded
            ref={searchRef}
          />
          <EnvironmentDetailTable
            tableType={TableType.FULL}
            data={filteredData}
            tableStyle={css.fullViewTableStyle}
            setRowClickFilter={setRowClickFilter}
            serviceFilter={serviceFilter}
            isSearchApplied={isSearchApplied.current}
            resetSearch={resetSearch}
          />
        </Container>
        {infraDetailView}
      </div>
    </Dialog>
  )
}
