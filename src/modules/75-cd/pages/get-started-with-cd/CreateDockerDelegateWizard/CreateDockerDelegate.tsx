/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, PageSpinner, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { get, isEmpty, set } from 'lodash-es'
import { DelegateSetupDetails, getDelegateTokensPromise, GetDelegateTokensQueryParams } from 'services/cd-ng'
import {
  validateDockerDelegatePromise,
  ValidateDockerDelegateQueryParams,
  generateDockerDelegateYAMLPromise,
  createDelegateGroupPromise
} from 'services/portal'

import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useStrings } from 'framework/strings'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { StringUtils } from '@common/exports'
import { DelegateTypes } from '@delegates/constants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, CDOnboardingActions } from '@common/constants/TrackingConstants'
import StepProcessing from '../CreateKubernetesDelegateWizard/StepProcessing'
import { DelegateSuccessHandler, generateDelegateName } from '../CDOnboardingUtils'
import { RightDrawer } from '../ConfigureService/ManifestRepoTypes/RightDrawer/RightDrawer'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export interface CreateDockerDelegateProps {
  onSuccessHandler: (data: DelegateSuccessHandler) => void
  successRef: React.MutableRefObject<(() => void) | null>
  delegateNameRef: React.MutableRefObject<string | undefined>
}

export const CreateDockerDelegate = ({
  onSuccessHandler,
  successRef,
  delegateNameRef
}: CreateDockerDelegateProps): JSX.Element => {
  const {
    state: { delegate: delegateData }
  } = useCDOnboardingContext()
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
      const existingDelegate = get(delegateData, 'environmentEntities.delegate', null) // delegateName from context
      const delegateToken = get(delegateTokens, 'resource[0].name')
      const delegateName1 = existingDelegate || generateDelegateName()
      setDelegateName(delegateName1)
      delegateNameRef.current = delegateName1
      !existingDelegate &&
        trackEvent(CDOnboardingActions.StartOnboardingDelegateCreation, {
          category: Category.DELEGATE,
          data: {
            delegateName: delegateName1,
            delegateType: delegateType
          }
        })
      const validateDockerDelegateNameResponse =
        !existingDelegate &&
        (await validateDockerDelegatePromise({
          queryParams: {
            accountId,
            projectIdentifier,
            orgIdentifier,
            delegateName: delegateName1,
            tokenName: delegateToken
          } as ValidateDockerDelegateQueryParams
        }))
      const isNameUnique =
        !get(validateDockerDelegateNameResponse, 'responseMessages[0]', null) || Boolean(existingDelegate)
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

        !existingDelegate &&
          trackEvent(CDOnboardingActions.SetupOnboardingDelegate, {
            category: Category.DELEGATE,
            data: createParams
          })

        const dockerYaml =
          delegateData?.delegateYAMLResponse ||
          ((await generateDockerDelegateYAMLPromise({
            queryParams: {
              accountId
            },
            body: {
              ...createParams
            }
          })) as any)
        if (get(dockerYaml, 'responseMessages', []).length) {
          const errorMsg = dockerYaml.responseMessages?.[0]?.message || getString('somethingWentWrong')
          showError(errorMsg)
        } else {
          setYaml(dockerYaml)
          setLoader(false)
          !existingDelegate &&
            (await createDelegateGroupPromise({
              queryParams: {
                accountId
              },
              body: {
                ...createParams,
                delegateType
              }
            }))

          onSuccessHandler({ delegateCreated: true, delegateYamlResponse: dockerYaml })
          !existingDelegate &&
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
        <PageSpinner
          message={
            isEmpty(delegateData?.delegateYAMLResponse)
              ? getString('cd.loadingDelegate')
              : getString('cd.fetchingDelegate')
          }
        />
      </Container>
    )
  }

  return (
    <>
      <Layout.Vertical className={css.marginBottomClass}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
          {getString('cd.instructionsDelegate')}
        </Text>
        <ul className={css.progress}>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
                {getString('connectors.ceK8.providePermissionsStep.downloadYamlBtnText')}
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
              {isYamlVisible ? (
                <>
                  <RightDrawer isOpen={isYamlVisible} setIsOpen={setYamlVisible}>
                    <div className={css.collapseDiv}>
                      <YamlBuilder
                        entityType="Delegates"
                        fileName={dockerFileName}
                        isReadOnlyMode={true}
                        isEditModeSupported={false}
                        hideErrorMesageOnReadOnlyMode={true}
                        existingYaml={yaml}
                        height="100vh"
                      />
                    </div>
                  </RightDrawer>
                </>
              ) : null}
              <div className={css.spacing} />
            </Layout.Vertical>
          </li>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Layout.Vertical className={css.panelLeft}>
              <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
                {getString('cd.installCluster')}
              </Text>
              <Layout.Horizontal>
                <Text font="normal" width={408} color={Color.PRIMARY_7}>
                  {getString('delegates.delegateCreation.docker.verifyDesc1')}
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
                  <Text style={{ marginRight: 'var(--spacing-xlarge)' }} font="small">
                    {`$ ${dockerComposeCommand}`}
                  </Text>
                  <CopyToClipboard content={dockerComposeCommand} showFeedback />
                </Container>
              </Layout.Horizontal>
              <div className={css.spacing} />
            </Layout.Vertical>
          </li>
          <li className={`${css.progressItem} ${css.progressItemActive}`}>
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.subHeading}>
                {getString('cd.delegateConnectionWait')}
              </Text>
              <StepProcessing
                name={delegateName}
                delegateType={delegateType}
                replicas={1}
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
