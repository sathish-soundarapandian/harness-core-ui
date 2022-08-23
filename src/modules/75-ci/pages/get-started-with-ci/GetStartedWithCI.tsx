/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { get } from 'lodash-es'
import {
  Text,
  FontVariation,
  Icon,
  Layout,
  Button,
  ButtonVariation,
  IconName,
  Container,
  ButtonSize,
  PageSpinner
} from '@harness/uicore'
import type { IconProps } from '@harness/icons'
import {
  ConnectorFilterProperties,
  ConnectorInfoDTO,
  ConnectorResponse,
  getSecretV2Promise,
  ResponsePageConnectorResponse,
  ResponseSecretResponseWrapper,
  SecretDTOV2,
  useGetConnectorListV2
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Status } from '@common/utils/Constants'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import { Connectors } from '@connectors/constants'
import { InfraProvisioningWizard } from './InfraProvisioningWizard/InfraProvisioningWizard'
import { InfraProvisiongWizardStepId, ProvisioningStatus } from './InfraProvisioningWizard/Constants'
import { InfraProvisioningCarousel } from './InfraProvisioningCarousel/InfraProvisioningCarousel'
import { useProvisionDelegateForHostedBuilds } from '../../hooks/useProvisionDelegateForHostedBuilds'
import { sortConnectorsByLastConnectedAtTsDescOrder } from '../../utils/HostedBuildsUtils'

import buildImgURL from './build.svg'
import css from './GetStartedWithCI.module.scss'

export default function GetStartedWithCI(): React.ReactElement {
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [showWizard, setShowWizard] = useState<boolean>(false)
  const [showProvisioningCarousel, setShowProvisioningCarousel] = useState<boolean>(false)
  const { initiateProvisioning, delegateProvisioningStatus, fetchingDelegateDetails } =
    useProvisionDelegateForHostedBuilds()
  const [preSelectedGitConnector, setPreselectedGitConnector] = useState<ConnectorInfoDTO>()
  const [connectorsEligibleForPreSelection, setConnectorsEligibleForPreSelection] = useState<ConnectorInfoDTO[]>()
  const [secretForPreSelectedConnector, setSecretForPreSelectedConnector] = useState<SecretDTOV2>()
  const { mutate: fetchGitConnectors, loading: fetchingGitConnectors } = useGetConnectorListV2({
    queryParams: {
      accountIdentifier: accountId,
      pageSize: 10
    }
  })
  const [isFetchingSecret, setIsFetchingSecret] = useState<boolean>()
  const scrollRef = useRef<Element>()

  useEffect(() => {
    if (showWizard) {
      fetchGitConnectors({
        types: [Connectors.GITHUB, Connectors.GITLAB, Connectors.BITBUCKET],
        connectivityStatuses: [Status.SUCCESS],
        filterType: 'Connector'
      } as ConnectorFilterProperties).then((response: ResponsePageConnectorResponse) => {
        const { status, data } = response
        if (status === Status.SUCCESS && Array.isArray(data?.content) && data?.content && data.content.length > 0) {
          const filteredConnectors = data.content.filter(
            (item: ConnectorResponse) =>
              get(item, 'connector.spec.apiAccess.spec.tokenRef') && item.status?.status === Status.SUCCESS
          )
          setConnectorsEligibleForPreSelection(
            filteredConnectors.map((item: ConnectorResponse) => item.connector) as ConnectorInfoDTO[]
          )
          const selectedConnector = sortConnectorsByLastConnectedAtTsDescOrder(filteredConnectors)?.[0]
          if (selectedConnector?.connector) {
            setPreselectedGitConnector(selectedConnector?.connector)
            const secretIdentifier = getIdentifierFromValue(
              get(selectedConnector, 'connector.spec.apiAccess.spec.tokenRef')
            )
            if (secretIdentifier) {
              setIsFetchingSecret(true)
              try {
                getSecretV2Promise({
                  identifier: secretIdentifier,
                  queryParams: {
                    accountIdentifier: accountId
                  }
                })
                  .then((secretResponse: ResponseSecretResponseWrapper) => {
                    setIsFetchingSecret(false)
                    const { status: fetchSecretStatus, data: secretResponseData } = secretResponse
                    if (fetchSecretStatus === Status.SUCCESS && secretResponseData?.secret) {
                      setSecretForPreSelectedConnector(secretResponseData?.secret)
                    }
                  })
                  .catch(_e => {
                    setIsFetchingSecret(false)
                  })
              } catch (e) {
                setIsFetchingSecret(false)
              }
            }
          }
        }
      })
    }
  }, [showWizard])

  useEffect(() => {
    if (delegateProvisioningStatus === ProvisioningStatus.IN_PROGRESS) {
      setShowProvisioningCarousel(true)
    }
  }, [delegateProvisioningStatus])

  const renderBuildPipelineStep = React.useCallback(
    ({ iconProps, label, isLastStep }: { iconProps: IconProps; label: keyof StringsMap; isLastStep?: boolean }) => (
      <Layout.Horizontal flex padding={{ right: 'xsmall' }} spacing="xsmall">
        <Icon name={iconProps.name} size={iconProps.size} className={iconProps.className} />
        <Text font={{ variation: FontVariation.TINY }} padding={{ left: 'xsmall', right: 'xsmall' }}>
          {getString(label)}
        </Text>
        {!isLastStep ? <Icon name="arrow-right" size={10} className={css.arrow} /> : null}
      </Layout.Horizontal>
    ),
    []
  )

  const CI_CATALOGUE_ITEMS: { icon: IconName; label: keyof StringsMap; helptext: keyof StringsMap }[][] = [
    [
      {
        icon: 'ci-ti',
        label: 'ci.getStartedWithCI.ti',
        helptext: 'ci.getStartedWithCI.tiHelpText'
      },
      {
        icon: 'ci-infra-support',
        label: 'ci.getStartedWithCI.flexibleInfra',
        helptext: 'ci.getStartedWithCI.flexibleInfraHelpText'
      }
    ],
    [
      {
        icon: 'ci-language',
        label: 'ci.getStartedWithCI.languageAgnostic',
        helptext: 'ci.getStartedWithCI.languageAgnosticHelpText'
      },
      {
        icon: 'ci-dev-exp',
        label: 'ci.getStartedWithCI.devFriendly',
        helptext: 'ci.getStartedWithCI.devFriendlyHelpText'
      }
    ],
    [
      {
        icon: 'ci-parameterization',
        label: 'ci.getStartedWithCI.parameterization',
        helptext: 'ci.getStartedWithCI.parameterizationHelpText'
      },
      {
        icon: 'ci-gov',
        label: 'ci.getStartedWithCI.security',
        helptext: 'ci.getStartedWithCI.securityHelpText'
      }
    ],
    [
      {
        icon: 'ci-execution',
        label: 'ci.getStartedWithCI.parallelization',
        helptext: 'ci.getStartedWithCI.parallelizationHelpText'
      },
      {
        icon: 'ci-integrated',
        label: 'ci.getStartedWithCI.integratedCICD',
        helptext: 'ci.getStartedWithCI.integratedCICDHelpText'
      }
    ]
  ]

  const renderCatalogueItem = React.useCallback(
    ({ icon, label, helptext }: { icon: IconName; label: keyof StringsMap; helptext: keyof StringsMap }) => (
      <Layout.Vertical
        key={label}
        width="45%"
        margin={{ left: 'huge', right: 'huge' }}
        padding={{ left: 'medium', right: 'medium' }}
      >
        <Icon name={icon} size={50} />
        <Text font={{ variation: FontVariation.CARD_TITLE }}>{getString(label)}</Text>
        <Text font={{ variation: FontVariation.SMALL }}>{getString(helptext)}</Text>
      </Layout.Vertical>
    ),
    []
  )

  const Divider = <div className={css.divider}></div>

  const showPageLoader = fetchingGitConnectors || isFetchingSecret

  return (
    <>
      {showPageLoader ? <PageSpinner /> : <></>}
      {showWizard ? (
        <InfraProvisioningWizard
          precursorData={{
            preSelectedGitConnector,
            connectorsEligibleForPreSelection,
            secretForPreSelectedConnector
          }}
          lastConfiguredWizardStepId={
            preSelectedGitConnector
              ? InfraProvisiongWizardStepId.SelectRepository
              : InfraProvisiongWizardStepId.SelectGitProvider
          }
        />
      ) : (
        <>
          {showProvisioningCarousel ? (
            <InfraProvisioningCarousel
              show={showProvisioningCarousel}
              provisioningStatus={delegateProvisioningStatus}
              onClose={() => {
                if (delegateProvisioningStatus === ProvisioningStatus.FAILURE) {
                  setShowProvisioningCarousel(false)
                } else if (delegateProvisioningStatus === ProvisioningStatus.SUCCESS) {
                  setShowWizard(true)
                }
              }}
            />
          ) : null}
          <Layout.Vertical flex>
            <Container className={css.topPage}>
              <Container className={css.buildYourOwnPipeline}>
                <Container>
                  <Layout.Horizontal flex className={css.ciLogo}>
                    <Icon name="ci-main" size={42} />
                    <Layout.Vertical flex padding={{ left: 'xsmall' }}>
                      <Text font={{ variation: FontVariation.BODY2 }} className={css.label}>
                        {getString('common.purpose.ci.continuousLabel')}
                      </Text>
                      <Text font={{ variation: FontVariation.BODY2 }} className={css.label}>
                        {getString('common.purpose.ci.integration')}
                      </Text>
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </Container>
                <Layout.Vertical>
                  <Text font={{ variation: FontVariation.H2 }}>{getString('common.getStarted.firstPipeline')}</Text>
                  <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }}>
                    {getString('common.purpose.ci.descriptionOnly')}
                  </Text>
                  <Layout.Horizontal padding={{ top: 'xxlarge', bottom: 'huge' }}>
                    {renderBuildPipelineStep({
                      iconProps: { name: 'scm', size: 18, className: cx(css.icon, css.paddingXSmall) },
                      label: 'ci.getStartedWithCI.connectRepo'
                    })}
                    {renderBuildPipelineStep({
                      iconProps: {
                        name: 'repository',
                        size: 14,
                        className: cx(css.icon, css.iconPadding)
                      },
                      label: 'ci.getStartedWithCI.selectRepo'
                    })}
                    {renderBuildPipelineStep({
                      iconProps: {
                        name: 'ci-build-pipeline',
                        size: 20,
                        className: cx(css.icon, css.iconPaddingSmall)
                      },
                      label: 'common.getStarted.buildPipeline',
                      isLastStep: true
                    })}
                  </Layout.Horizontal>
                  <Container className={css.buttonRow}>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      size={ButtonSize.LARGE}
                      text={getString('getStarted')}
                      onClick={() => {
                        if (delegateProvisioningStatus === ProvisioningStatus.SUCCESS) {
                          setShowWizard(true)
                        } else {
                          initiateProvisioning()
                        }
                      }}
                      disabled={fetchingDelegateDetails}
                    />
                  </Container>
                </Layout.Vertical>
                <img
                  className={css.buildImg}
                  title={getString('common.getStarted.buildPipeline')}
                  src={buildImgURL}
                  width={413}
                  height={260}
                />
              </Container>
              <Container className={css.learnMore}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  round
                  rightIcon="double-chevron-down"
                  iconProps={{ size: 12 }}
                  text={getString('ci.getStartedWithCI.learnMoreAboutCI')}
                  onClick={() => {
                    // Note: Without setTimeout, scrollIntoView does not work!
                    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
                  }}
                />
              </Container>
            </Container>
            <Container ref={scrollRef}>
              <Layout.Horizontal flex padding={{ top: 'huge' }}>
                <Icon name="ci-main" size={42} />
                <Layout.Vertical flex padding={{ left: 'xsmall' }}>
                  <Text font={{ variation: FontVariation.H5 }} className={css.label}>
                    {getString('common.purpose.ci.continuousLabel')}
                  </Text>
                  <Text font={{ variation: FontVariation.H5 }} className={css.label}>
                    {getString('common.purpose.ci.integration')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
            </Container>
            <Text
              font={{ variation: FontVariation.H3 }}
              className={css.nextLevel}
              padding={{ top: 'large', bottom: 'xxxlarge' }}
            >
              {getString('ci.getStartedWithCI.takeToTheNextLevel')}
            </Text>
            {Divider}
            <Layout.Vertical width="70%" padding={{ top: 'huge', bottom: 'xxlarge' }}>
              {CI_CATALOGUE_ITEMS.map(
                (item: { icon: IconName; label: keyof StringsMap; helptext: keyof StringsMap }[], index: number) => {
                  return (
                    <Layout.Horizontal padding="xlarge" key={index}>
                      {renderCatalogueItem(item[0])}
                      {renderCatalogueItem(item[1])}
                    </Layout.Horizontal>
                  )
                }
              )}
            </Layout.Vertical>
            {Divider}
            <Container padding={{ top: 'xxxlarge', bottom: 'huge' }}>
              <Button
                variation={ButtonVariation.PRIMARY}
                href="https://docs.harness.io/category/zgffarnh1m-ci-category"
                target="_blank"
              >
                {getString('pipeline.createPipeline.learnMore')}
              </Button>
            </Container>
          </Layout.Vertical>
        </>
      )}
    </>
  )
}
