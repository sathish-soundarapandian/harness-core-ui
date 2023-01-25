/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Icon, Layout, Text } from '@harness/uicore'

import { Color, FontVariation } from '@harness/design-system'
import { capitalize, defaultTo } from 'lodash-es'
import { StringKeys, useStrings } from 'framework/strings'
import successSetup from '../../home/images/success_setup.svg'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import { DeployProvisiongWizardStepId } from '../DeployProvisioningWizard/Constants'
import css from './RunPipelineSummary.module.scss'

interface RunPipelineSummaryProps {
  onSuccess: () => void
  setSelectedSectionId: React.Dispatch<React.SetStateAction<DeployProvisiongWizardStepId>>
}

const RunPipelineSummary = ({ onSuccess, setSelectedSectionId }: RunPipelineSummaryProps): JSX.Element => {
  const {
    state: { service, delegate }
  } = useCDOnboardingContext()
  const { getString } = useStrings()
  const text = delegate?.delegateInstalled ? getString('connected') : getString('delegate.notConnected')
  const environmentEntites: Record<string, string> = {
    connector: delegate?.environmentEntities?.connector as string,
    environment: delegate?.environmentEntities?.environment as string,
    infrastructureText: delegate?.environmentEntities?.infrastructure as string,
    'common.namespace': delegate?.environmentEntities?.namespace as string
  }

  const serviceEntities: Record<string, string> = {
    'cd.getStartedWithCD.serviceName': service?.name as string,
    'cd.getStartedWithCD.manifestTypeSelection': service?.serviceDefinition?.spec?.manifests?.[0]?.manifest
      ?.type as string,
    'cd.getStartedWithCD.manifestStorage': service?.serviceDefinition?.spec?.manifests?.[0]?.manifest?.spec?.store
      ?.type as string,
    'cd.getStartedWithCD.artifactStorage': defaultTo(
      service?.serviceDefinition?.spec?.artifacts?.primary?.sources?.[0]?.type,
      '-'
    )
  }
  const successsFullConfiguration = (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
      <Icon name="success-tick" />
      <Text font="normal" color={Color.GREEN_700}>
        {capitalize(getString('success'))}
      </Text>
    </Layout.Horizontal>
  )

  return (
    <Container className={css.container} width="50%">
      <Layout.Vertical padding="xxlarge">
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'large' }}>
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xxlarge' }}>
              {getString('cd.getStartedWithCD.allSet')}
            </Text>

            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              padding={{ bottom: 'medium' }}
            >
              <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                {getString('cd.getStartedWithCD.deploymentType')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)}
              />
            </Layout.Horizontal>
            <Text margin={{ left: 'medium' }} font="normal">
              {service?.serviceDefinition?.type}
            </Text>
          </Layout.Vertical>

          <img className={css.successImage} src={successSetup} />
        </Layout.Horizontal>
        <Container className={css.borderBottomClass} />

        {/* ENVIRONMENT */}

        <Layout.Vertical padding={{ bottom: 'large' }}>
          <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                {getString('common.connectEnvironment')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.Deploy)}
              />
            </Layout.Horizontal>
            {successsFullConfiguration}
          </Layout.Horizontal>
          <Text style={{ lineHeight: '28px' }} font={{ variation: FontVariation.BODY1 }}>
            {getString('cd.getStartedWithCD.delegateRunAs')}
          </Text>

          <Container flex={{ justifyContent: 'space-between' }}>
            <Text margin={{ left: 'medium' }} style={{ lineHeight: '28px' }} font="normal">
              {delegate?.delegateType as string}
            </Text>
            <Text
              icon="full-circle"
              iconProps={{
                size: 6,
                color: delegate?.delegateInstalled ? Color.GREEN_600 : Color.GREY_400,
                padding: 'small'
              }}
            >
              {text}
            </Text>
          </Container>

          <Text style={{ lineHeight: '28px' }} font={{ variation: FontVariation.BODY1 }}>
            {getString('cd.getStartedWithCD.environmentDetails')}
          </Text>
          {Object.keys(environmentEntites).map(entity => {
            return (
              <Text margin={{ left: 'medium' }} key={entity} style={{ lineHeight: '28px' }} font="normal">
                {getString(entity as StringKeys)}: {environmentEntites[entity]}
              </Text>
            )
          })}
        </Layout.Vertical>
        <Container className={css.borderBottomClass} />

        {/* SERVICE */}

        <Layout.Vertical padding={{ bottom: 'large' }}>
          <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                {getString('cd.getStartedWithCD.serviceConfiguration')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.Configure)}
              />
            </Layout.Horizontal>
            {successsFullConfiguration}
          </Layout.Horizontal>
          {Object.keys(serviceEntities).map(entity => {
            return (
              <Text margin={{ left: 'medium' }} key={entity} style={{ lineHeight: '28px' }} font="normal">
                {getString(entity as StringKeys)}: {serviceEntities[entity]}
              </Text>
            )
          })}
        </Layout.Vertical>
        <Container className={css.borderBottomClass} />

        <Layout.Horizontal>
          <Button
            onClick={onSuccess}
            intent="success"
            variation={ButtonVariation.PRIMARY}
            text={getString('runPipeline')}
            padding="xlarge"
            size={ButtonSize.MEDIUM}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  )
}

export default RunPipelineSummary
