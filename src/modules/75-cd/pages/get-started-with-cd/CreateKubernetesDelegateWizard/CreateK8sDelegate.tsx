/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { Button, Container, Layout, PageSpinner, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { isEmpty, set } from 'lodash-es'
import { StringUtils } from '@common/exports'
import {
  DelegateType,
  k8sPermissionType
} from '@delegates/components/CreateDelegate/K8sDelegate/DelegateSetupStep/DelegateSetupStep.types'
import {
  DelegateSetupDetails,
  DelegateTokenDetails,
  GetDelegateTokensQueryParams,
  useGetDelegateTokens
} from 'services/cd-ng'
import {
  DelegateSizeDetails,
  GenerateKubernetesYamlQueryParams,
  useGenerateKubernetesYaml,
  useGetDelegateSizes,
  useValidateKubernetesYaml
} from 'services/portal'
import { DelegateSize } from '@delegates/constants'
import { DelegateFileName } from '@delegates/components/CreateDelegate/K8sDelegate/K8sDelegate.constants'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useStrings } from 'framework/strings'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import StepProcessing from './StepProcessing'
import css from './CreateK8sDelegate.module.scss'

export interface CreateK8sDelegateProps {
  onSuccessHandler: () => void
  trackEventRef: React.MutableRefObject<(() => void) | null>
}

export const CreateK8sDelegate = ({ onSuccessHandler, trackEventRef }: CreateK8sDelegateProps): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const delegateType = DelegateType.KUBERNETES
  const [token, setToken] = React.useState<DelegateTokenDetails>()
  const [delegateName, setDelegateName] = React.useState<string>('')
  const [yaml, setYaml] = React.useState<any>()
  const [generatedYaml, setGeneratedYaml] = React.useState<string>()
  const [isYamlVisible, setYamlVisible] = React.useState<boolean>(false)
  const [showPageLoader, setLoader] = React.useState<boolean>(true)
  const delegateFileName = DelegateFileName.k8sFileName

  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const { getString } = useStrings()
  const { showError } = useToaster()

  const createParams = {
    name: delegateName,
    identifier: StringUtils.getIdentifierFromName(delegateName),
    description: '',
    delegateType: delegateType,
    size: DelegateSize.LAPTOP,
    sesssionIdentifier: '',
    tokenName: token?.name,
    k8sConfigDetails: {
      k8sPermissionType: k8sPermissionType.CLUSTER_ADMIN,
      namespace: ''
    },
    projectIdentifier: projectIdentifier,
    orgIdentifier: orgIdentifier
  }

  const {
    data: tokensResponse,
    refetch: getTokens,
    error: tokensError
  } = useGetDelegateTokens({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      status: 'ACTIVE'
    } as GetDelegateTokensQueryParams,
    lazy: true
  })

  const { data: delegateSizes, error: delegateSizeError } = useGetDelegateSizes({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const { mutate: createKubernetesYaml } = useValidateKubernetesYaml({
    queryParams: { accountId, projectId: projectIdentifier, orgId: orgIdentifier }
  })
  const { mutate: downloadKubernetesYaml } = useGenerateKubernetesYaml({
    queryParams: {
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      fileFormat: 'text/plain'
    } as GenerateKubernetesYamlQueryParams
  })
  const { trackEvent } = useTelemetry()

  const fetchYaml = async (): Promise<void> => {
    try {
      const response = await createKubernetesYaml({
        ...(createParams as DelegateSetupDetails)
      })
      if ((response as any)?.responseMessages.length) {
        showError(getString('somethingWentWrong'))
      } else {
        const delegateYaml = response.resource
        if (delegateSizeMappings) {
          const delegateSize: DelegateSizeDetails =
            delegateSizeMappings.find((item: DelegateSizeDetails) => item.size === createParams.size) ||
            delegateSizeMappings[0]
          if (delegateSize) {
            const stepPrevData = {
              delegateYaml,
              name: delegateName,
              replicas: delegateSize?.replicas
            }
            setYaml(stepPrevData)
          }
        }
      }
    } catch (e) {
      // showError(getString('delegates.delegateNameNotUnique'))
      showError(getString('somethingWentWrong'))
    }
  }
  const onGenYaml = async (): Promise<void> => {
    const data = yaml?.delegateYaml || {}
    set(data, 'delegateType', delegateType)
    const response = await downloadKubernetesYaml(data as DelegateSetupDetails)
    setGeneratedYaml(response as any)
  }

  const onDownload = (): void => {
    if (linkRef?.current) {
      const content = new Blob([generatedYaml as BlobPart], { type: 'data:text/plain;charset=utf-8' })
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = delegateFileName
      linkRef.current.click()
    }
  }

  const delegateSizeMappings: DelegateSizeDetails[] | undefined = delegateSizes?.resource

  useEffect(() => {
    if (tokensError || delegateSizeError) showError({ Error: getString('somethingWentWrong') })
  }, [tokensError, delegateSizeError, showError, getString])

  useEffect(() => {
    getTokens()
    setDelegateName(`sample-${uuid()}-delegate`)
  }, [])

  useEffect(() => {
    if (!isEmpty(tokensResponse)) setToken(tokensResponse?.resource?.[0])
  }, [tokensResponse])

  useEffect(() => {
    if (token && !isEmpty(delegateSizeMappings)) {
      trackEvent(DelegateActions.SetupDelegate, {
        category: Category.DELEGATE,
        data: createParams
      })
      fetchYaml()
    }
  }, [token, delegateSizeMappings])

  React.useEffect(() => {
    if (!isEmpty(yaml)) onGenYaml()
  }, [yaml])

  React.useEffect(() => {
    if (!isEmpty(generatedYaml)) {
      setLoader(false)
      onSuccessHandler()
    }
  }, [generatedYaml, onSuccessHandler])

  const trackCreateEvent = (): void => {
    trackEvent(DelegateActions.SaveCreateDelegate, {
      category: Category.DELEGATE,
      data: { ...yaml, generatedYaml: generatedYaml }
    })
  }
  trackEventRef.current = trackCreateEvent

  if (showPageLoader) {
    return (
      <Container className={css.spinner}>
        <PageSpinner message="Creating a Delegate..." />
      </Container>
    )
  }
  return (
    <>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
          {getString('cd.instructionsDelegate')}
        </Text>
        <ul className={css.progress}>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.H6, weight: 'semi-bold' }} className={css.subHeading}>
                {getString('cd.downloadYAML')}
              </Text>
              <Layout.Horizontal className={css.spacing}>
                <Button
                  id="stepReviewScriptDownloadYAMLButton"
                  icon="arrow-down"
                  text={getString('delegates.downloadYAMLFile')}
                  className={css.downloadButton}
                  onClick={() => {
                    onDownload()
                    trackEvent(DelegateActions.DownloadYAML, {
                      category: Category.DELEGATE
                    })
                  }}
                  outlined
                />
                <Button
                  text={getString('cd.previewYAML')}
                  className={cx(css.previewButton, isYamlVisible ? css.active : undefined)}
                  onClick={() => {
                    setYamlVisible(!isYamlVisible)
                  }}
                  outlined
                />
              </Layout.Horizontal>
              <Layout.Vertical width="568px">
                {isYamlVisible ? (
                  <div className={css.collapseDiv}>
                    <YamlBuilder
                      entityType="Delegates"
                      fileName={delegateFileName}
                      isReadOnlyMode={true}
                      isEditModeSupported={false}
                      hideErrorMesageOnReadOnlyMode={true}
                      existingYaml={generatedYaml}
                      showSnippetSection={false}
                      height="462px"
                      theme="DARK"
                    />
                  </div>
                ) : null}
              </Layout.Vertical>
              <div className={css.spacing} />
            </Layout.Vertical>
          </li>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Layout.Vertical className={css.panelLeft}>
              <Text font={{ variation: FontVariation.H6, weight: 'semi-bold' }} className={css.subHeading}>
                {getString('cd.installCluster')}
              </Text>
              <Layout.Horizontal>
                <Text font="normal" width={408} color={Color.PRIMARY_7}>
                  {getString('cd.checkCluster')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal className={css.descriptionVerificationWrapper}>
                <Text font="normal" width={408}>
                  {getString('cd.delegateInstallCommand')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal className={css.verificationFieldWrapper}>
                <Container
                  intent="primary"
                  font={{
                    align: 'center'
                  }}
                  flex
                  className={css.verificationField}
                >
                  <Text style={{ marginRight: 'var(--spacing-xlarge)', paddingLeft: '5px' }} font="small">
                    {getString('delegate.verifyDelegateYamlCmnd')}
                  </Text>
                  <CopyToClipboard content={getString('delegate.verifyDelegateYamlCmnd').slice(2)} showFeedback />
                </Container>
              </Layout.Horizontal>
              <div className={css.spacing} />
            </Layout.Vertical>
          </li>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.H6, weight: 'semi-bold' }} className={css.subHeading}>
                {getString('cd.delegateConnectionWait')}
              </Text>
              {!isEmpty(yaml) ? (
                <StepProcessing name={delegateName} delegateType={delegateType} replicas={yaml?.replicas} />
              ) : null}
            </Layout.Vertical>
          </li>
        </ul>
      </Layout.Vertical>
      <a className="hide" ref={linkRef} target={'_blank'} />
    </>
  )
}
