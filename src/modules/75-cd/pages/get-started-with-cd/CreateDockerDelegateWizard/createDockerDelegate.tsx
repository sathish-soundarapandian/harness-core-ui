/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { isEmpty, set } from 'lodash-es'
import { DelegateSetupDetails, GetDelegateTokensQueryParams, useGetDelegateTokens } from 'services/cd-ng'
import {
  useGenerateDockerDelegateYAML,
  validateDockerDelegatePromise,
  ValidateDockerDelegateQueryParams
} from 'services/portal'

import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useStrings } from 'framework/strings'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import StepProcessing from '../CreateKubernetesDelegateWizard/StepProcessing'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export interface CreateDockerDelegateProps {
  onSuccessHandler: () => void
}

export const CreateDockerDelegate = ({ onSuccessHandler }: CreateDockerDelegateProps) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()

  const [token, setToken] = React.useState<any>()

  const [yaml, setYaml] = React.useState<any>('')

  const { data: tokensResponse, refetch: getTokens } = useGetDelegateTokens({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      status: 'ACTIVE'
    } as GetDelegateTokensQueryParams,
    lazy: true
  })

  const [isNameVerified, setNameVerified] = React.useState(false)

  const prevStepData = {
    name: 'sample-docker-delegate-t',
    identifier: 'sampledockerdelegatet',
    description: '',
    tokenName: token?.name
  }

  const validateName = async () => {
    const response = (await validateDockerDelegatePromise({
      queryParams: {
        accountId,
        projectIdentifier,
        orgIdentifier,
        delegateName: 'sample-docker-delegate-t',
        tokenName: token?.name
      } as ValidateDockerDelegateQueryParams
    })) as any
    const isNameUnique = !response?.responseMessages[0]

    if (isNameUnique) {
      setNameVerified(true)
    } else {
      showError(getString('delegates.delegateNameNotUnique'))
    }
  }

  const { mutate: getDockerYaml } = useGenerateDockerDelegateYAML({
    queryParams: {
      accountId
    }
  })

  const fetchDockerYaml = async () => {
    const createParams = { ...prevStepData } as DelegateSetupDetails

    if (projectIdentifier) {
      set(createParams, 'projectIdentifier', projectIdentifier)
    }
    if (orgIdentifier) {
      set(createParams, 'orgIdentifier', orgIdentifier)
    }
    set(createParams, 'delegateType', 'DOCKER')
    const dockerYaml = (await getDockerYaml(createParams)) as any
    setYaml(dockerYaml)
  }

  React.useEffect(() => {
    if (isNameVerified) fetchDockerYaml()
  }, [isNameVerified])

  useEffect(() => {
    setToken(tokensResponse?.resource?.[0])
  }, [tokensResponse])

  useEffect(() => {
    getTokens()
  }, [])

  useEffect(() => {
    if (token) {
      validateName()
    }
  }, [token])

  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const dockerFileName = 'docker-compose.yml'
  const dockerComposeCommand = `docker-compose -f ${dockerFileName} up -d`
  const [isYamlVisible, setYamlVisible] = React.useState(false)

  const onDownload = () => {
    const content = new Blob([yaml as BlobPart], { type: 'data:text/plain;charset=utf-8' })
    if (linkRef?.current) {
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = dockerFileName
      linkRef.current.click()
    }
  }
  const [showPageLoader, setLoader] = React.useState(true)

  React.useEffect(() => {
    if (!isEmpty(yaml)) {
      setLoader(false)
      onSuccessHandler()
    }
  }, [yaml])

  if (showPageLoader) {
    return <ContainerSpinner className={css.spinner} />
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
              {!isEmpty(yaml) ? (
                <StepProcessing name="sample-docker-delegate-t" delegateType="DOCKER" replicas={1} />
              ) : null}
            </Layout.Vertical>
          </li>
        </ul>
      </Layout.Vertical>
      <a className="hide" ref={linkRef} target={'_blank'} />
    </>
  )
}
