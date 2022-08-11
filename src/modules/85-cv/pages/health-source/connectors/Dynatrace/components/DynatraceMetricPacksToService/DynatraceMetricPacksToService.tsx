/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInput,
  MultiTypeInputType,
  SelectOption,
  Text,
  Utils
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import { HealthSoureSupportedConnectorTypes } from '@cv/pages/health-source/connectors/MonitoredServiceConnector.constants'
import { mapServiceListToOptions } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import {
  createMetricDataFormik,
  getInputGroupProps,
  validateMetrics
} from '@cv/pages/health-source/connectors/MonitoredServiceConnector.utils'
import ValidationStatus from '@cv/pages/components/ValidationStatus/ValidationStatus'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import MetricPackCustom from '@cv/pages/health-source/connectors/MetricPackCustom'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import { Connectors } from '@connectors/constants'
import {
  MetricPackDTO,
  MetricPackValidationResponse,
  TimeSeriesMetricPackDTO,
  useGetDynatraceServices
} from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { DynatraceMetricPacksToServiceProps } from './DynatraceMetricPacksToService.types'
import { extractServiceMethods } from './DynatraceMetricPacksToService.utils'
import { getTypeOfInput } from '../../../AppDynamics/AppDHealthSource.utils'
import css from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.module.scss'

export default function DynatraceMetricPacksToService(props: DynatraceMetricPacksToServiceProps): JSX.Element {
  const { connectorIdentifier, dynatraceMetricData, setDynatraceMetricData, metricValues, isTemplate, expressions } =
    props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [servicesTracingId, validationTracingId] = useMemo(() => [Utils.randomId(), Utils.randomId()], [])
  const [validationResultData, setValidationResultData] = useState<MetricPackValidationResponse[]>()
  const [selectedMetricPacks, setSelectedMetricPacks] = useState<MetricPackDTO[]>([])
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED
  const metricDataSelectedService =
    typeof dynatraceMetricData.selectedService !== 'string'
      ? dynatraceMetricData?.selectedService?.value
      : dynatraceMetricData.selectedService
  const [inputType, setInputType] = React.useState<MultiTypeInputType | undefined>(() =>
    getTypeOfInput(metricDataSelectedService as string)
  )

  const [dynatraceValidation, setDynatraceValidation] = useState<{
    status: string
    result: MetricPackValidationResponse[] | []
  }>({
    status: '',
    result: []
  })

  const {
    data: servicesListData,
    loading: servicesListLoading,
    refetch: refetchServiceList
  } = useGetDynatraceServices({
    lazy: true,
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      tracingId: servicesTracingId
    }
  })

  const dynatraceServiceOptions = useMemo(() => {
    return mapServiceListToOptions(servicesListData?.data || [])
  }, [servicesListData?.data])

  useEffect(() => {
    if (!isConnectorRuntimeOrExpression) {
      refetchServiceList()
    }
  }, [isConnectorRuntimeOrExpression])

  useEffect(() => {
    if (
      getTypeOfInput(connectorIdentifier) !== MultiTypeInputType.FIXED &&
      getTypeOfInput(metricDataSelectedService as string) !== MultiTypeInputType.FIXED
    ) {
      setInputType(getTypeOfInput(metricDataSelectedService as string))
    }
  }, [connectorIdentifier, dynatraceMetricData.selectedService])

  const onValidate = async (serviceMethods: string[], metricObject: { [key: string]: any }): Promise<void> => {
    setDynatraceValidation({ status: StatusOfValidation.IN_PROGRESS, result: [] })
    const filteredMetricPack = selectedMetricPacks.filter(item => metricObject[item.identifier as string])
    const { validationStatus, validationResult } = await validateMetrics(
      { metricPacks: filteredMetricPack, serviceMethodsIds: serviceMethods },
      {
        accountId,
        connectorIdentifier: connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        tracingId: validationTracingId
      },
      HealthSoureSupportedConnectorTypes.DYNATRACE
    )
    setDynatraceValidation({
      status: validationStatus as string,
      result: validationResult as MetricPackValidationResponse[]
    })
  }
  useEffect(() => {
    if (
      !isConnectorRuntimeOrExpression &&
      metricDataSelectedService &&
      selectedMetricPacks.length &&
      dynatraceValidation.status !== StatusOfValidation.IN_PROGRESS
    ) {
      onValidate(dynatraceMetricData.serviceMethods || [], createMetricDataFormik(selectedMetricPacks))
    }
  }, [selectedMetricPacks, dynatraceMetricData.selectedService, dynatraceMetricData.serviceMethods])

  const onChangeDynatraceService = useCallback(
    item => {
      setDynatraceMetricData({
        ...metricValues,
        selectedService: { ...item },
        serviceMethods: extractServiceMethods(servicesListData?.data || [], item.value as string)
      })
    },
    [metricValues]
  )

  const onChangeMultiTypeDynatraceService = useCallback(
    (item, _valueType, type) => {
      if (type === MultiTypeInputType.FIXED) {
        const selectedItem = item as SelectOption
        setDynatraceMetricData({
          ...metricValues,
          selectedService: { ...selectedItem },
          serviceMethods: extractServiceMethods(servicesListData?.data || [], selectedItem.value as string)
        })
      } else {
        setDynatraceMetricData({
          ...metricValues,
          selectedService: item as string,
          serviceMethods: []
        })
      }
    },
    [metricValues]
  )

  const onChangeMetricPack = useCallback(
    async metricValue => {
      setDynatraceMetricData({
        ...metricValues,
        metricData: metricValue
      })
      await onValidate(metricValues.serviceMethods || [], metricValue)
    },
    [metricValues]
  )

  return (
    <>
      <CardWithOuterTitle title={'Services'}>
        <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
          <Container margin={{ bottom: 'small' }} width={'400px'} color={Color.BLACK}>
            {isTemplate ? (
              <>
                <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
                  {getString('cv.healthSource.connectors.Dynatrace.servicesLabel')}
                </Text>
                <MultiTypeInput
                  key={inputType}
                  name={'dynatraceService'}
                  selectProps={{
                    items: dynatraceServiceOptions
                  }}
                  expressions={expressions}
                  allowableTypes={
                    isConnectorRuntimeOrExpression
                      ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                      : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                  }
                  multitypeInputValue={inputType}
                  value={dynatraceMetricData.selectedService}
                  onChange={onChangeMultiTypeDynatraceService}
                />
              </>
            ) : (
              <FormInput.Select
                className={css.applicationDropdown}
                onChange={onChangeDynatraceService}
                value={dynatraceMetricData.selectedService as SelectOption}
                name={'dynatraceService'}
                placeholder={
                  servicesListLoading
                    ? getString('loading')
                    : getString('cv.healthSource.connectors.Dynatrace.servicePlaceholder')
                }
                items={dynatraceServiceOptions}
                label={getString('cv.healthSource.connectors.Dynatrace.servicesLabel')}
                {...getInputGroupProps(() =>
                  setDynatraceMetricData({ ...metricValues, selectedService: { label: '', value: '' } })
                )}
              />
            )}
          </Container>
          {!isConnectorRuntimeOrExpression && (
            <Container width={'300px'} color={Color.BLACK}>
              {typeof metricValues.selectedService === 'string'
                ? metricValues.selectedService
                : metricValues.selectedService?.value && (
                    <ValidationStatus
                      validationStatus={dynatraceValidation?.status as StatusOfValidation}
                      onClick={
                        dynatraceValidation.result?.length
                          ? () => setValidationResultData(dynatraceValidation.result)
                          : undefined
                      }
                      onRetry={() => onValidate(metricValues.serviceMethods || [], metricValues.metricData)}
                    />
                  )}
            </Container>
          )}
        </Layout.Horizontal>
        <Container>
          <Text icon="warning-sign" iconProps={{ size: 14 }}>
            {getString('cv.healthSource.connectors.Dynatrace.keyRequestRequiredLabel')}
          </Text>
        </Container>
      </CardWithOuterTitle>
      <CardWithOuterTitle title={getString('metricPacks')}>
        <Layout.Vertical>
          <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
          <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
            <MetricPackCustom
              setMetricDataValue={value => {
                setDynatraceMetricData({
                  ...metricValues,
                  metricData: value
                })
              }}
              metricPackValue={metricValues.metricPacks}
              metricDataValue={metricValues.metricData}
              setSelectedMetricPacks={
                setSelectedMetricPacks as React.Dispatch<React.SetStateAction<TimeSeriesMetricPackDTO[]>>
              }
              connector={HealthSoureSupportedConnectorTypes.DYNATRACE}
              onChange={onChangeMetricPack}
            />
            {validationResultData && (
              <MetricsVerificationModal
                verificationData={validationResultData}
                guid={validationTracingId}
                onHide={setValidationResultData as () => void}
                verificationType={Connectors.DYNATRACE}
              />
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
      </CardWithOuterTitle>
    </>
  )
}
