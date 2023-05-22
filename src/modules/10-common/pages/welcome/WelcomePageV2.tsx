/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { upperCase } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Card,
  Container,
  HarnessIcons,
  Heading,
  Icon,
  Layout,
  OverlaySpinner,
  Text,
  useToaster
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { StringKeys, useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PurposeActions, Category, PLG_ELEMENTS } from '@common/constants/TrackingConstants'
import { Experiences } from '@common/constants/Utils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getSavedRefererURL, getGaClientID } from '@common/utils/utils'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import {
  getLicenseStateNameByModuleType,
  LICENSE_STATE_VALUES,
  getModuleToDefaultURLMap
} from 'framework/LicenseStore/licenseStoreUtil'
import { moduleToModuleNameMapping, Module } from 'framework/types/ModuleName'
import type { StartFreeLicenseQueryParams, ResponseModuleLicenseDTO, ModuleLicenseDTO } from 'services/cd-ng'
import { useUpdateAccountDefaultExperienceNG, useStartFreeLicense } from 'services/cd-ng'
import type { PLG_CD_GET_STARTED_VARIANTS } from '@common/components/ConfigureOptions/constants'
import { modulesInfo, ModuleInfoValue } from './ModulesData'
import css from './WelcomePage.module.scss'

export default function WelcomePageV2(props: { getStartedVariant?: string }): JSX.Element {
  const HarnessLogo = HarnessIcons['harness-logo-black']
  const { CREATE_DEFAULT_PROJECT, AUTO_FREE_MODULE_LICENSE, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED } =
    useFeatureFlags()
  const { FF_LICENSE_STATE, licenseInformation, updateLicenseStore } = useLicenseStore()
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const { mutate: updateDefaultExperience, loading: updatingDefaultExperience } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })

  const { mutate, loading } = useStartFreeLicense({
    queryParams: { accountIdentifier: accountId, moduleType: '' as StartFreeLicenseQueryParams['moduleType'] },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const history = useHistory()
  const startFreeLicense = async (module: Module): Promise<ResponseModuleLicenseDTO> => {
    const refererURL = getSavedRefererURL()
    const gaClientID = getGaClientID()
    return mutate(undefined, {
      queryParams: {
        accountIdentifier: accountId,
        moduleType: moduleToModuleNameMapping[module as Module] as StartFreeLicenseQueryParams['moduleType'],
        ...(refererURL ? { referer: refererURL } : {}),
        ...(gaClientID ? { gaClientId: gaClientID } : {})
      }
    })
  }

  const getModuleStatus = useCallback(
    (moduleSelected: string) => {
      const moduleStatusMap: { [key: string]: boolean | undefined } = {
        cd: true,
        cv: CVNG_ENABLED,
        ci: CING_ENABLED,
        cf: FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE,
        ce: CENG_ENABLED,
        chaos: true
      }
      return Boolean(moduleStatusMap[moduleSelected])
    },
    [CVNG_ENABLED, CING_ENABLED, FF_LICENSE_STATE, CENG_ENABLED]
  )
  const trackLearnMore = (moduleSelected: string): void =>
    trackEvent(PurposeActions.LearnMoreClicked, { category: Category.SIGNUP, module: moduleSelected })

  const getClickHandle = (
    moduleSelected: string,
    element: string
  ): { clickHandle?: () => Promise<void>; disabled?: boolean } => {
    switch (moduleSelected) {
      case 'ci':
      case 'cd':
      case 'ce':
      case 'cv':
      case 'cf':
      case 'chaos':
        return {
          clickHandle: async () => {
            trackEvent(PurposeActions.ModuleContinue, {
              category: Category.SIGNUP,
              module: moduleSelected,
              element
            })
            try {
              if (AUTO_FREE_MODULE_LICENSE) {
                await updateDefaultExperience({
                  defaultExperience: Experiences.NG
                })
                const licenseStateName = getLicenseStateNameByModuleType(moduleSelected as Module)
                const hasFreeLicense = licenseInformation[upperCase(moduleSelected)]?.edition === 'FREE'
                if (!hasFreeLicense) {
                  const licenseResponse = await startFreeLicense(moduleSelected)

                  updateLicenseStore({
                    licenseInformation: {
                      ...licenseInformation,
                      [moduleToModuleNameMapping[moduleSelected as Module]]: licenseResponse.data as ModuleLicenseDTO
                    } as { [key: string]: ModuleLicenseDTO },
                    [licenseStateName]: LICENSE_STATE_VALUES.ACTIVE
                  })
                }
                const defaultURL = getModuleToDefaultURLMap(
                  accountId,
                  moduleSelected as Module,
                  props?.getStartedVariant as PLG_CD_GET_STARTED_VARIANTS
                )[moduleSelected as Module]
                CREATE_DEFAULT_PROJECT
                  ? history.push(defaultURL)
                  : history.push(routes.toModuleHome({ accountId, module: moduleSelected, source: 'purpose' }))
              } else {
                updateDefaultExperience({
                  defaultExperience: Experiences.NG
                }).then(() => {
                  history.push(routes.toModuleHome({ accountId, module: moduleSelected, source: 'purpose' }))
                })
              }
            } catch (error) {
              showError(error.data?.message || getString('somethingWentWrong'))
            }
          },
          disabled: updatingDefaultExperience
        }
      default:
        return {}
    }
  }

  return (
    <OverlaySpinner show={updatingDefaultExperience || loading}>
      <HarnessLogo height={30} style={{ alignSelf: 'start' }} className={css.harnessLogo} />
      <Container padding={{ top: 'xxxlarge' }} flex={{ alignItems: 'start' }} className={cx(css.onboardingContainer)}>
        <Container>
          <Heading color={Color.GREY_800} font={{ size: 'large', weight: 'bold' }} padding={{ top: 'xlarge' }}>
            {getString('common.welcomePage.improveText')}
          </Heading>
          <Heading
            color={Color.BLACK}
            font={{ size: 'medium', weight: 'semi-bold' }}
            padding={{ top: 'small', bottom: 'medium' }}
          >
            {getString('common.welcomePage.selectusecase')}
          </Heading>
          <Layout.Horizontal>
            <Container className={cx(css.width80, css.moduleCards)}>
              <Container padding={{ top: 'large' }} flex={{ alignItems: 'start' }} className={cx(css.onboardingCards)}>
                <Card className={cx(css.width50, css.onboardingCard, css.cardShadow)}>
                  <Layout.Vertical>
                    <Layout.Horizontal>
                      <Heading
                        color={Color.BLACK}
                        font={{ size: 'medium', weight: 'bold' }}
                        className={css.onboardingHead}
                      >
                        <Icon name={modulesInfo.cd.icon} size={20} padding={{ right: 'medium' }} />

                        {getString(modulesInfo.cd.title)}
                      </Heading>
                    </Layout.Horizontal>
                    <Text padding={{ top: 'medium', bottom: 'large' }} className={css.bodyText} color={Color.BLACK}>
                      {getString(modulesInfo.cd.bodyText)}
                    </Text>
                    {getString(modulesInfo.cd.points as StringKeys)
                      ?.split(',')
                      .map((point: string, idx: number) => (
                        <Text
                          key={idx}
                          icon="flash"
                          color={Color.BLACK}
                          iconProps={{ color: Color.BLACK, size: 18 }}
                          className={css.bodyText}
                        >
                          {point}
                        </Text>
                      ))}
                  </Layout.Vertical>
                  <Layout.Horizontal padding={{ top: 'xxlarge' }}>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      onClick={getClickHandle(modulesInfo.cd.module, PLG_ELEMENTS.MODULE_CARD).clickHandle}
                      disabled={getClickHandle(modulesInfo.cd.module, PLG_ELEMENTS.MODULE_CARD).disabled}
                    >
                      {getString('getStarted')}
                    </Button>
                    <Button
                      variation={ButtonVariation.LINK}
                      href={modulesInfo.cd.helpURL}
                      target="_blank"
                      withoutBoxShadow={true}
                      onClick={() => trackLearnMore(modulesInfo.cd.module)}
                    >
                      {getString('learnMore')}
                    </Button>
                  </Layout.Horizontal>
                </Card>
                {getModuleStatus(modulesInfo.ci.module) && (
                  <Card className={cx(css.width50, css.onboardingCard, css.cardShadow)}>
                    <Layout.Vertical>
                      <Layout.Horizontal>
                        <Heading
                          color={Color.BLACK}
                          font={{ size: 'medium', weight: 'bold' }}
                          className={css.onboardingHead}
                        >
                          <Icon name={modulesInfo.ci.icon} size={20} padding={{ right: 'medium' }} />
                          {getString(modulesInfo.ci.title)}
                        </Heading>
                      </Layout.Horizontal>
                      <Text padding={{ top: 'medium', bottom: 'large' }} className={css.bodyText} color={Color.BLACK}>
                        {getString(modulesInfo.ci.bodyText)}
                      </Text>
                      {getString(modulesInfo.ci.points as StringKeys)
                        ?.split(',')
                        .map((point: string, idx: number) => (
                          <Text
                            key={idx}
                            icon="flash"
                            color={Color.BLACK}
                            iconProps={{ color: Color.BLACK, size: 18 }}
                            className={css.bodyText}
                          >
                            {point}
                          </Text>
                        ))}
                    </Layout.Vertical>
                    <Layout.Horizontal padding={{ top: 'xxlarge' }}>
                      <Button
                        variation={ButtonVariation.PRIMARY}
                        onClick={getClickHandle(modulesInfo.ci.module, PLG_ELEMENTS.MODULE_CARD).clickHandle}
                        disabled={getClickHandle(modulesInfo.ci.module, PLG_ELEMENTS.MODULE_CARD).disabled}
                      >
                        {getString('getStarted')}
                      </Button>
                      <Button
                        variation={ButtonVariation.LINK}
                        href={modulesInfo.ci.helpURL}
                        target="_blank"
                        withoutBoxShadow={true}
                        onClick={() => trackLearnMore(modulesInfo.ci.module)}
                      >
                        {getString('learnMore')}
                      </Button>
                    </Layout.Horizontal>
                  </Card>
                )}
              </Container>
              <Container padding={{ top: 'xlarge' }} flex={{ alignItems: 'start' }} className={cx(css.onboardingCards)}>
                {Object.values(modulesInfo)
                  .slice(2)
                  .map((moduleData: ModuleInfoValue) =>
                    getModuleStatus(moduleData.module) ? (
                      <Card key={moduleData.module} className={cx(css.normalCard, css.onboardingCard, css.cardShadow)}>
                        <Layout.Vertical>
                          <Layout.Horizontal>
                            <Heading
                              color={Color.BLACK}
                              font={{ size: 'medium', weight: 'bold' }}
                              className={css.onboardingHead}
                            >
                              <Icon name={moduleData.icon} size={20} padding={{ right: 'medium' }} />
                              {getString(moduleData.title)}
                            </Heading>
                          </Layout.Horizontal>
                          <Text
                            padding={{ top: 'medium', bottom: 'large' }}
                            className={css.bodyText}
                            color={Color.BLACK}
                          >
                            {getString(moduleData.bodyText)}
                          </Text>
                        </Layout.Vertical>
                        <Layout.Horizontal padding={{ top: 'xxlarge' }}>
                          <Button
                            variation={ButtonVariation.PRIMARY}
                            onClick={getClickHandle(moduleData.module, PLG_ELEMENTS.MODULE_CARD).clickHandle}
                            disabled={getClickHandle(moduleData.module, PLG_ELEMENTS.MODULE_CARD).disabled}
                          >
                            {getString('getStarted')}
                          </Button>
                          <Button
                            variation={ButtonVariation.LINK}
                            href={moduleData.helpURL}
                            target="_blank"
                            withoutBoxShadow={true}
                            onClick={() => trackLearnMore(moduleData.module)}
                          >
                            {getString('learnMore')}
                          </Button>
                        </Layout.Horizontal>
                      </Card>
                    ) : null
                  )}
              </Container>
            </Container>
            <Layout.Vertical padding={{ left: 'xxxlarge' }}>
              <Layout.Vertical padding={{ top: 'large', left: 'medium', right: 'medium', bottom: 'small' }}>
                <Text color={Color.GREY_500} font={{ size: 'medium' }}>
                  {getString('common.welcomePage.allusecases')}
                </Text>
              </Layout.Vertical>
              {Object.values(modulesInfo).map((moduleInfo: ModuleInfoValue, idx: number) =>
                getModuleStatus(moduleInfo.module) ? (
                  <ModuleSidecard
                    onclick={getClickHandle(moduleInfo.module, PLG_ELEMENTS.RIGHT_COLUMN).clickHandle}
                    key={idx}
                    index={idx}
                    getString={getString}
                    moduleInfo={moduleInfo}
                  />
                ) : null
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
        </Container>
      </Container>
    </OverlaySpinner>
  )
}

const ModuleSidecard = ({
  index,
  getString,
  moduleInfo,
  onclick
}: {
  index: number
  getString(key: StringKeys, vars?: Record<string, any>): string
  moduleInfo: ModuleInfoValue
  onclick: (() => Promise<void>) | undefined
}): JSX.Element => {
  return (
    <Layout.Horizontal padding="medium" onClick={onclick} className={cx(css.sidecard, { [css.noBorder]: index === 5 })}>
      <Container padding={{ left: 'medium', right: 'medium' }} className={css.iconSidecard}>
        <Icon name={moduleInfo.icon} size={18} />
      </Container>
      <Layout.Vertical padding="small">
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {getString(moduleInfo.title)}
        </Text>
        <Text font={{ size: 'small' }} padding={{ top: 'xsmall', bottom: 'xsmall' }} color={Color.GREY_800}>
          {getString(moduleInfo.subTitle)}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
