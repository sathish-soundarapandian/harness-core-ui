/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { CreateK8sDelegate } from '../CreateKubernetesDelegateWizard/CreateK8sDelegate'
import { CreateDockerDelegate } from '../CreateDockerDelegateWizard/createDockerDelegate'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export interface DelegateTypeSelectorProps {
  onClickBack: () => void
}

export const DelegateSelectorWizard = ({ onClickBack }: DelegateTypeSelectorProps): JSX.Element => {
  const [delegateType, setDelegateType] = React.useState<string>('')
  const [disableBtn, setDisableBtn] = React.useState<boolean>(true)
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()

  const onSuccessHandler = (): void => {
    setDisableBtn(false)
  }
  const conditionalContent = (): JSX.Element => {
    switch (delegateType) {
      case 'kubernetes':
        return <CreateK8sDelegate onSuccessHandler={onSuccessHandler} />
      case 'docker':
        return <CreateDockerDelegate onSuccessHandler={onSuccessHandler} />
      default:
        return <></>
    }
  }
  return (
    <Layout.Vertical width="50%">
      <Container className={css.header}>
        <Text font={{ variation: FontVariation.H2, weight: 'semi-bold' }}>{getString('cd.installDelegate')}</Text>
        <div className={css.borderBottom} />
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.secondaryHeader}>
          {getString('cd.runDelegate')}
        </Text>
        <Button
          onClick={() => setDelegateType('kubernetes')}
          className={cx(css.kubernetes, delegateType === 'kubernetes' ? css.active : undefined)}
        >
          {getString('kubernetesText')}
        </Button>
        <Button
          onClick={() => setDelegateType('docker')}
          className={cx(css.docker, delegateType === 'docker' ? css.active : undefined)}
        >
          {getString('delegate.cardData.docker.name')}
        </Button>
        <div className={css.borderTop} />
      </Container>
      <Layout.Vertical
        flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        height="67.5vh"
        className={css.content}
      >
        <Layout.Vertical width="100%" height="90%" className={css.main}>
          <div className={css.marginTop} />
          {conditionalContent()}
        </Layout.Vertical>
        <Layout.Horizontal
          width={'38%'}
          spacing="medium"
          padding={{ top: 'large', bottom: 'xlarge' }}
          className={css.footer}
        >
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            minimal
            onClick={() => onClickBack()}
          />
          <Button
            text={getString('common.createPipeline')}
            variation={ButtonVariation.PRIMARY}
            rightIcon="chevron-right"
            disabled={disableBtn}
            onClick={() => {
              history.push(
                routes.toPipelineStudio({
                  accountId: accountId,
                  module: 'cd',
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier: '-1'
                })
              )
            }}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
