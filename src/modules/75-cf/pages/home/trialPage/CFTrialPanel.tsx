/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Button, ButtonVariation, Heading, Layout, Text, useToaster } from '@harness/uicore'
import React, { FC, ReactNode } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { ResponseModuleLicenseDTO } from 'services/cd-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { String, useStrings } from 'framework/strings'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import { ModuleLicenseType, Editions } from '@common/constants/SubscriptionTypes'
import { PlanActions, TrialActions, Category } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import RbacButton from '@rbac/components/Button/Button'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './CFTrialPage.module.scss'

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

const CFTrialPanel: React.FC<CFTrialProps> = cfTrialProps => {
  const module = 'cf' as Module
  const { startBtn, shouldShowStartTrialModal, startTrial, loading } = cfTrialProps
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { showModal } = useStartTrialModal({ module, handleStartTrial })
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { FREE_PLAN_ENABLED } = useFeatureFlags()
  const clickEvent = FREE_PLAN_ENABLED ? PlanActions.StartFreeClick : TrialActions.StartTrialClick
  const experience = FREE_PLAN_ENABLED ? ModuleLicenseType.FREE : ModuleLicenseType.TRIAL
  const modal = FREE_PLAN_ENABLED ? ModuleLicenseType.FREE : ModuleLicenseType.TRIAL

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: () => {
      history.push({
        pathname: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
        search: `view=PENDING`
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
        search: `modal=${modal}&experience=${experience}`
      })
    } catch (error: any) {
      showError(error.data?.message)
    }
  }

  const handleStartButtonClick = shouldShowStartTrialModal ? showModal : handleStartTrial

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
              key="cf.cfTrialHomePage.forDevelopers.realTime"
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
          <Heading level="4" color={Color.GREY_900} font={{ variation: FontVariation.H4 }}>
            {getString('cf.cfTrialHomePage.dontCode.title')}
          </Heading>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }}>
            {getString('cf.cfTrialHomePage.dontCode.description')}
          </Text>
        </section>
        <RbacButton
          className={css.inviteDeveloper}
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
      </article>
    </Layout.Vertical>
  )
}

export default CFTrialPanel
