/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  Container,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Text,
  Icon,
  Utils,
  FormError,
  PageError,
  NoDataCard,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { noop, isEmpty } from 'lodash-es'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Drawer } from '@blueprintjs/core'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  StackdriverDefinition,
  useGetRiskCategoryForCustomHealthMetric,
  useGetStackdriverDashboardDetail,
  useGetStackdriverSampleData
} from 'services/cv'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { QueryContent } from '@cv/components/QueryViewer/QueryViewer'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import MetricDashboardWidgetNav from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav'
import {
  getManuallyCreatedQueries,
  formatJSON,
  initializeSelectedMetrics,
  transformSampleDataIntoHighchartOptions,
  validate,
  ensureFieldsAreFilled,
  transformGCOMetricSetupSourceToGCOHealthSource,
  transformGCOMetricHealthSourceToGCOMetricSetupSource,
  getPlaceholderForIdentifier,
  mapstackdriverDashboardDetailToMetricWidget,
  onSelectNavItem,
  getNoDataMessage,
  getIsQueryExecuted,
  persistCustomMetric
} from './GCOMetricsHealthSource.utils'
import DrawerFooter from '../../common/DrawerFooter/DrawerFooter'
import type { GCOMetricInfo, GCOMetricsHealthSourceProps, ValidationChartProps } from './GCOMetricsHealthSource.type'
import { OVERALL, FieldNames, DrawerOptions } from './GCOMetricsHealthSource.constants'
import SelectHealthSourceServices from '../../common/SelectHealthSourceServices/SelectHealthSourceServices'
import MetricErrorAndLoading from '../../common/MetricErrorAndLoading/MetricErrorAndLoading'
import MetricThresholdProvider from './components/MetricThresholds/MetricThresholdProvider'
import { initGroupedCreatedMetrics } from '../../common/CustomMetric/CustomMetric.utils'
import type { CustomMappedMetric } from '../../common/CustomMetric/CustomMetric.types'
import type { MetricThresholdsState } from '../../common/MetricThresholds/MetricThresholds.types'
import css from './GCOMetricsHealthSource.module.scss'

const GroupByClause = 'groupByFields'

function ValidationChart(props: ValidationChartProps): JSX.Element {
  const {
    loading,
    error,
    queryValue,
    onRetry,
    sampleData,
    setAsTooManyMetrics,
    isQueryExecuted = false,
    noDataMessage
  } = props
  const { getString } = useStrings()
  const isTooManyMetrics = Boolean(
    sampleData?.series?.length && sampleData.series.length > 1 && queryValue?.includes(GroupByClause)
  )

  useEffect(() => {
    setAsTooManyMetrics?.(isTooManyMetrics)
  }, [sampleData])

  if (!queryValue?.length) {
    return (
      <Container className={cx(css.chartContainer, css.noDataContainer)}>
        <NoDataCard
          icon="main-notes"
          message={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.enterQueryForValidation')}
        />
      </Container>
    )
  }

  if (!isQueryExecuted) {
    return (
      <Container className={cx(css.chartContainer, css.noDataContainer)}>
        <NoDataCard icon="timeline-line-chart" message={noDataMessage} />
      </Container>
    )
  }

  if (loading) {
    return <Icon name="steps-spinner" size={32} color={Color.GREY_600} className={css.sampleDataSpinner} />
  }

  if (error) {
    return (
      <Container className={css.chartContainer}>
        <PageError message={error} onClick={() => onRetry()} />
      </Container>
    )
  }

  if (!sampleData?.series?.length) {
    return (
      <Container className={cx(css.chartContainer, css.noDataContainer)}>
        <NoDataCard
          icon="warning-sign"
          message={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.noDataForQuery')}
          buttonText={getString('retry')}
          onClick={() => onRetry()}
        />
      </Container>
    )
  }

  return (
    <Container className={css.chartContainer}>
      <HighchartsReact highcharts={Highcharts} options={sampleData} />
      {isTooManyMetrics && (
        <Text
          intent="danger"
          font={{ size: 'small' }}
          className={css.tooManyRecords}
          icon="warning-sign"
          iconProps={{ intent: 'danger' }}
        >
          {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tooManyMetrics')}
        </Text>
      )}
    </Container>
  )
}

export function GCOMetricsHealthSource(props: GCOMetricsHealthSourceProps): JSX.Element {
  const { data, onSubmit, isTemplate, expressions } = props

  const { onPrevious, sourceData } = useContext(SetupSourceTabsContext)

  const { existingMetricDetails, selectedDashboards: selectedDashboardsContextValue = [] } = sourceData || {}

  const metricDefinitions = existingMetricDetails?.spec?.metricDefinitions

  const { getString } = useStrings()

  const transformedData = useMemo(() => transformGCOMetricHealthSourceToGCOMetricSetupSource(data), [data])

  const [metricThresholds, setMetricThresholds] = useState<MetricThresholdsState>({
    ignoreThresholds: transformedData.ignoreThresholds,
    failFastThresholds: transformedData.failFastThresholds
  })

  const [updatedData, setUpdatedData] = useState(
    initializeSelectedMetrics(selectedDashboardsContextValue, transformedData.metricDefinition)
  )
  const [shouldShowChart, setShouldShowChart] = useState(false)
  const [isIdentifierEdited, setIsIdentifierEdited] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const connectorIdentifier = typeof data?.connectorRef === 'string' ? data?.connectorRef : data?.connectorRef?.value
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED
  const queryParams = useMemo(
    () => ({
      orgIdentifier,
      projectIdentifier,
      accountId,
      tracingId: Utils.randomId(),
      connectorIdentifier: connectorIdentifier
    }),
    [data?.connectorRef, projectIdentifier, orgIdentifier, accountId]
  )

  const { mutate, cancel } = useGetStackdriverSampleData({ queryParams })

  useEffect(() => {
    setIsIdentifierEdited(false)
  }, [selectedMetric])

  const [isQueryExpanded, setIsQueryExpanded] = useState(false)
  const [sampleData, setSampleData] = useState<Highcharts.Options | undefined>()

  const onQueryChange = useCallback(
    async (updatedQueryValue: string | undefined, onError?: () => void) => {
      cancel()
      try {
        if (updatedQueryValue?.length) {
          setLoading(true)
          setError(undefined)
          const response = await mutate(JSON.parse(updatedQueryValue), {
            queryParams: { ...queryParams, tracingId: Utils.randomId() }
          })
          if (response?.data) {
            setError(undefined)
            setSampleData(transformSampleDataIntoHighchartOptions(response?.data || []))
          }
          setLoading(false)
        } else {
          setError(undefined)
          setSampleData(transformSampleDataIntoHighchartOptions([]))
        }
      } catch (e) {
        if (e.message?.includes('The user aborted a request.')) {
          return
        }
        if (e.name === 'SyntaxError') {
          setError(getErrorMessage(e))
          setSampleData(transformSampleDataIntoHighchartOptions([]))
          onError?.()
        } else if (e?.data) {
          setError(getErrorMessage(e))
          setSampleData(transformSampleDataIntoHighchartOptions([]))
        }
        setLoading(false)
      }
    },
    [mutate, cancel]
  )

  const stackDriverDashBoardRequest = useGetStackdriverDashboardDetail({ lazy: true })

  const { loading: loadingDashBoardData } = stackDriverDashBoardRequest

  const riskProfileResponse = useGetRiskCategoryForCustomHealthMetric({})

  const metricFormData = updatedData.get(selectedMetric || '') || {}
  const formInitialValues = {
    ...metricFormData,
    ...metricThresholds
  }

  const groupedCreatedMetrics = initGroupedCreatedMetrics(updatedData as Map<string, CustomMappedMetric>, getString)

  const handleOnManualMetricDelete = (metricIdToBeDeleted: string): void => {
    updatedData.delete(metricIdToBeDeleted)
    setUpdatedData(new Map(updatedData))
  }

  return (
    <Formik<GCOMetricInfo>
      enableReinitialize={true}
      formName="mapGCOMetrics"
      initialValues={formInitialValues}
      onSubmit={noop}
      validate={values => {
        const newMap = new Map(updatedData)
        if (selectedMetric) {
          newMap.set(selectedMetric, { ...values })
        } else {
          return {}
        }

        return validate(values, newMap, getString)
      }}
    >
      {formikProps => {
        const {
          sli = false,
          healthScore = false,
          continuousVerification = false,
          riskCategory = '',
          query
        } = formikProps.values

        persistCustomMetric({
          mappedMetrics: updatedData,
          selectedMetric,
          metricThresholds,
          formikValues: formikProps.values,
          setMappedMetrics: setUpdatedData
        })

        const currentSelectedMetricDetail = metricDefinitions?.find(
          (metricDefinition: StackdriverDefinition) =>
            metricDefinition.metricName === updatedData.get(selectedMetric as string)?.metricName
        )

        const shouldShowIdentifierPlaceholder =
          !currentSelectedMetricDetail?.identifier && !formikProps.values?.identifier

        if (shouldShowIdentifierPlaceholder && !isIdentifierEdited) {
          formikProps.setFieldValue(
            FieldNames.IDENTIFIER,
            getPlaceholderForIdentifier(formikProps.values?.metricName, getString)
          )
          setIsIdentifierEdited(true)
        }

        const dashboard: { itemId: string; title: string }[] = selectedDashboardsContextValue.map(
          (item: { id: string; name: string }) => {
            return { itemId: item.id, title: item.name }
          }
        )

        const isDashdoardEmpty = !Object.values(dashboard).filter(item => item.title).length

        return (
          <FormikForm className={css.setupContainer}>
            <>
              <SetupSourceLayout
                content={
                  <>
                    <Heading level={3} color={Color.BLACK} className={css.sectionHeading}>
                      {getString('cv.monitoringSources.gco.mapMetricsToServicesPage.querySpecifications')}
                    </Heading>

                    <MetricErrorAndLoading isEmpty={isEmpty(metricFormData)} loading={loadingDashBoardData}>
                      <Container padding={{ left: 'large' }}>
                        <Container className={css.nameAndMetricTagContainer}>
                          <FormInput.KVTagInput
                            label={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.metricTagsLabel')}
                            name={FieldNames.METRIC_TAGS}
                            tagsProps={{
                              addOnBlur: true,
                              addOnPaste: true,
                              onChange: values => {
                                const newTagObj: { [key: string]: any } = {}
                                ;(values as string[])?.forEach(val => {
                                  newTagObj[val as string] = ''
                                })
                                formikProps.setFieldValue(FieldNames.METRIC_TAGS, newTagObj)
                              }
                            }}
                          />
                          {formikProps.errors['metricTags'] && (
                            <FormError name="metricTags" errorMessage={formikProps.errors['metricTags']} />
                          )}
                          <NameId
                            nameLabel={getString('cv.monitoringSources.metricNameLabel')}
                            identifierProps={{
                              inputName: FieldNames.METRIC_NAME,
                              idName: FieldNames.IDENTIFIER,
                              isIdentifierEditable: Boolean(!currentSelectedMetricDetail?.identifier)
                            }}
                          />
                        </Container>
                        <Container className={css.validationContainer}>
                          <Container width={'500px'}>
                            <QueryContent
                              showLabel
                              handleFetchRecords={() => {
                                if (!shouldShowChart) {
                                  setShouldShowChart(true)
                                }
                                onQueryChange(query)
                              }}
                              onClickExpand={setIsQueryExpanded}
                              isDialogOpen={isQueryExpanded}
                              query={query}
                              loading={loading}
                              textAreaName={FieldNames.QUERY}
                              isTemplate={isTemplate}
                              expressions={expressions}
                              isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
                            />
                          </Container>
                          <ValidationChart
                            loading={loading}
                            error={error}
                            sampleData={sampleData}
                            queryValue={query}
                            setAsTooManyMetrics={isTooMany => {
                              if (isTooMany) {
                                formikProps.setFieldError('tooManyMetrics', 'invalid')
                              } else {
                                formikProps.setFieldError('tooManyMetrics', '')
                              }
                            }}
                            noDataMessage={getNoDataMessage(getString, formikProps?.values?.query)}
                            isQueryExecuted={getIsQueryExecuted(shouldShowChart, formikProps?.values?.query)}
                            onRetry={async () => {
                              if (!query?.length) return
                              onQueryChange(query)
                            }}
                          />
                          {isQueryExpanded && (
                            <Drawer
                              {...DrawerOptions}
                              onClose={() => {
                                setIsQueryExpanded(false)
                              }}
                            >
                              <MonacoEditor
                                language="javascript"
                                value={formatJSON(query)}
                                data-testid="monaco-editor"
                                onChange={val => formikProps.setFieldValue(FieldNames.QUERY, val)}
                                options={
                                  {
                                    readOnly: false,
                                    wordBasedSuggestions: false,
                                    fontFamily: "'Roboto Mono', monospace",
                                    fontSize: 13
                                  } as any
                                }
                              />
                            </Drawer>
                          )}
                        </Container>
                        <Container width={'500px'}>
                          <SelectHealthSourceServices
                            values={{
                              sli,
                              healthScore,
                              riskCategory,
                              continuousVerification,
                              serviceInstanceMetricPath: formikProps.values?.serviceInstanceField
                            }}
                            hideServiceIdentifier
                            riskProfileResponse={riskProfileResponse}
                            isTemplate={isTemplate}
                            expressions={expressions}
                            customServiceInstanceName={FieldNames.SERVICE_INSTANCE_FIELD}
                            isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
                          />
                        </Container>
                        {!isTemplate && formikProps.values.continuousVerification && (
                          <FormInput.Text
                            name={FieldNames.SERVICE_INSTANCE_FIELD}
                            label={getString('cv.monitoringSources.serviceInstanceIdentifier')}
                          />
                        )}
                        <FormInput.Text name={OVERALL} className={css.hiddenField} />
                      </Container>
                    </MetricErrorAndLoading>

                    <DrawerFooter
                      onPrevious={onPrevious}
                      isSubmit
                      onNext={() => {
                        formikProps.setTouched({
                          ...formikProps.touched,
                          [OVERALL]: true,
                          [FieldNames.SLI]: true,
                          [FieldNames.RISK_CATEGORY]: true,
                          [FieldNames.HIGHER_BASELINE_DEVIATION]: true,
                          [FieldNames.LOWER_BASELINE_DEVIATION]: true,
                          [FieldNames.SERVICE_INSTANCE_FIELD]: true
                        } as any)

                        formikProps.submitForm()

                        const errors = validate(formikProps.values, updatedData, getString)
                        if (!isEmpty(errors)) {
                          formikProps.setErrors({ ...errors })
                          return
                        }

                        if (selectedMetric) {
                          updatedData.set(selectedMetric, { ...formikProps.values })
                        }
                        const filteredData = new Map()
                        for (const metric of updatedData) {
                          const [metricName, metricInfo] = metric
                          if (isEmpty(ensureFieldsAreFilled(metricInfo, getString, new Map(updatedData)))) {
                            filteredData.set(metricName, metricInfo)
                          }
                        }

                        onSubmit(
                          data,
                          transformGCOMetricSetupSourceToGCOHealthSource({
                            ...transformedData,
                            ...metricThresholds,
                            metricDefinition: filteredData
                          })
                        )
                      }}
                    />
                  </>
                }
                leftPanelContent={
                  <MetricDashboardWidgetNav
                    dashboards={isDashdoardEmpty ? [] : dashboard}
                    dashboardWidgetMapper={mapstackdriverDashboardDetailToMetricWidget}
                    dashboardDetailsRequest={stackDriverDashBoardRequest}
                    addManualQueryTitle={'cv.monitoringSources.gco.manualInputQueryModal.modalTitle'}
                    connectorIdentifier={connectorIdentifier}
                    manuallyInputQueries={getManuallyCreatedQueries(updatedData)}
                    showSpinnerOnLoad={!selectedMetric}
                    onDeleteManualMetric={metricIdToBeDeleted =>
                      metricIdToBeDeleted && handleOnManualMetricDelete(metricIdToBeDeleted)
                    }
                    onSelectMetric={(id, metricName, queryValue, widget, dashboardId, dashboardTitle) => {
                      onSelectNavItem({
                        id,
                        metricName,
                        query: queryValue,
                        widget,
                        dashboardId,
                        dashboardTitle,
                        updatedData,
                        setUpdatedData,
                        selectedMetric,
                        formikProps
                      })
                      setSelectedMetric(metricName)
                      setShouldShowChart(false)
                      setError(undefined)
                      setSampleData(transformSampleDataIntoHighchartOptions([]))

                      formikProps.resetForm()
                    }}
                  />
                }
              />
              {!isEmpty(groupedCreatedMetrics) && (
                <MetricThresholdProvider
                  formikValues={formikProps.values}
                  setThresholdState={setMetricThresholds}
                  groupedCreatedMetrics={groupedCreatedMetrics}
                />
              )}
              <Container className={css.spaceProvider} />
            </>
          </FormikForm>
        )
      }}
    </Formik>
  )
}
