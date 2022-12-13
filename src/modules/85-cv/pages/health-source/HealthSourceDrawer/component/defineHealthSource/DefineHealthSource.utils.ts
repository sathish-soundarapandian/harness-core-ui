/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import type { AwsPrometheusWorkspaceDTO, HealthSource, ResponseListString } from 'services/cv'
import { Connectors } from '@connectors/constants'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { GCOProduct } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'
import { PrometheusProductNames } from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource.constants'
import { DatadogProduct } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'
import { ErrorTrackingProductNames } from '@cv/pages/health-source/connectors/ErrorTrackingHealthSource/ErrorTrackingHealthSource.utils'
import { CustomHealthProduct } from '@cv/pages/health-source/connectors/CustomHealthSource/CustomHealthSource.constants'
import { CloudWatchProductNames } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatchConstants'
import { SumoLogicProducts } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import {
  NewRelicProductNames,
  ConnectorRefFieldName,
  SplunkProduct,
  DynatraceProductNames,
  ElkProduct,
  AWSDataSourceType,
  DataSourceTypeFieldNames
} from './DefineHealthSource.constant'
import type {
  ConnectorDisableFunctionProps,
  DataSourceTypeValidateFunctionProps,
  DefineHealthSourceFormInterface,
  FormValidationFunctionProps,
  GetDataSourceTypeParams
} from './DefineHealthSource.types'

export const validate = (getString: UseStringsReturn['getString']): Yup.ObjectSchema => {
  return Yup.object().shape({
    sourceType: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.source')),
    healthSourceName: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.name')),
    product: Yup.string()
      .trim()
      .required()
      .notOneOf(['Custom Connector'], getString('cv.onboarding.selectProductScreen.validationText.product')),
    region: Yup.string().when(DataSourceTypeFieldNames.DataSourceType, {
      is: AWSDataSourceType,
      then: Yup.string().required(getString('cd.cloudFormation.errors.region'))
    }),
    workspaceId: Yup.string().when(DataSourceTypeFieldNames.DataSourceType, {
      is: AWSDataSourceType,
      then: Yup.string().required(getString('cv.healthSource.awsWorkspaceIdValidation'))
    }),
    [ConnectorRefFieldName]: Yup.string()
      .nullable()
      .required(getString('cv.onboarding.selectProductScreen.validationText.connectorRef'))
  })
}

export const validateDuplicateIdentifier = (
  values: DefineHealthSourceFormInterface,
  getString: UseStringsReturn['getString']
): Record<string, string> => {
  const { healthSourceIdentifier, healthSourceList } = values
  if (healthSourceList?.some(item => item.identifier === healthSourceIdentifier)) {
    return { healthSourceName: getString('cv.changeSource.duplicateIdentifier') }
  }

  return {}
}

const isDataSourceTypeNotValid = ({
  isDataSourceTypeSelectorEnabled,
  sourceType,
  dataSourceType
}: DataSourceTypeValidateFunctionProps): boolean => {
  return Boolean(isDataSourceTypeSelectorEnabled && sourceType === HealthSourceTypes.Prometheus && !dataSourceType)
}

export const formValidation = ({
  values,
  isEdit,
  isDataSourceTypeSelectorEnabled,
  getString
}: FormValidationFunctionProps): Record<string, string> => {
  let errors = {}

  const { dataSourceType, sourceType } = values || {}

  if (!isEdit) {
    errors = validateDuplicateIdentifier(values, getString)
  }

  if (
    isDataSourceTypeNotValid({
      dataSourceType,
      sourceType,
      isDataSourceTypeSelectorEnabled
    })
  ) {
    errors = {
      ...errors,
      dataSourceType: getString('cv.healthSource.dataSourceTypeValidation')
    }
  }

  return errors
}

export const getIsConnectorDisabled = ({
  isEdit,
  connectorRef,
  sourceType,
  isDataSourceTypeSelectorEnabled,
  dataSourceType
}: ConnectorDisableFunctionProps): boolean => {
  if (isEdit && connectorRef) {
    return true
  } else if (!isEdit && !sourceType) {
    return true
  } else if (isDataSourceTypeNotValid({ isDataSourceTypeSelectorEnabled, sourceType, dataSourceType })) {
    return true
  }

  return false
}

export const getConnectorTypeName = (name: HealthSourceTypes): string => {
  let connectorTypeName

  switch (name) {
    case HealthSourceTypes.GoogleCloudOperations:
      connectorTypeName = Connectors.GCP
      break
    case HealthSourceTypes.CloudWatch:
      connectorTypeName = Connectors.AWS
      break
    default:
      connectorTypeName = name
  }

  return connectorTypeName
}

export const getConnectorPlaceholderText = (sourceType?: string, dataSourceType?: string): string => {
  if (!sourceType) {
    return ''
  }

  if (sourceType === Connectors.AWS || dataSourceType === AWSDataSourceType) {
    return Connectors.AWS.toUpperCase()
  } else {
    return sourceType
  }
}

export const getFeatureOption = (
  type: string,
  getString: UseStringsReturn['getString'],
  isSplunkMetricEnabled = false
): SelectOption[] => {
  switch (type) {
    case Connectors.APP_DYNAMICS:
      return [
        {
          value: 'Application Monitoring',
          label: getString('cv.monitoringSources.appD.product.applicationMonitoring')
        }
      ]
    case Connectors.GCP:
      return [
        {
          value: GCOProduct.CLOUD_METRICS,
          label: getString('cv.monitoringSources.gco.product.metrics')
        },
        {
          value: GCOProduct.CLOUD_LOGS,
          label: getString('cv.monitoringSources.gco.product.logs')
        }
      ]
    case Connectors.DATADOG:
      return [
        {
          value: DatadogProduct.CLOUD_METRICS,
          label: getString('cv.monitoringSources.gco.product.metrics')
        },
        {
          value: DatadogProduct.CLOUD_LOGS,
          label: getString('cv.monitoringSources.gco.product.logs')
        }
      ]
    case HealthSourceTypes.StackdriverLog:
      return [
        {
          value: GCOProduct.CLOUD_LOGS,
          label: getString('cv.monitoringSources.gco.product.logs')
        }
      ]
    case Connectors.PROMETHEUS:
    case HealthSourceTypes.AwsPrometheus:
      return [
        {
          label: PrometheusProductNames.APM,
          value: getString('connectors.prometheusLabel')
        }
      ]
    case Connectors.NEW_RELIC:
      return [
        {
          value: NewRelicProductNames.APM,
          label: getString('connectors.newRelic.products.fullStackObservability')
        }
      ]
    case Connectors.DYNATRACE:
      return [
        {
          value: DynatraceProductNames.APM,
          label: getString('connectors.newRelic.products.fullStackObservability')
        }
      ]
    case Connectors.SPLUNK: {
      const optionalFeature = []
      if (isSplunkMetricEnabled) {
        optionalFeature.push({
          value: SplunkProduct.SPLUNK_METRICS,
          label: getString('cv.monitoringSources.gco.product.metrics')
        })
      }
      return [
        {
          value: SplunkProduct.SPLUNK_LOGS,
          label: getString('cv.monitoringSources.gco.product.logs')
        },
        ...optionalFeature
      ]
    }
    case HealthSourceTypes.Elk: {
      return [
        {
          value: ElkProduct.ELK_LOGS,
          label: ElkProduct.ELK_LOGS
        }
      ]
    }
    case Connectors.CUSTOM_HEALTH:
      return [
        {
          label: getString('cv.customHealthSource.customHealthMetric'),
          value: CustomHealthProduct.METRICS
        },
        {
          label: getString('cv.customHealthSource.customHealthLog'),
          value: CustomHealthProduct.LOGS
        }
      ]
    case Connectors.ERROR_TRACKING:
      return [
        {
          value: ErrorTrackingProductNames.LOGS,
          label: getString('cv.monitoringSources.gco.product.logs')
        }
      ]

    case Connectors.AWS:
      return [
        {
          value: CloudWatchProductNames.METRICS,
          label: CloudWatchProductNames.METRICS
        }
      ]
    case Connectors.SUMOLOGIC:
      return [
        {
          value: 'METRICS',
          label: SumoLogicProducts.METRICS
        },
        {
          value: 'LOGS',
          label: SumoLogicProducts.LOGS
        }
      ]
    default:
      return []
  }
}

export function getProductBasedOnType(
  getString: UseStringsReturn['getString'],
  type?: HealthSource['type'],
  currProduct?: SelectOption
): SelectOption | undefined {
  switch (type) {
    case 'CustomHealthLog':
      return getFeatureOption(Connectors.CUSTOM_HEALTH, getString)[1]
    case 'CustomHealthMetric':
      return getFeatureOption(Connectors.CUSTOM_HEALTH, getString)[0]
    case Connectors.PROMETHEUS:
    case HealthSourceTypes.AwsPrometheus:
      return getFeatureOption(Connectors.PROMETHEUS, getString)[0]
    default:
      return { ...currProduct } as SelectOption
  }
}

const getHealthSourceType = (type?: string, sourceType?: string): string | undefined => {
  if (type === HealthSourceTypes.AwsPrometheus) {
    return HealthSourceTypes.Prometheus
  }

  return sourceType
}

export const getDataSourceType = ({
  type,
  dataSourceType,
  isDataSourceTypeSelectorEnabled
}: GetDataSourceTypeParams): string | null => {
  if (type === HealthSourceTypes.AwsPrometheus || dataSourceType === AWSDataSourceType) {
    return AWSDataSourceType
  } else if (isDataSourceTypeSelectorEnabled) {
    return HealthSourceTypes.Prometheus
  }

  return null
}

const PrometheusTypes = [Connectors.PROMETHEUS, HealthSourceTypes.AwsPrometheus]

export const getInitialValues = (
  sourceData: any,
  getString: UseStringsReturn['getString'],
  isDataSourceTypeSelectorEnabled?: boolean
): any => {
  const currentHealthSource = sourceData?.healthSourceList?.find(
    (el: any) => el?.identifier === sourceData?.healthSourceIdentifier
  )

  const { region, workspaceId } = currentHealthSource?.spec || {}

  const { sourceType, dataSourceType, region: sourceDataRegion, workspaceId: sourceDataWorkspaceId } = sourceData || {}

  // TODO: remove check for prometheus when BE changes are done
  const selectedFeature = PrometheusTypes.includes(currentHealthSource?.type) ? '' : currentHealthSource?.spec?.feature
  const initialValues = {
    [ConnectorRefFieldName]: '',
    ...sourceData,
    type: getHealthSourceType(currentHealthSource?.type),
    sourceType: getHealthSourceType(currentHealthSource?.type, sourceType),
    dataSourceType: getDataSourceType({
      type: currentHealthSource?.type,
      dataSourceType,
      isDataSourceTypeSelectorEnabled
    }),
    region: sourceDataRegion || region,
    workspaceId: sourceDataWorkspaceId || workspaceId,
    product: selectedFeature
      ? { label: selectedFeature, value: selectedFeature }
      : getProductBasedOnType(getString, currentHealthSource?.type, sourceData?.product)
  }

  return initialValues
}

export const getSelectedFeature = (sourceData: any): any => {
  const currentHealthSource = sourceData?.healthSourceList?.find(
    (el: any) => el?.identifier === sourceData?.healthSourceIdentifier
  )
  const selectedFeature = currentHealthSource?.spec?.feature

  return selectedFeature ? { label: selectedFeature, value: selectedFeature } : { ...sourceData?.product }
}

export function getRegionsDropdownOptions(regions: ResponseListString['data']): SelectOption[] {
  const regionOptions: SelectOption[] = []

  if (regions) {
    regions.forEach(region => {
      if (region) {
        regionOptions.push({
          value: region,
          label: region
        })
      }
    })
  }

  return regionOptions
}

export function getWorkspaceDropdownOptions(workspaces?: AwsPrometheusWorkspaceDTO[]): SelectOption[] {
  const workspaceOptions: SelectOption[] = []

  if (workspaces) {
    workspaces.forEach(workspace => {
      const { name, workspaceId } = workspace || {}
      if (name && workspaceId) {
        workspaceOptions.push({
          value: workspaceId,
          label: name
        })
      }
    })
  }

  return workspaceOptions
}

export function canShowDataSelector(sourceType?: string, isDataSourceTypeSelectorEnabled?: boolean): boolean {
  return Boolean(sourceType === HealthSourceTypes.Prometheus && isDataSourceTypeSelectorEnabled)
}

export function canShowDataInfoSelector(
  sourceType?: string,
  dataSourceType?: string,
  isDataSourceTypeSelectorEnabled?: boolean
): boolean {
  return canShowDataSelector(sourceType, isDataSourceTypeSelectorEnabled) && dataSourceType === AWSDataSourceType
}
