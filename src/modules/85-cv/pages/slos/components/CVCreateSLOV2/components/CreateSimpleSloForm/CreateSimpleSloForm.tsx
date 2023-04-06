/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { isEqual, debounce } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, Layout, Page, useToaster, Text, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import {
  NotificationRuleResponse,
  ServiceLevelIndicatorDTO,
  useGetAllMonitoredServicesWithTimeSeriesHealthSources,
  useGetMetricOnboardingGraph,
  useGetNotificationRuleData,
  useGetSliGraph
} from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Stepper } from '@common/components/Stepper/Stepper'
import SLOName from '@cv/pages/slos/common/SLOName/SLOName'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import SLI from '@cv/pages/slos/common/SLI/SLI'
import SLOTargetAndBudgetPolicy from '@cv/pages/slos/common/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import { CreatePreview } from '@cv/pages/slos/common/CreatePreview/CreatePreview'
import {
  convertSLOFormDataToServiceLevelIndicatorDTO,
  getMonitoredServiceOptions
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import SLOTargetNotifications from '@cv/pages/slos/common/SLOTargetAndBudgetPolicy/components/SLOTargetNotificationsContainer/SLOTargetNotifications'
import { ConfigureSLIProvider } from '@cv/pages/slos/common/SLI/SLIContext'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import {
  createMetricGraphPayload,
  getErrorMessageByTabId,
  getSLIDerivedProps,
  isFormDataValid
} from './CreateSimpleSloForm.utils'
import useCreateCompositeSloWarningModal from '../CreateCompositeSloForm/useCreateCompositeSloWarningModal'
import { CreateSimpleSLOSteps } from './CreateSimpleSloForm.types'
import { CompositeSLOContext } from '../CreateCompositeSloForm/CompositeSLOContext'
import css from './CreateSimpleSloForm.module.scss'

export interface CreateSimpleSLOFormInterface {
  loading: boolean
  error: any
  retryOnError: () => void
  handleRedirect: () => void
  runValidationOnMount?: boolean
  loadingSaveButton: boolean
}

export default function CreateSimpleSLOForm({
  loading,
  error,
  retryOnError,
  handleRedirect,
  loadingSaveButton,
  runValidationOnMount
}: CreateSimpleSLOFormInterface): JSX.Element {
  const formikProps = useFormikContext<SLOV2Form>()
  const { getString } = useStrings()
  const [notificationPage, setNotificationPage] = useState(0)
  const [validateAllSteps, setValidateAllSteps] = useState<boolean | undefined>(runValidationOnMount)
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const compositeSloPayloadRef = useRef<SLOV2Form | null>()
  const prevStepDataRef = useRef<SLOV2Form | null>()
  const [notificationsInTable, setNotificationsInTable] = useState<NotificationRuleResponse[]>([])
  const { SRM_ENABLE_REQUEST_SLO: enableRequestSLO } = useFeatureFlags()

  const [openSaveCancelModal] = useCreateCompositeSloWarningModal({
    handleRedirect,
    onChange: formikProps.setValues,
    prevStepData: prevStepDataRef
  })

  const { showError } = useToaster()

  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    refetch: fetchingMonitoredServices,
    error: monitoredServicesDataError
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const {
    data: notificationData,
    loading: notificationLoading,
    error: notificationError,
    refetch: getNotifications
  } = useGetNotificationRuleData({
    queryParams: {
      accountId,
      orgIdentifier,

      projectIdentifier,
      pageNumber: notificationPage,
      notificationRuleIdentifiers: formikProps.values.notificationRuleRefs?.map(item => item.notificationRuleRef),
      pageSize: 10
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  useEffect(() => {
    if (formikProps.values.notificationRuleRefs?.length) {
      getNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikProps.values.notificationRuleRefs?.length])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServiceOptions(monitoredServicesData?.data),
    [monitoredServicesData]
  )

  useEffect(() => {
    compositeSloPayloadRef.current = formikProps.values
    prevStepDataRef.current = formikProps.values
  }, [])

  useEffect(() => {
    if (monitoredServicesDataError) {
      showError(getErrorMessage(monitoredServicesDataError))
    }
  }, [monitoredServicesDataError])

  const onStepChange = (): void => {
    prevStepDataRef.current = formikProps.values
  }

  const onCancel = (): void => {
    if (isEqual(compositeSloPayloadRef.current, formikProps.values)) {
      handleRedirect()
    } else {
      openSaveCancelModal()
    }
  }

  const isStepValid = useCallback(
    (stepId: string) => isFormDataValid(formikProps, stepId as CreateSimpleSLOSteps),
    [formikProps.values, formikProps.errors]
  )

  const {
    data: sliGraphData,
    refetch: fetchSliGraphData,
    loading: sliGraphLoading,
    error: sliGraphError
  } = useMutateAsGet(useGetSliGraph, { lazy: true })

  const {
    data: sliMetricGraphData,
    refetch: fetchSliMetricGraphData,
    loading: sliMetricGraphLoading,
    error: sliMetricGraphError
  } = useMutateAsGet(useGetMetricOnboardingGraph, { lazy: true })

  const retryfetchSliGraphData = (
    serviceLevelIndicator: ServiceLevelIndicatorDTO,
    monitoredServiceIdentifier?: string
  ): void => {
    fetchSliGraphData({
      body: serviceLevelIndicator,
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier
      },
      pathParams: { monitoredServiceIdentifier }
    })
  }

  const debounceFetchSliGraphData = useCallback(debounce(fetchSliGraphData, 2000), [])
  const debounceFetchSliMetricGraphData = useCallback(debounce(fetchSliMetricGraphData, 2000), [])

  const notificationsTableData = useMemo(
    () =>
      formikProps.values.notificationRuleRefs?.length
        ? notificationData?.data?.content?.map(notification => {
            notification.enabled = formikProps.values.notificationRuleRefs?.find(
              item => item.notificationRuleRef === notification.notificationRule.identifier
            )?.enabled
            return notification
          })
        : [],
    [formikProps.values.notificationRuleRefs, notificationData?.data?.content]
  )

  const serviceLevelIndicator = convertSLOFormDataToServiceLevelIndicatorDTO(formikProps.values)
  const { eventType, healthSourceRef, validRequestMetric, goodRequestMetric } = formikProps.values
  const { shouldFetchSliGraph, valuesToDetermineReload, showSLIMetricChart, isWindow, isRatioBased, sliAreaGraphData } =
    getSLIDerivedProps({
      sliGraphData,
      value: formikProps.values,
      enableRequestSLO
    })

  useEffect(() => {
    if (shouldFetchSliGraph) {
      debounceFetchSliGraphData({
        body: serviceLevelIndicator,
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier
        },
        pathParams: {
          monitoredServiceIdentifier: formikProps.values.monitoredServiceRef as string
        }
      })
    }
  }, [shouldFetchSliGraph, valuesToDetermineReload.join('')])

  const getSliMetricGraphData = (): void => {
    if (healthSourceRef && showSLIMetricChart) {
      const metricPayload = createMetricGraphPayload({
        isWindow,
        eventType,
        isRatioBased,
        accountId,
        orgIdentifier,
        projectIdentifier,
        healthSourceRef,
        validRequestMetric,
        goodRequestMetric,
        monitoredServiceIdentifier: formikProps.values.monitoredServiceRef || ''
      })
      debounceFetchSliMetricGraphData(metricPayload)
    }
  }

  useEffect(() => {
    getSliMetricGraphData()
  }, [
    showSLIMetricChart,
    healthSourceRef,
    eventType,
    validRequestMetric,
    goodRequestMetric,
    isRatioBased,
    isWindow,
    formikProps.values.monitoredServiceRef
  ])

  return (
    <>
      <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()}>
        {!identifier && (
          <Container
            margin={{ top: 'xlarge', bottom: 'small', left: 'xlarge', right: 'xlarge' }}
            padding="small"
            background={Color.PRIMARY_1}
          >
            <Layout.Horizontal spacing={'small'}>
              <Icon name="code-info" />
              <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('cv.sloCreateInfo')}</Text>
            </Layout.Horizontal>
          </Container>
        )}
        {!loading && (
          <>
            <Stepper
              id="createSLOTabs"
              isStepValid={isStepValid}
              runValidationOnMount={validateAllSteps}
              onStepChange={onStepChange}
              stepList={[
                {
                  id: CreateSimpleSLOSteps.Define_SLO_Identification,
                  title: getString('cv.SimpleSLO.DefineSLO'),
                  subTitle: getString('cv.SimpleSLO.DefineSLOSubtitle'),
                  panel: (
                    <SLOName<SLOV2Form>
                      isMultiSelect
                      identifier={identifier}
                      formikProps={formikProps}
                      monitoredServicesOptions={
                        monitoredServicesLoading
                          ? [{ label: getString('loading'), value: getString('loading') }]
                          : monitoredServicesOptions
                      }
                      fetchingMonitoredServices={fetchingMonitoredServices}
                    />
                  ),
                  errorMessage: getErrorMessageByTabId(formikProps, CreateSimpleSLOSteps.Define_SLO_Identification),
                  preview: (
                    <CreatePreview id={CreateSimpleSLOSteps.Define_SLO_Identification} data={formikProps.values} />
                  )
                },
                {
                  id: CreateSimpleSLOSteps.Configure_Service_Level_Indicatiors,
                  title: getString('cv.slos.configureSLI'),
                  subTitle: getString('cv.slos.configureSLISubtitle'),
                  panel: (
                    <ConfigureSLIProvider
                      showSLIMetricChart={showSLIMetricChart}
                      isRatioBased={isRatioBased}
                      isWindowBased={isWindow}
                    >
                      <SLI
                        formikProps={formikProps}
                        sliGraphData={sliGraphData?.resource}
                        loading={sliGraphLoading}
                        error={getErrorMessage(sliGraphError)}
                        retryOnError={retryfetchSliGraphData}
                        metricChart={{
                          loading: sliMetricGraphLoading,
                          retryOnError: getSliMetricGraphData,
                          error: getErrorMessage(sliMetricGraphError),
                          data: sliMetricGraphData?.resource
                        }}
                        showMetricChart
                      />
                    </ConfigureSLIProvider>
                  ),
                  errorMessage: getErrorMessageByTabId(
                    formikProps,
                    CreateSimpleSLOSteps.Configure_Service_Level_Indicatiors
                  ),
                  preview: (
                    <CreatePreview
                      id={CreateSimpleSLOSteps.Configure_Service_Level_Indicatiors}
                      data={formikProps.values}
                    />
                  )
                },
                {
                  id: CreateSimpleSLOSteps.Set_SLO,
                  title: 'Set your SLO',
                  subTitle: getString('cv.slos.setSLOSubtitle'),
                  panel: (
                    <ConfigureSLIProvider
                      showSLIMetricChart={showSLIMetricChart}
                      isRatioBased={isRatioBased}
                      isWindowBased={isWindow}
                    >
                      <SLOTargetAndBudgetPolicy
                        formikProps={formikProps}
                        loading={sliGraphLoading}
                        error={getErrorMessage(sliGraphError)}
                        retryOnError={retryfetchSliGraphData}
                        sliGraphData={sliAreaGraphData}
                        showMetricChart={false}
                      />
                    </ConfigureSLIProvider>
                  ),
                  errorMessage: getErrorMessageByTabId(formikProps, CreateSimpleSLOSteps.Set_SLO),
                  preview: <CreatePreview id={CreateSimpleSLOSteps.Set_SLO} data={formikProps.values} />
                },
                {
                  id: CreateSimpleSLOSteps.Error_Budget_Policy,
                  title: getString('cv.CompositeSLO.ErrorBudgetPolicy'),
                  isOptional: true,
                  subTitle: getString('cv.slos.errorBudgetPolicySubtitle'),
                  panel: (
                    <CompositeSLOContext.Provider value={{ renderInsideCompositeSLO: true }}>
                      <SLOTargetNotifications
                        setFieldValue={formikProps.setFieldValue}
                        initialNotificationsTableData={notificationsTableData || []}
                        setPage={setNotificationPage}
                        page={notificationPage}
                        loading={notificationLoading}
                        error={notificationError}
                        getNotifications={getNotifications}
                        notificationsInTable={notificationsInTable}
                        setNotificationsInTable={setNotificationsInTable}
                      />
                    </CompositeSLOContext.Provider>
                  ),
                  errorMessage: getErrorMessageByTabId(formikProps, CreateSimpleSLOSteps.Error_Budget_Policy),
                  preview: <CreatePreview id={CreateSimpleSLOSteps.Error_Budget_Policy} data={formikProps.values} />
                }
              ]}
            />
            <Page.Header
              className={css.footer}
              title={
                <Layout.Horizontal spacing="medium">
                  <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={onCancel} />
                  <Button
                    text={getString('save')}
                    loading={loadingSaveButton}
                    variation={ButtonVariation.PRIMARY}
                    onClick={() => {
                      setValidateAllSteps(true)
                      formikProps.submitForm()
                    }}
                  />
                </Layout.Horizontal>
              }
            />
          </>
        )}
      </Page.Body>
    </>
  )
}
