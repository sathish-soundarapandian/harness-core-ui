import React, { useState, useEffect } from 'react'
import type { SelectOption } from '@wings-software/uikit'
import { Container } from '@wings-software/uikit'
import type { DSConfig } from '@wings-software/swagger-ts/definitions'
import xhr from '@wings-software/xhr-async'
import { cloneDeep } from 'lodash-es'
import { CVNextGenCVConfigService } from 'modules/cv/services'
import { RouteVerificationTypeToVerificationType } from 'modules/cv/constants'
import { Page } from 'modules/common/exports'
import { routeParams } from 'framework/exports'
import useOnBoardingPageDataHook from 'modules/cv/hooks/OnBoardingPageDataHook/OnBoardingPageDataHook'
import {
  useGetServiceListForProject,
  useGetEnvironmentListForProject,
  EnvironmentResponseDTO,
  ServiceResponseDTO
} from 'services/cd-ng'
import SplunkMainSetupView from '../Splunk/SplunkMainSetupView'
import AppDynamicsMainSetupView from '../AppDynamics/AppDynamicsMainSetupView'
import * as SplunkMainSetupViewUtils from '../Splunk/SplunkMainSetupViewUtils'
import * as AppDynamicsOnboardingUtils from '../AppDynamics/AppDynamicsOnboardingUtils'
import i18n from './BaseOnBoardingSetupPage.i18n'
import css from './BaseOnBoardingSetupPage.module.scss'

type PageContextData = {
  isEdit?: boolean
  dataSourceId: string
  products: string[]
  selectedEntities?: SelectOption[]
  savedConfigs?: DSConfig[]
}

const LoadingDropDownOption = [{ value: '', label: i18n.loading }]

function getDefaultCVConfig(
  verificationProvider: DSConfig['type'],
  dataSourceId: string,
  selectedEntities: SelectOption[],
  accId: string,
  productName: string,
  projectId: string
): DSConfig[] {
  switch (verificationProvider) {
    case 'APP_DYNAMICS':
      return selectedEntities.map(selectedEntity => {
        return AppDynamicsOnboardingUtils.createDefaultConfigObjectBasedOnSelectedApps(
          selectedEntity,
          dataSourceId,
          accId,
          productName,
          projectId
        )
      })
    case 'SPLUNK':
      return SplunkMainSetupViewUtils.createDefaultConfigObjectBasedOnSelectedQueries(
        selectedEntities,
        dataSourceId,
        accId,
        productName,
        projectId
      )
    default:
      return []
  }
}

function transformIncomingDSConfigs(savedConfig: DSConfig[], verificationProvider: DSConfig['type']): DSConfig[] {
  switch (verificationProvider) {
    case 'APP_DYNAMICS':
      return AppDynamicsOnboardingUtils.transformGetConfigs(
        (savedConfig as unknown) as AppDynamicsOnboardingUtils.AppDynamicsDSConfig[]
      )
    case 'SPLUNK':
      return SplunkMainSetupViewUtils.transformSavedQueries(savedConfig)
    default:
      return []
  }
}

export default function OnBoardingSetupPage(): JSX.Element {
  const {
    params: { accountId, dataSourceType, projectIdentifier: routeProjectId, orgId: routeOrgId },
    query: { dataSourceId: routeDataSourceId = '' }
  } = routeParams()
  const { pageData, dbInstance, isInitializingDB } = useOnBoardingPageDataHook<PageContextData>(
    routeDataSourceId as string
  )
  const projectId = routeProjectId as string
  const orgId = routeOrgId as string
  const [configsToRender, setConfigs] = useState<DSConfig[]>([])
  const [serverError, setServerError] = useState<string | undefined>(undefined)
  const [isLoadingConfigs, setLoadingConfigs] = useState<boolean>(true)
  const verificationType = RouteVerificationTypeToVerificationType[(dataSourceType as DSConfig['type']) || '']
  const { data: serviceOptions = LoadingDropDownOption, refetch: refetchServices } = useGetServiceListForProject({
    queryParams: { accountId, projectIdentifier: projectId, orgIdentifier: orgId },
    lazy: true,
    resolve: serviceList =>
      serviceList?.data?.content?.map(({ identifier }: ServiceResponseDTO) => ({
        label: identifier,
        value: identifier
      }))
  })
  const {
    data: environmentOptions = LoadingDropDownOption,
    refetch: refetchEnvironments
  } = useGetEnvironmentListForProject({
    queryParams: { accountId, projectIdentifier: projectId, orgIdentifier: orgId },
    lazy: true,
    resolve: envList =>
      envList?.data.content?.map(({ identifier }: EnvironmentResponseDTO) => ({
        label: identifier,
        value: identifier
      })) || []
  })

  // fetch saved data or set selected data from the previous page
  useEffect(() => {
    if (!pageData || isInitializingDB) {
      return
    }
    const {
      dataSourceId = routeDataSourceId as string,
      selectedEntities = [],
      isEdit = false,
      products = [],
      savedConfigs
    } = pageData
    if (savedConfigs) {
      setConfigs(cloneDeep(savedConfigs))
      setLoadingConfigs(false)
    } else if (!isEdit) {
      setLoadingConfigs(false)
      setConfigs(
        getDefaultCVConfig(verificationType, dataSourceId, selectedEntities, accountId, products[0], projectId)
      )
    } else if (isEdit) {
      CVNextGenCVConfigService.fetchConfigs({
        accountId,
        dataSourceConnectorId: dataSourceId,
        productName: products[0],
        orgId,
        projectId
      }).then(({ status, error, response }) => {
        if (status === xhr.ABORTED) {
          return
        } else if (error?.message) {
          setLoadingConfigs(false)
          setServerError(error.message)
        } else if (response?.resource) {
          setLoadingConfigs(false)
          const configs = response.resource || []
          setConfigs(transformIncomingDSConfigs(configs, verificationType))
        }
      })
    }
  }, [pageData, verificationType, accountId, routeDataSourceId, isInitializingDB, orgId, projectId])

  useEffect(() => {
    if (accountId && orgId && projectId) {
      const queryParams = { accountId, projectIdentifier: projectId, orgIdentifier: orgId }
      refetchServices({ queryParams })
      refetchEnvironments({ queryParams })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, orgId, projectId])
  return (
    <Page.Body loading={isLoadingConfigs} error={serverError}>
      <Container className={css.main}>
        {!isLoadingConfigs && pageData && verificationType === 'APP_DYNAMICS' && (
          <AppDynamicsMainSetupView
            serviceOptions={(serviceOptions as SelectOption[]) || LoadingDropDownOption}
            envOptions={(environmentOptions as SelectOption[]) || LoadingDropDownOption}
            configs={configsToRender as AppDynamicsOnboardingUtils.DSConfigTableData[]}
            locationContext={pageData}
            indexedDB={dbInstance}
          />
        )}
        {!isLoadingConfigs && pageData && verificationType === 'SPLUNK' && (
          <SplunkMainSetupView
            serviceOptions={(serviceOptions as SelectOption[]) || LoadingDropDownOption}
            envOptions={(environmentOptions as SelectOption[]) || LoadingDropDownOption}
            configs={configsToRender}
            locationContext={pageData}
            indexedDB={dbInstance}
          />
        )}
      </Container>
    </Page.Body>
  )
}
