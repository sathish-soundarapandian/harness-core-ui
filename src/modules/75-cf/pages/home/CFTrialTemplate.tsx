/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactNode } from 'react'
import { Heading, Layout, Text, Container, Button, useToaster, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams, useHistory } from 'react-router-dom'
import {
  ResponseModuleLicenseDTO,
  StartFreeLicenseQueryParams,
  StartTrialDTORequestBody,
  useStartFreeLicense,
  useStartTrialLicense
} from 'services/cd-ng'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Category, PlanActions, TrialActions } from '@common/constants/TrackingConstants'
import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { FeatureFlag } from '@common/featureFlags'
import { getSavedRefererURL } from '@common/utils/utils'
import { String, useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import bgImageURL from './ff.svg'
import css from './CFTrialTemplate.module.scss'

interface CFTrialTemplateProps {
  isTrialInProgress?: boolean
  cfTrialProps: Omit<CFTrialProps, 'startTrial' | 'module' | 'loading'>
}

interface CFTrialProps {
  description: string
  learnMore: {
    description: string
    url: string
  }
  startBtn: {
    description: string
    onClick?: () => void
  }
  shouldShowStartTrialModal?: boolean
  startTrial: () => Promise<ResponseModuleLicenseDTO>
  loading: boolean
}

export enum Views {
  PENDING = 'PENDING'
}

export interface CardSectionProps {
  title: ReactNode
  listItems: ReactNode[]
}

const CardSection: FC<CardSectionProps> = ({ title, listItems }) => (
  <section className={css.forDevs}>
    <Heading level={4} font={{ variation: FontVariation.H4 }}>
      {title}
    </Heading>
    <ul className={css.list}>
      {listItems.map((item, index) => (
        <Text key={index} color={Color.GREY_900} font={{ variation: FontVariation.SMALL }} tag="li">
          {item}
        </Text>
      ))}
    </ul>
  </section>
)

const CFTrial: React.FC<CFTrialProps> = cfTrialProps => {
  const module = 'cf' as Module
  const { startBtn, shouldShowStartTrialModal, startTrial, loading } = cfTrialProps
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { showModal } = useStartTrialModal({ module, handleStartTrial })
  const isOnPrem = (): boolean => window.deploymentType === Hosting.OnPrem
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const FREE_PLAN_ENABLED = !isOnPrem
  const clickEvent = FREE_PLAN_ENABLED ? PlanActions.StartFreeClick : TrialActions.StartTrialClick
  const experience = FREE_PLAN_ENABLED ? ModuleLicenseType.FREE : ModuleLicenseType.TRIAL
  const modal = FREE_PLAN_ENABLED ? ModuleLicenseType.FREE : ModuleLicenseType.TRIAL

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: () => {
      history.push({
        pathname: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
        search: `view=${Views.PENDING}`
      })
    }
  })

  async function handleStartTrial(): Promise<void> {
    trackEvent(clickEvent, {
      category: Category.SIGNUP,
      module,
      edition: FREE_PLAN_ENABLED ? Editions.FREE : Editions.ENTERPRISE
    })
    try {
      const data = await startTrial()

      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, data?.data)

      history.push({
        pathname: routes.toModuleHome({ accountId, module }),
        search: `?modal=${modal}&&experience=${experience}`
      })
    } catch (error: any) {
      showError(error.data?.message)
    }
  }

  function handleStartButtonClick(): void {
    if (shouldShowStartTrialModal) {
      showModal()
    } else {
      handleStartTrial()
    }
  }

  return (
    <Layout.Vertical className={css.content} spacing="xlarge">
      {/* Main Panel */}
      <article className={css.mainArticle}>
        {/* For Developers */}
        <CardSection
          title={getString('cf.cfTrialHomePage.forDevelopers.title')}
          listItems={[
            getString('cf.cfTrialHomePage.forDevelopers.createFlag'),
            getString('cf.cfTrialHomePage.forDevelopers.shipCode'),
            <String
              key={getString('cf.cfTrialHomePage.forDevelopers.realTime')}
              stringID="cf.cfTrialHomePage.forDevelopers.realTime"
              useRichText
            />
          ]}
        />

        {/* Divider */}
        <div className={css.divider} />

        {/* For DevOps */}
        <CardSection
          title={getString('cf.cfTrialHomePage.forDevOps.title')}
          listItems={[
            getString('cf.cfTrialHomePage.forDevOps.automatedFeature'),
            getString('cf.cfTrialHomePage.forDevOps.avoidRollbacks'),
            getString('cf.cfTrialHomePage.forDevOps.scaleManagement')
          ]}
        />

        <Button
          className={css.startFreePlanBtn}
          width={300}
          height={50}
          variation={ButtonVariation.PRIMARY}
          text={startBtn.description}
          onClick={startBtn.onClick ? startBtn.onClick : handleStartButtonClick}
          disabled={loading}
        />
      </article>

      {/* Don't Code Panel */}
      <article className={css.dontCodeArticle}>
        <section className={css.dontCode}>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.H4 }}>
            {getString('cf.cfTrialHomePage.dontCode.title')}
          </Text>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }}>
            {getString('cf.cfTrialHomePage.dontCode.description')}
          </Text>
        </section>
        <section className={css.inviteDeveloper}>
          <RbacButton
            variation={ButtonVariation.SECONDARY}
            height={50}
            width={180}
            text={getString('cf.cfTrialHomePage.dontCode.inviteDeveloper')}
            disabled={loading}
            data-testid="invite-developer-btn"
            onClick={() => openRoleAssignmentModal()}
            permission={{
              resource: {
                resourceType: ResourceType.USER
              },
              permission: PermissionIdentifier.INVITE_USER
            }}
          />
        </section>
      </article>
    </Layout.Vertical>
  )
}

export const CFTrialTemplate: React.FC<CFTrialTemplateProps> = ({ cfTrialProps }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const isOnPrem = (): boolean => window.deploymentType === Hosting.OnPrem
  const isFreeEnabled = !isOnPrem
  const refererURL = getSavedRefererURL()

  const startTrialRequestBody: StartTrialDTORequestBody = {
    moduleType: 'CF',
    edition: Editions.ENTERPRISE
  }

  const { mutate: startTrial, loading: startingTrial } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId,
      ...(refererURL ? { referer: refererURL } : {})
    }
  })

  const moduleType = 'CF' as StartFreeLicenseQueryParams['moduleType']

  const { mutate: startFreePlan, loading: startingFree } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  function handleStartTrial(): Promise<ResponseModuleLicenseDTO> {
    return isFreeEnabled ? startFreePlan() : startTrial(startTrialRequestBody)
  }

  return (
    <Container className={css.body} style={{ background: `transparent url(${bgImageURL}) no-repeat` }}>
      <Layout.Vertical spacing="medium">
        <Heading className={css.heading} font={{ variation: FontVariation.H1 }} color={Color.BLACK_100}>
          {getString('cf.cfTrialHomePage.featureFlagsDescription')}
        </Heading>

        <CFTrial {...cfTrialProps} startTrial={handleStartTrial} loading={startingTrial || startingFree} />
      </Layout.Vertical>
    </Container>
  )
}
