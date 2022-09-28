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
import { get, set } from 'lodash-es'
import { DelegateSetupDetails, getDelegateTokensPromise, GetDelegateTokensQueryParams } from 'services/cd-ng'
import {
  validateDockerDelegatePromise,
  ValidateDockerDelegateQueryParams,
  generateDockerDelegateYAMLPromise
} from 'services/portal'

import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useStrings } from 'framework/strings'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { StringUtils } from '@common/exports'
import { DelegateTypes } from '@delegates/constants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, CDOnboardingActions } from '@common/constants/TrackingConstants'
import StepProcessing from '../CreateKubernetesDelegateWizard/StepProcessing'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export interface CreateDockerDelegateProps {
  onSuccessHandler: () => void
  successRef: React.MutableRefObject<(() => void) | null>
  delegateNameRef: React.MutableRefObject<string | undefined>
}

export const CreateDockerDelegate = ({
  onSuccessHandler,
  successRef,
  delegateNameRef
}: CreateDockerDelegateProps): JSX.Element => {
  const [yaml, setYaml] = React.useState<string>('')
  const [delegateName, setDelegateName] = React.useState<string>('')
  const [isYamlVisible, setYamlVisible] = React.useState<boolean>(false)
  const [showPageLoader, setLoader] = React.useState<boolean>(true)

  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const dockerFileName = 'docker-compose.yml'
  const dockerComposeCommand = `docker-compose -f ${dockerFileName} up -d`
  const delegateType = DelegateTypes.DOCKER

  const { trackEvent } = useTelemetry()

  const onDownload = (): void => {
    const content = new Blob([yaml as BlobPart], { type: 'data:text/plain;charset=utf-8' })
    /* istanbul ignore else */ if (linkRef?.current) {
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = dockerFileName
      linkRef.current.click()
    }
  }

  const generateDockerDelegate = async (): Promise<void> => {
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
      const validateDockerDelegateNameResponse = await validateDockerDelegatePromise({
        queryParams: {
          accountId,
          projectIdentifier,
          orgIdentifier,
          delegateName: delegateName1,
          tokenName: delegateToken
        } as ValidateDockerDelegateQueryParams
      })
      const isNameUnique = !get(validateDockerDelegateNameResponse, 'responseMessages[0]', null)
      if (!isNameUnique) {
        showError(getString('somethingWentWrong'))
      } else {
        const createParams = {
          name: delegateName1,
          identifier: StringUtils.getIdentifierFromName(delegateName1),
          description: '',
          tokenName: delegateToken
        } as DelegateSetupDetails

        if (projectIdentifier) {
          set(createParams, 'projectIdentifier', projectIdentifier)
        }
        if (orgIdentifier) {
          set(createParams, 'orgIdentifier', orgIdentifier)
        }
        set(createParams, 'delegateType', delegateType)

        trackEvent(CDOnboardingActions.SetupOnboardingDelegate, {
          category: Category.DELEGATE,
          data: createParams
        })

        const dockerYaml = (await generateDockerDelegateYAMLPromise({
          queryParams: {
            accountId
          },
          body: {
            ...createParams
          }
        })) as any
        if (get(dockerYaml, 'responseMessages', []).length) {
          showError(getString('somethingWentWrong'))
        } else {
          setYaml(dockerYaml)
          setLoader(false)
          onSuccessHandler()
          trackEvent(CDOnboardingActions.SaveCreateOnboardingDelegate, {
            category: Category.DELEGATE,
            data: { ...createParams, generatedYaml: dockerYaml }
          })
        }
      }
    }
  }
  useEffect(() => {
    generateDockerDelegate()
  }, [])

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
                    trackEvent(CDOnboardingActions.DownloadOnboardingYAML, {
                      category: Category.DELEGATE,
                      data: {
                        delegateName: delegateName
                      }
                    })
                    onDownload()
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
                      fileName={dockerFileName}
                      isReadOnlyMode={true}
                      isEditModeSupported={false}
                      hideErrorMesageOnReadOnlyMode={true}
                      existingYaml={yaml}
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
                  {getString('delegates.delegateCreation.docker.verifyDesc1')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal className={css.descriptionVerificationWrapper}>
                <Text font="normal" width={408}>
                  {getString('delegates.delegateCreation.docker.verifyDesc2')}
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
                  <Text style={{ marginRight: 'var(--spacing-xlarge)' }} font="small">
                    {`$ ${dockerComposeCommand}`}
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
              <StepProcessing name={delegateName} delegateType={delegateType} replicas={1} successRef={successRef} />
            </Layout.Vertical>
          </li>
        </ul>
      </Layout.Vertical>
      <a className="hide" ref={linkRef} target={'_blank'} />
    </>
  )
}
