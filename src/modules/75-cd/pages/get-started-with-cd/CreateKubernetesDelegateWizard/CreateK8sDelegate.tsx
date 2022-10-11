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
import { get, isEmpty, set } from 'lodash-es'
import { StringUtils } from '@common/exports'
import {
  DelegateType,
  k8sPermissionType
} from '@delegates/components/CreateDelegate/K8sDelegate/DelegateSetupStep/DelegateSetupStep.types'
import { DelegateSetupDetails, getDelegateTokensPromise, GetDelegateTokensQueryParams } from 'services/cd-ng'
import {
  DelegateSizeDetails,
  generateKubernetesYamlPromise,
  GenerateKubernetesYamlQueryParams,
  useGetDelegateSizes,
  validateKubernetesYamlPromise
} from 'services/portal'
import { DelegateSize } from '@delegates/constants'
import { DelegateFileName } from '@delegates/components/CreateDelegate/K8sDelegate/K8sDelegate.constants'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useStrings } from 'framework/strings'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, CDOnboardingActions } from '@common/constants/TrackingConstants'
import StepProcessing from './StepProcessing'
import type { DelegateSuccessHandler } from '../CDOnboardingUtils'
import css from './CreateK8sDelegate.module.scss'

export interface CreateK8sDelegateProps {
  onSuccessHandler: (data: DelegateSuccessHandler) => void
  handleHelpPanel: () => void
  successRef: React.MutableRefObject<(() => void) | null>
  delegateNameRef: React.MutableRefObject<string | undefined>
}

export const CreateK8sDelegate = ({
  onSuccessHandler,
  handleHelpPanel,
  successRef,
  delegateNameRef
}: CreateK8sDelegateProps): JSX.Element => {
  const [delegateName, setDelegateName] = React.useState<string>('')
  const [isYamlVisible, setYamlVisible] = React.useState<boolean>(false)
  const [showPageLoader, setLoader] = React.useState<boolean>(true)

  const [visibleYaml, setVisibleYaml] = React.useState<string>('')
  const [replicas, setReplicas] = React.useState<number>(0)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const delegateType = DelegateType.KUBERNETES
  const delegateFileName = DelegateFileName.k8sFileName

  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()

  const { data: delegateSizes } = useGetDelegateSizes({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const onDownload = (): void => {
    /* istanbul ignore else */ if (linkRef?.current) {
      const content = new Blob([visibleYaml as BlobPart], { type: 'data:text/plain;charset=utf-8' })
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = delegateFileName
      linkRef.current.click()
    }
  }

  const delegateSizeMappings: DelegateSizeDetails[] | undefined = get(delegateSizes, 'resource')

  const generateSampleDelegate = async (): Promise<void> => {
    const delegateTokens = await getDelegateTokensPromise({
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        status: 'ACTIVE'
      } as GetDelegateTokensQueryParams
    })
    if (get(delegateTokens, 'responseMessages', []).length) {
      showError(getString('somethingWentWrong'))
    } else {
      const delegateToken = get(delegateTokens, 'resource[0].name')
      const delegateName1 = `sample-${uuid()}-delegate`
      setDelegateName(delegateName1)
      delegateNameRef.current = delegateName1
      trackEvent(CDOnboardingActions.StartOnboardingDelegateCreation, {
        category: Category.DELEGATE,
        data: {
          delegateName: delegateName1,
          delegateType: delegateType
        }
      })
      const createParams1 = {
        name: delegateName1,
        identifier: StringUtils.getIdentifierFromName(delegateName1),
        description: '',
        delegateType: delegateType,
        size: DelegateSize.LAPTOP,
        sesssionIdentifier: '',
        tokenName: delegateToken,
        k8sConfigDetails: {
          k8sPermissionType: k8sPermissionType.CLUSTER_ADMIN,
          namespace: ''
        },
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier
      }
      const createKubernetesYamlResponse = await validateKubernetesYamlPromise({
        queryParams: { accountId, projectId: projectIdentifier, orgId: orgIdentifier },
        body: {
          ...(createParams1 as DelegateSetupDetails)
        }
      })
      if (get(createKubernetesYamlResponse, 'responseMessages', []).length) {
        showError(getString('somethingWentWrong'))
      } else {
        trackEvent(CDOnboardingActions.SetupOnboardingDelegate, {
          category: Category.DELEGATE,
          data: createParams1
        })
        const delegateYaml = createKubernetesYamlResponse.resource
        /* istanbul ignore else */ if (delegateSizeMappings) {
          const delegateSize: DelegateSizeDetails =
            delegateSizeMappings.find((item: DelegateSizeDetails) => item.size === createParams1.size) ||
            delegateSizeMappings[0]
          /* istanbul ignore else */ if (delegateSize) {
            const stepPrevData = {
              delegateYaml,
              name: delegateName1,
              replicas: get(delegateSize, 'replicas')
            }
            setReplicas(get(delegateSize, 'replicas') as number)
            const data = get(stepPrevData, 'delegateYaml', {})
            set(data, 'delegateType', delegateType)
            const generatedYamlResponse = await generateKubernetesYamlPromise({
              queryParams: {
                accountId,
                orgId: orgIdentifier,
                projectId: projectIdentifier,
                fileFormat: 'text/plain'
              } as GenerateKubernetesYamlQueryParams,
              body: {
                ...(data as DelegateSetupDetails)
              }
            })
            setVisibleYaml(generatedYamlResponse as any)
            setLoader(false)
            onSuccessHandler({ delegateCreated: true })
            trackEvent(CDOnboardingActions.SaveCreateOnboardingDelegate, {
              category: Category.DELEGATE,
              data: { ...stepPrevData, generatedYaml: generatedYamlResponse }
            })
          }
        }
      }
    }
  }
  useEffect(() => {
    /* istanbul ignore else */ if (!isEmpty(delegateSizes)) generateSampleDelegate()
    /* istanbul ignore else */ if (get(delegateSizes, 'responseMessages', []).length) {
      showError(getString('somethingWentWrong'))
    }
  }, [delegateSizes])

  if (showPageLoader) {
    return (
      <Container className={css.spinner}>
        <PageSpinner message={getString('cd.loadingDelegate')} />
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
                    trackEvent(CDOnboardingActions.DownloadOnboardingYAML, {
                      category: Category.DELEGATE,
                      data: {
                        delegateName: delegateName
                      }
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
                      existingYaml={visibleYaml}
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
                <Text
                  font="normal"
                  width={408}
                  color={Color.PRIMARY_7}
                  onClick={() => handleHelpPanel()}
                  className={css.hover}
                >
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
              <StepProcessing
                name={delegateName}
                delegateType={delegateType}
                replicas={replicas}
                successRef={successRef}
                onSuccessHandler={onSuccessHandler}
              />
            </Layout.Vertical>
          </li>
        </ul>
      </Layout.Vertical>
      <a className="hide" ref={linkRef} target={'_blank'} />
    </>
  )
}
