/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash-es'
import { Page, Tabs, Container, Layout, Button, ButtonVariation, Heading, useToaster } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  ServiceLevelIndicatorDTO,
  TimeGraphResponse,
  useGetAllMonitoredServicesWithTimeSeriesHealthSources,
  useGetSliGraph
} from 'services/cv'
import RbacButton from '@rbac/components/Button/Button'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SLOName from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOName/SLOName'
import SLOTargetAndBudgetPolicy from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import {
  isFormDataValid,
  handleTabChange,
  getMonitoredServiceOptions
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import { TabsOrder } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import {
  CreateSLOTabs,
  NavButtonsProps,
  CreateSLOFormProps
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import SLI from './components/SLI/SLI'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const CreateSLOForm: React.FC<CreateSLOFormProps> = ({
  formikProps,
  loading,
  createOrUpdateLoading,
  error,
  retryOnError,
  handleRedirect
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const [selectedTabId, setSelectedTabId] = useState<CreateSLOTabs>(CreateSLOTabs.NAME)
  const [sliGraphData, setSliGraphData] = useState<TimeGraphResponse>()

  const {
    mutate,
    loading: sliGraphLoading,
    error: sliGraphError
  } = useGetSliGraph({
    monitoredServiceIdentifier: '',
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

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

  useEffect(() => {
    if (monitoredServicesDataError) {
      showError(getErrorMessage(monitoredServicesDataError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServicesDataError])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServiceOptions(monitoredServicesData?.data),
    [monitoredServicesData]
  )

  const fetchSliGraphData = async (
    serviceLevelIndicator: ServiceLevelIndicatorDTO,
    monitoredServiceIdentifier?: string
  ): Promise<void> => {
    try {
      const sliGraphResponseData = await mutate(serviceLevelIndicator, {
        pathParams: {
          monitoredServiceIdentifier: monitoredServiceIdentifier as string
        }
      })

      setSliGraphData(sliGraphResponseData.resource)
    } catch (e) {
      //
    }
  }

  const debounceFetchSliGraphData = useCallback(debounce(fetchSliGraphData, 2000), [])

  const NavButtons: React.FC<NavButtonsProps> = ({ loading: saving }) => (
    <Layout.Horizontal spacing="small" padding={{ top: 'xxlarge' }}>
      <Button
        icon="chevron-left"
        text={getString('back')}
        variation={ButtonVariation.SECONDARY}
        disabled={saving}
        onClick={() => {
          const tabIndex = TabsOrder.indexOf(selectedTabId)
          if (tabIndex) {
            setSelectedTabId(TabsOrder[tabIndex - 1])
            return
          }
          handleRedirect()
        }}
      />
      <RbacButton
        rightIcon="chevron-right"
        text={selectedTabId === CreateSLOTabs.SLO_TARGET_BUDGET_POLICY ? getString('save') : getString('continue')}
        variation={ButtonVariation.PRIMARY}
        loading={saving}
        onClick={() => {
          if (selectedTabId === CreateSLOTabs.SLO_TARGET_BUDGET_POLICY) {
            formikProps.submitForm()
          } else if (isFormDataValid(formikProps, selectedTabId)) {
            setSelectedTabId(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
          }
        }}
        permission={{
          permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
          resource: {
            resourceType: ResourceType.MONITOREDSERVICE,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <Container className={css.createSloTabsContainer}>
      <Tabs
        id="createSLOTabs"
        selectedTabId={selectedTabId}
        onChange={nextTabId => handleTabChange(nextTabId, formikProps, setSelectedTabId)}
        tabList={[
          {
            id: CreateSLOTabs.NAME,
            title: getString('name'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'small' }}>
                  {getString('cv.slos.sloDefinition')}
                </Heading>
                <SLOName
                  formikProps={formikProps}
                  identifier={identifier}
                  monitoredServicesOptions={monitoredServicesOptions}
                  monitoredServicesLoading={monitoredServicesLoading}
                  fetchingMonitoredServices={fetchingMonitoredServices}
                >
                  <NavButtons />
                </SLOName>
              </Page.Body>
            )
          },
          {
            id: CreateSLOTabs.SLI,
            title: getString('cv.slos.sli'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <SLI
                  formikProps={formikProps}
                  sliGraphData={sliGraphData}
                  loading={sliGraphLoading}
                  error={getErrorMessage(sliGraphError)}
                  retryOnError={fetchSliGraphData}
                  debounceFetchSliGraphData={debounceFetchSliGraphData}
                >
                  <NavButtons />
                </SLI>
              </Page.Body>
            )
          },
          {
            id: CreateSLOTabs.SLO_TARGET_BUDGET_POLICY,
            title: getString('cv.slos.sloTargetAndBudgetPolicy'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <SLOTargetAndBudgetPolicy
                  formikProps={formikProps}
                  sliGraphData={sliGraphData}
                  loading={sliGraphLoading}
                  error={getErrorMessage(sliGraphError)}
                  retryOnError={fetchSliGraphData}
                >
                  <NavButtons loading={createOrUpdateLoading} />
                </SLOTargetAndBudgetPolicy>
              </Page.Body>
            )
          }
        ]}
      />
    </Container>
  )
}

export default CreateSLOForm
