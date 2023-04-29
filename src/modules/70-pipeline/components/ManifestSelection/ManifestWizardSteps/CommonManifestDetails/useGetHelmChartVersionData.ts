/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import type { SelectOption } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  checkIfQueryParamsisNotEmpty,
  shouldFetchFieldOptions
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, Failure, useGetHelmChartVersionDetailsV1 } from 'services/cd-ng'
import { getConnectorRefOrConnectorId } from '../../Manifesthelper'

interface DependentFields {
  chartName: string
  region?: string
  bucketName?: string
  folderPath?: string
  helmVersion?: string
}

const DEFAULT_HELM_VERSION = 'V3'
export interface HelmChartVersionDataProps {
  modifiedPrevStepData: ConnectorConfigDTO | undefined
  fields: (keyof DependentFields)[]
}

export interface HelmChartVersionDataReturnProps {
  chartVersions: SelectOption[]
  loadingChartVersions: boolean
  chartVersionsError: GetDataError<Failure | Error> | null
  fetchChartVersions: ({ chartName, region, bucketName, folderPath, helmVersion }: DependentFields) => void
  setLastQueryData: Dispatch<SetStateAction<DependentFields>>
}

export function useGetHelmChartVersionData(props: HelmChartVersionDataProps): HelmChartVersionDataReturnProps {
  const { modifiedPrevStepData, fields } = props

  const { getString } = useStrings()
  const [lastQueryData, setLastQueryData] = useState<DependentFields>({
    chartName: '',
    bucketName: '',
    folderPath: '',
    region: '',
    helmVersion: DEFAULT_HELM_VERSION
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  const {
    data: chartVersionData,
    loading: loadingChartVersions,
    refetch: refetchChartVersions,
    error: chartVersionsError
  } = useGetHelmChartVersionDetailsV1({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: getConnectorRefOrConnectorId(modifiedPrevStepData),
      chartName: lastQueryData?.chartName,
      region: lastQueryData?.region,
      bucketName: lastQueryData?.bucketName,
      folderPath: lastQueryData.folderPath,
      storeType: modifiedPrevStepData?.store,
      helmVersion: DEFAULT_HELM_VERSION
    },
    lazy: true,
    debounce: 300
  })

  const chartVersions = useMemo((): SelectOption[] => {
    if (loadingChartVersions) {
      return [{ label: getString('loading'), value: getString('loading') }]
    }
    return defaultTo(chartVersionData?.data?.helmChartVersions, []).map((chartVersion: string) => ({
      label: chartVersion,
      value: chartVersion
    }))
  }, [loadingChartVersions, chartVersionData, getString])

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(getFilteredFieldValues(lastQueryData)))) {
      refetchChartVersions({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          connectorRef: getConnectorRefOrConnectorId(modifiedPrevStepData),
          chartName: lastQueryData?.chartName,
          region: lastQueryData?.region,
          bucketName: lastQueryData?.bucketName,
          folderPath: lastQueryData.folderPath,
          helmVersion: lastQueryData.helmVersion,
          storeType: modifiedPrevStepData?.store
        }
      })
    }
  }, [lastQueryData])

  const getFilteredFieldValues = (obj: DependentFields): Array<string> =>
    fields.filter(key => obj[key] !== undefined).map(key => obj[key] ?? '')

  const canFetchChartVersions = useCallback(
    (dependentFields: DependentFields): boolean => {
      const {
        bucketName = '',
        folderPath = '',
        chartName = '',
        region = '',
        helmVersion = DEFAULT_HELM_VERSION
      } = dependentFields
      return !!(
        (lastQueryData.bucketName !== bucketName ||
          lastQueryData.folderPath !== folderPath ||
          lastQueryData.region !== region ||
          lastQueryData.chartName !== chartName ||
          lastQueryData.helmVersion !== helmVersion) &&
        shouldFetchFieldOptions(
          !isEmpty(modifiedPrevStepData?.identifier)
            ? modifiedPrevStepData
            : { connectorId: { ...modifiedPrevStepData?.connectorRef } },
          getFilteredFieldValues(dependentFields)
        )
      )
    },
    [lastQueryData, modifiedPrevStepData]
  )

  const fetchChartVersions = useCallback(
    (dependentFields: DependentFields): void => {
      if (canFetchChartVersions(dependentFields)) {
        setLastQueryData(dependentFields)
      }
    },
    [canFetchChartVersions]
  )

  return {
    chartVersions,
    loadingChartVersions,
    chartVersionsError,
    fetchChartVersions,
    setLastQueryData
  }
}
