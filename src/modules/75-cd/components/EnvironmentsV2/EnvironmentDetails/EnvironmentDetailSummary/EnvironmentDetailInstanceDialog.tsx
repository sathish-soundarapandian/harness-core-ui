/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Container, Dialog, ExpandingSearchInput, Text } from '@harness/uicore'
import type { InstanceGroupedByInfrastructureV2, InstanceGroupedByService } from 'services/cd-ng'
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
  const { isOpen, setIsOpen, serviceFilter, data: dataMock } = props
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')
  const [rowClickFilter, setRowClickFilter] = useState<InfraViewFilters>({
    artifactFilter: '',
    serviceFilter: ''
  })

  const { environmentIdentifier: envFilter } = useParams<ProjectPathProps & EnvironmentPathProps>()

  const data = defaultTo(dataMock, [])

  //filter by serviceName, artifactVersion and infraName
  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data
    }
    return data.filter(
      deployment =>
        (deployment.serviceName || '').toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1 ||
        deployment.instanceGroupedByArtifactList?.filter(
          i =>
            (i.artifactVersion &&
              i.artifactVersion?.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1) ||
            i.instanceGroupedByEnvironmentList?.filter(
              env =>
                (env.instanceGroupedByInfraList?.length &&
                  env.instanceGroupedByInfraList?.filter(
                    infra =>
                      infra.infraName &&
                      infra.infraName?.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1
                  ).length) ||
                (env.instanceGroupedByClusterList?.length &&
                  env.instanceGroupedByClusterList?.filter(
                    cluster =>
                      cluster.clusterIdentifier &&
                      cluster.clusterIdentifier?.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1
                  ).length)
            ).length
        ).length
    )
  }, [searchTerm, data])

  const onSearch = useCallback((val: string) => {
    setSearchTerm(val.trim())
  }, [])

  const dataInfra = useMemo((): InstanceGroupedByInfrastructureV2[][] => {
    const finalArray = [] as InstanceGroupedByInfrastructureV2[][]

    dataMock?.forEach(service => {
      if (rowClickFilter.serviceFilter && service.serviceId === rowClickFilter.serviceFilter) {
        if (service.instanceGroupedByArtifactList) {
          service.instanceGroupedByArtifactList.forEach(artifact => {
            if (rowClickFilter.artifactFilter && artifact.artifactVersion === rowClickFilter.artifactFilter) {
              if (artifact.instanceGroupedByEnvironmentList) {
                artifact.instanceGroupedByEnvironmentList.forEach(env => {
                  if (envFilter && env.envId === envFilter) {
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
  }, [envFilter, rowClickFilter.artifactFilter, rowClickFilter.serviceFilter])

  const infraDetailView = useMemo(() => {
    return (
      <Container className={css.instanceDetailView}>
        <Container className={css.instanceViewHeader}>
          <Text className={css.instanceDetailTitle}>{getString('cd.serviceDashboard.instanceDetails')}</Text>
          <ExpandingSearchInput
            placeholder={getString('search')}
            throttle={200}
            onChange={onSearch} //todo
            className={css.searchIconStyle}
            alwaysExpanded
          />
        </Container>
        <EnvironmentDetailInfraView
          artifactFilter={rowClickFilter.artifactFilter}
          envFilter={envFilter}
          serviceFilter={rowClickFilter.serviceFilter}
          data={dataInfra}
        />
      </Container>
    )
  }, [dataInfra, getString, onSearch, rowClickFilter.artifactFilter, rowClickFilter.serviceFilter])

  return (
    <Dialog
      className={cx('padded-dialog', css.dialogBase)}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        setRowClickFilter({ artifactFilter: '', serviceFilter: '' })
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
          />
          <EnvironmentDetailTable
            tableType={TableType.FULL}
            data={filteredData}
            tableStyle={css.fullViewTableStyle}
            setRowClickFilter={setRowClickFilter}
            serviceFilter={serviceFilter}
          />
        </Container>
        {infraDetailView}
      </div>
    </Dialog>
  )
}
