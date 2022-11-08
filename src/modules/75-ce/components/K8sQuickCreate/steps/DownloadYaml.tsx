/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useState } from 'react'
import { Button, ButtonVariation, Layout, StepProps, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'

import { String, useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type { ConnectorConfigDTO, DelegateSetupDetails } from 'services/cd-ng'
import { useGenerateKubernetesYaml, GenerateKubernetesYamlQueryParams } from 'services/portal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { DelegateFileName } from '@delegates/components/CreateDelegate/K8sDelegate/K8sDelegate.constants'
import { quickCreateDelegateParams } from '@ce/utils/cloudIntegrationUtils'

import StepContainer from './StepContainer'

import css from '../K8sQuickCreateModal.module.scss'

interface DownloadYamlProps {
  name: string
}

const DownloadYaml: React.FC<DownloadYamlProps & StepProps<ConnectorConfigDTO>> = ({
  nextStep,
  previousStep,
  prevStepData
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { triggerExtension } = useContext(DialogExtensionContext)
  const [yaml, setYaml] = useState(get(prevStepData, 'yaml'))

  const steps: Array<keyof StringsMap> = ['ce.k8sQuickCreate.applyYaml.step1', 'ce.k8sQuickCreate.applyYaml.step2']

  /* istanbul ignore next */
  const defaultParams: DelegateSetupDetails = {
    name: prevStepData?.name,
    identifier: prevStepData?.identifier,
    ...quickCreateDelegateParams
  }

  const { loading: yamlLoading, mutate: generateYaml } = useGenerateKubernetesYaml({
    queryParams: {
      accountId,
      fileFormat: 'text/plain'
    } as GenerateKubernetesYamlQueryParams
  })

  const generateDelegateYaml = async (): Promise<void> => {
    /* istanbul ignore else */ if (!get(prevStepData, 'yaml')) {
      const generateYamlRes = await generateYaml(defaultParams)

      setYaml(generateYamlRes as any)
    }
  }

  useEffect(() => {
    generateDelegateYaml()
  }, [])

  const handleDownloadYaml = /* istanbul ignore next */ (): void => {
    downloadYamlAsFile(yaml, 'harness-delegate.yml')
  }

  return (
    <Layout.Vertical height={'100%'} spacing={'medium'}>
      <Text font={{ variation: FontVariation.H3 }}>{getString('ce.k8sQuickCreate.downloadAndApplyYaml')}</Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
        {getString('ce.k8sQuickCreate.applyYaml.header')}
      </Text>
      <Layout.Vertical spacing={'small'} margin={{ bottom: 'xsmall' }}>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800} margin={{ top: 'small' }}>
          {getString('ce.k8sQuickCreate.applyYaml.desc')}
        </Text>
        {steps.map(step => (
          <Text key={step} font={{ variation: FontVariation.BODY }} color={Color.GREY_800} className={css.applySteps}>
            <String useRichText stringID={step} />
          </Text>
        ))}
      </Layout.Vertical>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800} margin={{ top: 'small' }}>
        {getString('ce.k8sQuickCreate.applyYaml.stepsToApply')}
      </Text>
      <StepContainer stepId={1}>
        <Layout.Horizontal style={{ alignItems: 'center' }}>
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_900} margin={{ right: 'xlarge' }}>
            {getString('ce.cloudIntegration.autoStoppingModal.installComponents.step1')}
          </Text>
          <Button
            disabled={yamlLoading}
            rightIcon="launch"
            variation={ButtonVariation.SECONDARY}
            margin={{ right: 'medium' }}
            text={getString('connectors.ceK8.providePermissionsStep.downloadYamlBtnText')}
            onClick={handleDownloadYaml}
          />
          <Button
            disabled={yamlLoading}
            rightIcon="launch"
            variation={ButtonVariation.SECONDARY}
            text={getString('ce.cloudIntegration.autoStoppingModal.installComponents.previewYaml')}
            onClick={() =>
              triggerExtension(
                <YamlBuilder
                  entityType="Delegates"
                  fileName={DelegateFileName.k8sFileName}
                  isReadOnlyMode={true}
                  isEditModeSupported={false}
                  hideErrorMesageOnReadOnlyMode={true}
                  existingYaml={yaml}
                  height="488px"
                  theme="DARK"
                />
              )
            }
          />
        </Layout.Horizontal>
      </StepContainer>
      <StepContainer stepId={2}>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_900}>
          {getString('ce.cloudIntegration.autoStoppingModal.installComponents.step2')}
        </Text>
      </StepContainer>
      <StepContainer copyCommand={'kubectl apply -f harness-delegate.yml'} />
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800} className={css.onContinue}>
        <String stringID="ce.k8sQuickCreate.applyYaml.continue" useRichText />
      </Text>
      <Layout.Vertical spacing={'xlarge'} className={css.buttonsCtn}>
        <div className={css.infoText}>
          <Text
            icon="info-messaging"
            iconProps={{ size: 20, padding: { right: 'small' }, style: { alignSelf: 'flex-start' } }}
            font={{ variation: FontVariation.BODY }}
            color={Color.GREY_800}
          >
            {getString('ce.k8sQuickCreate.applyYaml.eksClusterInfo')}
          </Text>
        </div>
        <Layout.Horizontal spacing={'medium'}>
          <Button
            icon="chevron-left"
            text={getString('back')}
            variation={ButtonVariation.SECONDARY}
            onClick={/* istanbul ignore next */ () => previousStep?.({ ...prevStepData, yaml })}
          />
          <Button
            rightIcon="chevron-right"
            text={getString('continue')}
            variation={ButtonVariation.PRIMARY}
            onClick={/* istanbul ignore next */ () => nextStep?.({ ...prevStepData, yaml })}
            disabled={yamlLoading}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default DownloadYaml
