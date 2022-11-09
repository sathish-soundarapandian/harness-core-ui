/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Icon,
  Layout,
  Text
} from '@harness/uicore'

import { capitalize } from 'lodash-es'
import { StringKeys, useStrings } from 'framework/strings'
import successSetup from '../../home/images/success_setup.svg'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import { DeployProvisiongWizardStepId } from '../DeployProvisioningWizard/Constants'
import css from './RunPipelineSummary.module.scss'

interface RunPipelineSummaryProps {
  onSuccess: () => void
}

const RunPipelineSummary = ({ onSuccess }: RunPipelineSummaryProps): JSX.Element => {
  const {
    state: { service, delegate },
    setSelectedSectionId
  } = useCDOnboardingContext()
  const { getString } = useStrings()

  const environmentEntites: Record<string, string> = {
    'cd.getStartedWithCD.delegateRunAs': delegate?.delegateType as string,
    connector: delegate?.environmentEntities?.connector as string,
    environment: delegate?.environmentEntities?.environment as string,
    infrastructureText: delegate?.environmentEntities?.infrastructure as string,
    'common.namespace': delegate?.environmentEntities?.namespace as string
  }

  const serviceEntities: Record<string, string> = {
    'common.serviceName': service?.name as string,
    'pipelineSteps.serviceTab.manifestList.manifestType': service?.serviceDefinition?.spec?.manifests?.[0]?.manifest
      ?.type as string,
    'cd.getStartedWithCD.manifestStorage': service?.serviceDefinition?.spec?.manifests?.[0]?.manifest?.spec?.store
      ?.type as string,
    'cd.getStartedWithCD.artifactStorage': service?.serviceDefinition?.spec?.artifacts?.primary?.sources?.[0]
      ?.type as string
  }
  const successsFullConfiguration = React.useCallback((): JSX.Element => {
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
        <Icon name="success-tick" />
        <Text font="normal" color={Color.GREEN_700}>
          {capitalize(getString('cd.getStartedWithCD.successFull'))}
        </Text>
      </Layout.Horizontal>
    )
  }, [getString])

  return (
    <Container className={css.container} width="50%">
      <Layout.Vertical padding="xxlarge">
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'large' }}>
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'huge' }}>
              {getString('cd.getStartedWithCD.allSet')}
            </Text>

            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              padding={{ bottom: 'medium' }}
            >
              <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                {getString('deploymentTypeText')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)}
              />
            </Layout.Horizontal>
            <Text font="normal">{service?.serviceDefinition?.type}</Text>
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
                {getString('cd.getStartedWithCD.configureEnvironment')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.DelegateSelector)}
              />
            </Layout.Horizontal>
            {successsFullConfiguration()}
          </Layout.Horizontal>
          {Object.keys(environmentEntites).map(entity => {
            return (
              <Text key={entity} style={{ lineHeight: '28px' }} font="normal">
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
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.ConfigureService)}
              />
            </Layout.Horizontal>
            {successsFullConfiguration()}
          </Layout.Horizontal>
          {Object.keys(serviceEntities).map(entity => {
            return (
              <Text key={entity} style={{ lineHeight: '28px' }} font="normal">
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
            text={'Run Pipeline'}
            padding="xlarge"
            size={ButtonSize.MEDIUM}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  )
}

export default RunPipelineSummary
