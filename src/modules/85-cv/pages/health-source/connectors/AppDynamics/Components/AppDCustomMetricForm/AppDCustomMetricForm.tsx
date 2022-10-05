/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect, useContext, useCallback } from 'react'

import {
  Container,
  Accordion,
  SelectOption,
  FormInput,
  Text,
  Radio,
  useToaster,
  MultiTypeInputType,
  getMultiTypeFromValue,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import SelectHealthSourceServices from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices'
import GroupName from '@cv/components/GroupName/GroupName'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { initializeGroupNames } from '@cv/components/GroupName/GroupName.utils'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import {
  useGetMetricPacks,
  useGetServiceInstanceMetricPath,
  AppDMetricDefinitions,
  useGetCompleteServiceInstanceMetricPath
} from 'services/cv'
import { AppDynamicsMonitoringSourceFieldNames } from '../../AppDHealthSource.constants'
import { PATHTYPE } from './AppDCustomMetricForm.constants'
import {
  checkRuntimeFields,
  getAllowedTypeForCompleteMetricPath,
  getBasePathValue,
  getDerivedCompleteMetricPath,
  getMetricPathValue,
  setServiceIntance
} from './AppDCustomMetricForm.utils'
import BasePath from '../BasePath/BasePath'
import { BasePathInitValue } from '../BasePath/BasePath.constants'
import MetricChart from '../MetricChart/MetricChart'
import MetricPath from '../MetricPath/MetricPath'
import type { AppDCustomMetricFormInterface } from './AppDCustomMetricForm.types'
import { getTypeOfInput } from '../../AppDHealthSource.utils'
import css from '../../AppDHealthSource.module.scss'
import basePathStyle from '../BasePath/BasePath.module.scss'

export default function AppDCustomMetricForm(props: AppDCustomMetricFormInterface) {
  const { formikValues, formikSetField, mappedMetrics, selectedMetric, connectorIdentifier, isTemplate, expressions } =
    props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'APP_DYNAMICS' }
  })

  const {
    data: serviceInsanceData,
    refetch: refetchServiceInsance,
    error: serviceInstanceError
  } = useGetServiceInstanceMetricPath({ lazy: true })

  const {
    data: completeServiceInsanceData,
    refetch: refetchcompleteServiceInsance,
    error: completeServiceInstanceError
  } = useGetCompleteServiceInstanceMetricPath({ lazy: true })

  useEffect(() => {
    if (serviceInstanceError) {
      showError(getErrorMessage(serviceInstanceError))
    } else if (completeServiceInstanceError) {
      showError(getErrorMessage(completeServiceInstanceError))
    }
  }, [serviceInstanceError])

  useEffect(() => {
    const hasRuntimeField = checkRuntimeFields(formikValues)
    if (formikValues?.continuousVerification && !hasRuntimeField && !isTemplate) {
      refetchServiceInsance({
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          connectorIdentifier,
          appName: formikValues.appdApplication,
          baseFolder: getBasePathValue(formikValues?.basePath),
          tier: formikValues.appDTier,
          metricPath: getMetricPathValue(formikValues?.metricPath)
        }
      })
    } else if (
      isTemplate &&
      formikValues?.continuousVerification &&
      formikValues?.completeMetricPath &&
      !hasRuntimeField
    ) {
      refetchcompleteServiceInsance({
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          connectorIdentifier,
          appName: formikValues.appdApplication,
          completeMetricPath: formikValues.completeMetricPath
        }
      })
    }

    if (getMultiTypeFromValue(formikValues.serviceInstanceMetricPath) === MultiTypeInputType.FIXED) {
      formikSetField('serviceInstanceMetricPath', RUNTIME_INPUT_VALUE)
    }
  }, [
    formikValues?.continuousVerification,
    formikValues.appdApplication,
    formikValues?.basePath,
    formikValues?.metricPath
  ])

  useEffect(() => {
    setServiceIntance({
      serviceInsanceData: serviceInsanceData || completeServiceInsanceData,
      formikValues,
      formikSetField
    })
  }, [serviceInsanceData, completeServiceInsanceData, formikValues?.continuousVerification])

  const [appdGroupName, setAppdGroupName] = useState<SelectOption[]>(initializeGroupNames(mappedMetrics, getString))
  const basePathValue = getBasePathValue(formikValues?.basePath)
  const metricPathValue = getMetricPathValue(formikValues?.metricPath)
  const {
    sourceData: { existingMetricDetails }
  } = useContext(SetupSourceTabsContext)
  const metricDefinitions = existingMetricDetails?.spec?.metricDefinitions
  const currentSelectedMetricDetail = metricDefinitions?.find(
    (metricDefinition: AppDMetricDefinitions) =>
      metricDefinition.metricName === mappedMetrics.get(selectedMetric || '')?.metricName
  )

  useEffect(() => {
    if (formikValues.pathType === PATHTYPE.DropdownPath && formikValues.metricName === selectedMetric) {
      formikSetField(PATHTYPE.FullPath, '')
    }
  }, [formikValues.pathType, selectedMetric])

  const completeMetricPath = useMemo(
    () => `${basePathValue}|${formikValues.appDTier}|${metricPathValue}`.split('|').join(' | '),
    [basePathValue, formikValues.appDTier, metricPathValue]
  )

  const [completeMetricPathType, setCompleteMetricPathType] = useState(
    getTypeOfInput(formikValues?.completeMetricPath as string)
  )

  const derivedCompleteMetricPath = useCallback(
    () => getDerivedCompleteMetricPath(formikValues),
    [
      formikValues?.basePath,
      formikValues?.metricPath,
      formikValues?.appDTier,
      formikValues?.pathType,
      formikValues?.completeMetricPath,
      formikValues?.fullPath
    ]
  )()

  return (
    <Container className={css.main}>
      <SetupSourceCardHeader
        mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
        subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
      />
      <Container className={css.content}>
        <Accordion activeId="metricToService" className={css.accordian} allowMultiOpen>
          <Accordion.Panel
            id="metricToService"
            summary={getString('cv.monitoringSources.mapMetricsToServices')}
            details={
              <>
                <NameId
                  nameLabel={getString('cv.monitoringSources.metricNameLabel')}
                  identifierProps={{
                    inputName: AppDynamicsMonitoringSourceFieldNames.METRIC_NAME,
                    idName: AppDynamicsMonitoringSourceFieldNames.METRIC_IDENTIFIER,
                    isIdentifierEditable: Boolean(!currentSelectedMetricDetail?.identifier)
                  }}
                />
                <GroupName
                  fieldName={'groupName'}
                  groupNames={appdGroupName}
                  onChange={formikSetField}
                  item={formikValues?.groupName}
                  setGroupNames={setAppdGroupName}
                  title={getString('cv.monitoringSources.appD.newGroupName')}
                />
                <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
                  {getString('cv.monitoringSources.appD.appdPathTitle')}
                </Text>
                <Radio
                  padding={{ bottom: 'medium', left: 'xlarge' }}
                  label={getString('cv.healthSource.connectors.AppDynamics.metricPathType.text')}
                  checked={formikValues?.pathType === PATHTYPE.FullPath}
                  onChange={() => formikSetField('pathType', PATHTYPE.FullPath)}
                />
                {!isTemplate ? (
                  <FormInput.Text
                    className={css.fullPath}
                    name={completeMetricPath ? PATHTYPE.CompleteMetricPath : PATHTYPE.FullPath}
                    tooltipProps={{ dataTooltipId: 'appDynamicsCompletePath' }}
                    disabled={formikValues?.pathType !== PATHTYPE.FullPath}
                  />
                ) : (
                  <FormInput.MultiTextInput
                    key={formikValues.metricIdentifier + formikValues.appDTier + formikValues.appdApplication}
                    className={css.fullPath}
                    name={PATHTYPE.CompleteMetricPath}
                    label={''}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: getAllowedTypeForCompleteMetricPath({
                        appDTier: formikValues?.appDTier,
                        appdApplication: formikValues?.appdApplication,
                        connectorIdentifier
                      })
                    }}
                    onChange={(_v, _type, multiType) => {
                      if (completeMetricPathType !== multiType) {
                        setCompleteMetricPathType(multiType)
                      }
                    }}
                    tooltipProps={{ dataTooltipId: 'appDynamicsCompletePath' }}
                    disabled={formikValues?.pathType !== PATHTYPE.FullPath}
                  />
                )}
                <Radio
                  padding={{ bottom: 'medium', left: 'xlarge' }}
                  label={getString('cv.healthSource.connectors.AppDynamics.metricPathType.dropdown')}
                  checked={formikValues?.pathType === PATHTYPE.DropdownPath}
                  onChange={() => formikSetField('pathType', PATHTYPE.DropdownPath)}
                  disabled={isTemplate}
                />
                {!isTemplate && (
                  <Container
                    padding={{ left: 'large' }}
                    className={cx({ [css.disabled]: formikValues?.pathType !== PATHTYPE.DropdownPath })}
                  >
                    <Text padding={{ bottom: 'medium' }} tooltipProps={{ dataTooltipId: 'appDynamicsBasePath' }}>
                      {getString('cv.monitoringSources.appD.appdPathDetail')}
                    </Text>
                    <BasePath
                      basePathValue={formikValues?.basePath || BasePathInitValue}
                      onChange={formikSetField}
                      appName={formikValues.appdApplication}
                      connectorIdentifier={connectorIdentifier}
                    />
                    {basePathValue && formikValues.appDTier && (
                      <MetricPath
                        onChange={formikSetField}
                        metricPathValue={formikValues?.metricPath}
                        connectorIdentifier={connectorIdentifier}
                        baseFolder={basePathValue}
                        appName={formikValues.appdApplication}
                        tier={formikValues.appDTier}
                      />
                    )}
                    <Container className={basePathStyle.basePathContainer}>
                      <Text
                        font={{ variation: FontVariation.SMALL_BOLD }}
                        color={Color.GREY_400}
                        className={basePathStyle.basePathLabel}
                      >
                        {getString('cv.healthSource.connectors.AppDynamics.selectedPathLabel')}
                      </Text>
                      <Text className={basePathStyle.basePathValue} font={{ variation: FontVariation.SMALL_SEMI }}>
                        {completeMetricPath}
                      </Text>
                    </Container>
                  </Container>
                )}
              </>
            }
          />
          <Accordion.Panel
            id="metricChart"
            summary={getString('cv.monitoringSources.prometheus.chartAndRecords')}
            details={
              <>
                {getMultiTypeFromValue(formikValues.appdApplication) !== MultiTypeInputType.FIXED ||
                getMultiTypeFromValue(formikValues.appDTier) !== MultiTypeInputType.FIXED ||
                getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED ||
                completeMetricPathType !== MultiTypeInputType.FIXED ? (
                  <>
                    <Text className={basePathStyle.basePathValue} font={{ variation: FontVariation.SMALL_SEMI }}>
                      {getString('cv.customHealthSource.chartRuntimeWarning')}
                    </Text>
                  </>
                ) : (
                  <MetricChart
                    connectorIdentifier={connectorIdentifier}
                    appName={formikValues.appdApplication}
                    completeMetricPath={derivedCompleteMetricPath}
                  />
                )}
              </>
            }
          />
          <Accordion.Panel
            id="riskProfile"
            summary={getString('cv.monitoringSources.assign')}
            details={
              <>
                <SelectHealthSourceServices
                  key={formikValues.metricIdentifier}
                  values={{
                    sli: !!formikValues?.sli,
                    healthScore: !!formikValues?.healthScore,
                    continuousVerification: !!formikValues?.continuousVerification,
                    riskCategory: formikValues?.riskCategory,
                    serviceInstanceMetricPath: formikValues?.serviceInstanceMetricPath
                  }}
                  isTemplate={isTemplate}
                  expressions={expressions}
                  metricPackResponse={metricPackResponse}
                  hideServiceIdentifier
                />
              </>
            }
          />
        </Accordion>
      </Container>
    </Container>
  )
}
