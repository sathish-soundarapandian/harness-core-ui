import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ValidationStatus from '@cv/pages/components/ValidationStatus/ValidationStatus'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import {
  Color,
  Container,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  useToaster
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import {
  AppdynamicsValidationResponse,
  TimeSeriesMetricPackDTO,
  useGetAppDynamicsApplications,
  useGetAppDynamicsTiers
} from 'services/cv'
import type {
  AppDynamicsData,
  AppDynamicsFomikFormInterface,
  NonCustomFeildsInterface
} from '../../../AppDynamics/AppDHealthSource.types'
import {
  getAllowedTypes,
  setAppAndTierAsInputIfConnectorIsInput,
  setCustomFieldAndValidation,
  shouldMakeTierCall,
  showValidation
} from '../../../AppDynamics/AppDHealthSource.utils'
import AppDApplications from '../../../AppDynamics/Components/AppDApplications/AppDApplications'
import AppDynamicsTier from '../../../AppDynamics/Components/AppDynamicsTier/AppDynamicsTier'
import { HealthSoureSupportedConnectorTypes } from '../../../MonitoredServiceConnector.constants'
import { createMetricDataFormik, getOptions } from '../../../MonitoredServiceConnector.utils'

interface AppTierProps {
  connectorIdentifier: string
  healthSourceData: AppDynamicsData
  isTemplate?: boolean
  expressions?: string[]
  appDTier: string
  appdApplication: string
  nonCustomFeilds: NonCustomFeildsInterface
  setNonCustomFeilds: Dispatch<SetStateAction<NonCustomFeildsInterface>>
  formik: FormikProps<AppDynamicsFomikFormInterface>
  appDValidation: {
    status: string
    result: AppdynamicsValidationResponse[] | []
  }
  setHealthSourceValidation: Dispatch<SetStateAction<{ status: string; result: AppdynamicsValidationResponse[] | [] }>>
  onValidate: (appName: string, tierName: string, metricObject: { [key: string]: any }) => Promise<void>
  setValidationResultData: Dispatch<SetStateAction<AppdynamicsValidationResponse[] | undefined>>
  selectedMetricPacks: TimeSeriesMetricPackDTO[]
  appTierConfig: any
}

export default function AppTier(props: AppTierProps): JSX.Element {
  const {
    connectorIdentifier,
    healthSourceData,
    isTemplate,
    expressions,
    appDTier,
    appdApplication,
    nonCustomFeilds,
    setNonCustomFeilds,
    formik,
    setHealthSourceValidation,
    appDValidation,
    onValidate,
    setValidationResultData,
    selectedMetricPacks,
    appTierConfig
  } = props
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [tierMultiType, setTierMultiType] = useState(() => getMultiTypeFromValue(appDTier))
  const [appdMultiType, setAppdMultiType] = useState(() => getMultiTypeFromValue(appdApplication))
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED
  const {
    fields: { application: applicationConfig, tier: tierConfig }
  } = appTierConfig || {}

  const {
    data: applicationsData,
    loading: applicationLoading,
    error: applicationError,
    refetch: refetchAppDApplication
  } = useGetAppDynamicsApplications({ lazy: true })

  const {
    data: tierData,
    loading: tierLoading,
    refetch: refetchTier,
    error: tierError
  } = useGetAppDynamicsTiers({
    lazy: true
  })

  useEffect(() => {
    if (!healthSourceData.isEdit) {
      setAppAndTierAsInputIfConnectorIsInput(isConnectorRuntimeOrExpression, nonCustomFeilds, setNonCustomFeilds)
    }
  }, [])

  useEffect(() => {
    if (
      healthSourceData.isEdit &&
      selectedMetricPacks.length &&
      appDValidation.status !== StatusOfValidation.IN_PROGRESS
    ) {
      onValidate(
        healthSourceData?.applicationName,
        healthSourceData?.tierName,
        createMetricDataFormik(healthSourceData?.metricPacks)
      )
    }
  }, [selectedMetricPacks, tierLoading, healthSourceData.isEdit])

  useEffect(() => {
    if (!isConnectorRuntimeOrExpression) {
      refetchAppDApplication({
        queryParams: {
          accountId,
          connectorIdentifier,
          orgIdentifier,
          projectIdentifier,
          offset: 0,
          pageSize: 10000,
          filter: ''
        }
      })
    }
  }, [accountId, orgIdentifier, projectIdentifier, connectorIdentifier, refetchAppDApplication])

  useEffect(() => {
    if (shouldMakeTierCall(healthSourceData?.applicationName)) {
      refetchTier({
        queryParams: {
          appName: healthSourceData?.applicationName,
          accountId,
          connectorIdentifier,
          orgIdentifier,
          projectIdentifier,
          offset: 0,
          pageSize: 10000,
          filter: ''
        }
      })
    }
  }, [healthSourceData?.applicationName])

  useEffect(() => {
    clear()
    tierError && showError(getErrorMessage(tierError))
    applicationError && showError(getErrorMessage(applicationError))
  }, [applicationError, tierError])

  const applicationOptions: SelectOption[] = useMemo(
    () =>
      getOptions(
        applicationLoading,
        applicationsData?.data?.content,
        HealthSoureSupportedConnectorTypes.APP_DYNAMICS,
        getString
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicationLoading]
  )

  const tierOptions: SelectOption[] = useMemo(
    () => getOptions(tierLoading, tierData?.data?.content, HealthSoureSupportedConnectorTypes.APP_DYNAMICS, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tierLoading]
  )

  const setAppDTierCustomField = (tierValue: string): void => {
    setNonCustomFeilds({
      ...nonCustomFeilds,
      appDTier: tierValue
    })
  }

  return (
    <CardWithOuterTitle title={getString('cv.healthSource.connectors.AppDynamics.applicationsAndTiers')}>
      <Layout.Horizontal spacing={'large'} flex={{ alignItems: 'center', justifyContent: 'start' }}>
        {applicationConfig ? (
          <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
            <AppDApplications
              allowedTypes={getAllowedTypes(isConnectorRuntimeOrExpression)}
              applicationOptions={applicationOptions}
              applicationLoading={applicationLoading}
              applicationError={formik.touched.appdApplication ? formik?.errors?.appdApplication : ''}
              connectorIdentifier={connectorIdentifier}
              formikAppDynamicsValue={formik?.values?.appdApplication}
              refetchTier={refetchTier}
              appdMultiType={appdMultiType}
              setAppdMultiType={setAppdMultiType}
              setCustomFieldAndValidation={(value: string, validate = false) =>
                setCustomFieldAndValidation(
                  value,
                  setNonCustomFeilds,
                  nonCustomFeilds,
                  setHealthSourceValidation,
                  validate
                )
              }
              isTemplate={isTemplate}
              expressions={expressions}
            />
          </Container>
        ) : null}
        {!!formik.values.appdApplication && tierConfig && (
          <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
            <AppDynamicsTier
              isTemplate={isTemplate}
              expressions={expressions}
              tierOptions={appdMultiType !== MultiTypeInputType.FIXED ? [] : tierOptions}
              tierLoading={tierLoading}
              formikValues={formik?.values}
              onValidate={onValidate}
              appdMultiType={appdMultiType}
              tierError={formik.touched.appDTier ? formik?.errors?.appDTier : ''}
              setAppDTierCustomField={setAppDTierCustomField}
              tierMultiType={tierMultiType}
              setTierMultiType={setTierMultiType}
            />
          </Container>
        )}
        <Container width={'300px'} color={Color.BLACK}>
          {showValidation(formik.values?.appDTier, formik?.values.appdApplication) && (
            <ValidationStatus
              validationStatus={appDValidation?.status as StatusOfValidation}
              onClick={appDValidation.result?.length ? () => setValidationResultData(appDValidation.result) : undefined}
              onRetry={() =>
                onValidate(formik.values.appdApplication, formik.values.appDTier, formik.values.metricData)
              }
            />
          )}
        </Container>
      </Layout.Horizontal>
    </CardWithOuterTitle>
  )
}
