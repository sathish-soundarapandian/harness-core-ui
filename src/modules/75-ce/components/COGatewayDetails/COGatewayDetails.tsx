/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, get, isBoolean } from 'lodash-es'
import { Layout, Tabs, Tab, Button, Container, Icon } from '@harness/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useToaster } from '@common/exports'
import COGatewayConfig from '@ce/components/COGatewayConfig/COGatewayConfig'
import COGatewayAccess from '@ce/components/COGatewayAccess/COGatewayAccess'
import COGatewayReview from '@ce/components/COGatewayReview/COGatewayReview'
import type { FixedScheduleClient, GatewayDetails } from '@ce/components/COCreateGateway/models'
import routes from '@common/RouteDefinitions'
import { Utils } from '@ce/common/Utils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import {
  useSaveService,
  Service,
  useGetServices,
  useCreateStaticSchedules,
  useDeleteStaticSchedule,
  useToggleRuleMode,
  useFetchRules
} from 'services/lw'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { ASRuleTabs } from '@ce/constants'
import { GatewayContextProvider } from '@ce/context/GatewayContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { ConfigTabTitle, ReviewTabTitle, SetupAccessTabTitle } from './TabTitles'
import { getServiceObjectFromgatewayDetails, isPrimaryBtnDisable, trackPrimaryBtnClick } from './helper'
import css from './COGatewayDetails.module.scss'

interface COGatewayDetailsProps {
  previousTab: () => void
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  activeTab?: ASRuleTabs
  isEditFlow: boolean
  originalRuleDetails?: Service
}

const TOTAL_ITEMS_PER_PAGE = 100

const COGatewayDetails: React.FC<COGatewayDetailsProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { trackEvent } = useTelemetry()
  const { currentUserInfo } = useAppStore()
  const dryRunModeEnabled = useFeatureFlag(FeatureFlag.CCM_AS_DRY_RUN)

  const [selectedTabId, setSelectedTabId] = useState<string>(defaultTo(props.activeTab, ASRuleTabs.CONFIGURATION))
  const [validConfig, setValidConfig] = useState<boolean>(false)
  const [validAccessSetup, setValidAccessSetup] = useState<boolean>(false)
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false)
  const [activeConfigStep, setActiveConfigStep] = useState<{ count?: number; tabId?: string } | null>(null)
  const [serverNames, setServerNames] = useState<string[]>([])
  const [dryRunRules, setDryRunRules] = useState<Service[]>([])

  const tabs = [ASRuleTabs.CONFIGURATION, ASRuleTabs.SETUP_ACCESS, ASRuleTabs.REVIEW]

  const { data: servicesData, error } = useGetServices({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })
  /* istanbul ignore else */
  if (error) {
    showError(getString('ce.co.autoStoppingRule.serviceFetchFailureMessage'), undefined, 'ce.svc.fetch.error')
  }

  const { mutate: fetchDryRunRules } = useFetchRules({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: saveGateway } = useSaveService({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: createStaticSchesules } = useCreateStaticSchedules({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId,
      cloud_account_id: props.gatewayDetails.cloudAccount.id
    }
  })

  const { mutate: deleteSchedule } = useDeleteStaticSchedule({
    account_id: accountId,
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: toggleMode } = useToggleRuleMode({
    account_id: accountId,
    rule_id: defaultTo(props.originalRuleDetails?.id, 0),
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    fetchDryRunRules({
      page: 1,
      limit: TOTAL_ITEMS_PER_PAGE,
      dry_run: true
    }).then(({ response }) => {
      setDryRunRules(defaultTo(get(response, 'records'), []))
    })
  }, [])

  /* istanbul ignore next */
  const saveStaticSchedules = async (ruleId: number) => {
    const schedules = defaultTo(
      props.gatewayDetails.schedules
        ?.filter(s => !s.isDeleted)
        ?.map(s =>
          Utils.convertScheduleClientToSchedule(s, {
            accountId,
            ruleId,
            userId: defaultTo(currentUserInfo.uuid, '')
          })
        ),
      []
    )
    for (const sch of schedules) {
      /* eslint-disable-next-line no-await-in-loop */
      await saveSchedule(sch)
    }
  }

  const saveSchedule = async (data: FixedScheduleClient) => {
    try {
      await createStaticSchesules({ schedule: data })
    } catch (e) {
      showError(
        getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.unsuccessfulDeletionMessage', {
          error: defaultTo(Utils.getASErrorMessage(e), e.data?.message)
        })
      )
    }
  }

  /* istanbul ignore next */
  const deleteStaticSchedules = async () => {
    const deletedSchedules = Utils.getConditionalResult(
      props.isEditFlow,
      defaultTo(
        props.gatewayDetails.schedules?.filter(s => s.isDeleted),
        []
      ),
      []
    )
    for (const delSch of deletedSchedules) {
      /* eslint-disable-next-line no-await-in-loop */
      await triggerDeleteSchedule(delSch)
    }
  }

  /* istanbul ignore next */
  const triggerDeleteSchedule = async (data: FixedScheduleClient) => {
    await deleteSchedule(data.id as number)
    showSuccess(
      getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.successfullyDeletedSchedule', {
        name: data.name
      })
    )
  }

  const handlePostRuleSave = async (response?: Service) => {
    if (response) {
      await deleteStaticSchedules()
      await saveStaticSchedules(response?.id as number)
      history.push(
        routes.toCECORules({
          accountId,
          params: response.opts?.dry_run === true ? 'mode=dryrun' : ''
        })
      )
    }
  }

  const handleModeToggle = async (currRuleDetails: Service) => {
    const currentDryrunStatus = get(currRuleDetails, 'opts.dry_run')
    const originalDryrunStatus = get(props, 'originalRuleDetails.opts.dry_run')
    if (
      dryRunModeEnabled &&
      props.isEditFlow &&
      isBoolean(currentDryrunStatus) &&
      currentDryrunStatus !== originalDryrunStatus
    ) {
      await toggleMode({
        id: defaultTo(props.originalRuleDetails?.id, 0)
      })
    }
  }

  const onSave = async (): Promise<void> => {
    try {
      setSaveInProgress(true)
      const gateway = getServiceObjectFromgatewayDetails(
        props.gatewayDetails,
        orgIdentifier,
        projectIdentifier,
        accountId,
        serverNames
      )
      handleModeToggle(gateway)
      const result = await saveGateway({ service: gateway, deps: props.gatewayDetails.deps, apply_now: false }) // eslint-disable-line
      // Rule creation is halted until the access point creation takes place successfully.
      // Informing the user regarding the same
      /* istanbul ignore next */
      if (props.gatewayDetails.accessPointData?.status === 'submitted') {
        showSuccess('Rule will take effect once the load balancer creation is successful!!')
      }
      await handlePostRuleSave(result.response)
    } catch (e) /* istanbul ignore next */ {
      setSaveInProgress(false)
      showError(Utils.getASErrorMessage(e) || e.data?.message || e.message, undefined, 'ce.savegw.error')
    }
  }
  const nextTab = (): void => {
    const tabIndex = tabs.findIndex(t => t == selectedTabId)
    if (tabIndex == tabs.length - 1) {
      trackEvent(USER_JOURNEY_EVENTS.SAVE_RULE_CLICK, {})
      onSave()
    } else if (tabIndex < tabs.length - 1) {
      setSelectedTabId(tabs[tabIndex + 1])
    }
  }
  /* istanbul ignore next */
  const previousTab = (): void => {
    const tabIndex = tabs.findIndex(t => t == selectedTabId)
    if (tabIndex > 0) {
      setSelectedTabId(tabs[tabIndex - 1])
    } else {
      props.previousTab()
    }
  }
  const selectTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(t => t == tabId)
    setSelectedTabId(tabs[tabIndex])
  }
  const getNextButtonText = (): string => {
    const tabIndex = tabs.findIndex(t => t == selectedTabId)
    return Utils.getConditionalResult(
      tabIndex === tabs.length - 1,
      getString('ce.co.autoStoppingRule.save'),
      getString('next')
    )
  }

  /* istanbul ignore next */
  const handleReviewDetailsEdit = (tabDetails: {
    id: string
    metaData?: { activeStepCount?: number; activeStepTabId?: string }
  }) => {
    setSelectedTabId(tabDetails.id)
    const activeStepDetails: { count?: number; tabId?: string } = {}
    activeStepDetails['count'] = get(tabDetails, 'metaData.activeStepCount')
    activeStepDetails['tabId'] = get(tabDetails, 'metaData.activeStepTabId')
    setActiveConfigStep(activeStepDetails)
  }

  const allServices = defaultTo(get(servicesData, 'response'), []).concat(dryRunRules)

  return (
    <Container className={css.gatewayDetailsContainer}>
      <Breadcrumbs
        className={css.breadCrumb}
        links={[
          {
            url: routes.toCECORules({ accountId, params: '' }),
            label: getString('ce.co.breadCrumb.rules')
          },
          {
            url: '',
            label: props.gatewayDetails.name
          }
        ]}
      />
      <GatewayContextProvider isEditFlow={props.isEditFlow}>
        <Container className={css.detailsTab}>
          <Tabs id="tabsId1" selectedTabId={selectedTabId} onChange={selectTab}>
            <Tab
              id="configuration"
              disabled
              title={<ConfigTabTitle isValidConfig={validConfig} />}
              panel={
                <COGatewayConfig
                  gatewayDetails={props.gatewayDetails}
                  setGatewayDetails={props.setGatewayDetails}
                  valid={validConfig}
                  setValidity={setValidConfig}
                  activeStepDetails={activeConfigStep}
                  allServices={allServices}
                />
              }
            />
            <Tab
              id="setupAccess"
              disabled
              title={<SetupAccessTabTitle isValidAccessSetup={validAccessSetup} />}
              panel={
                <COGatewayAccess
                  valid={validAccessSetup}
                  setValidity={setValidAccessSetup}
                  gatewayDetails={props.gatewayDetails}
                  setGatewayDetails={props.setGatewayDetails}
                  activeStepDetails={activeConfigStep}
                  allServices={allServices}
                  serverNames={serverNames}
                  setServerNames={setServerNames}
                />
              }
            />
            <Tab
              id="review"
              disabled
              title={<ReviewTabTitle isValidConfig={validConfig} isValidAccessSetup={validAccessSetup} />}
              panel={
                <COGatewayReview
                  gatewayDetails={props.gatewayDetails}
                  onEdit={handleReviewDetailsEdit}
                  allServices={allServices}
                  serverNames={serverNames}
                />
              }
            />
          </Tabs>
        </Container>
      </GatewayContextProvider>
      <Layout.Horizontal className={css.footer} spacing="medium">
        <Button
          text="Previous"
          icon="chevron-left"
          onClick={() => previousTab()}
          disabled={selectedTabId == tabs[0] && (props.gatewayDetails.id as number) != undefined}
        />
        <Button
          intent="primary"
          text={getNextButtonText()}
          icon="chevron-right"
          onClick={() => {
            trackPrimaryBtnClick(
              selectedTabId,
              {
                [ASRuleTabs.CONFIGURATION]: {},
                [ASRuleTabs.REVIEW]: {},
                [ASRuleTabs.SETUP_ACCESS]: props.gatewayDetails.opts.access_details
              },
              trackEvent
            )
            nextTab()
          }}
          disabled={isPrimaryBtnDisable(
            selectedTabId,
            { config: validConfig, setupAccess: validAccessSetup },
            saveInProgress
          )}
          loading={saveInProgress}
        />
        {saveInProgress ? <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} /> : null}
      </Layout.Horizontal>
    </Container>
  )
}

export default COGatewayDetails
