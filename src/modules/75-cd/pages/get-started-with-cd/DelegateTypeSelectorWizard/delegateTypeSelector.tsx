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
import { CreateK8sDelegate } from '../CreateKubernetesDelegateWizard/CreateK8sDelegate'
import { CreateDockerDelegate } from '../CreateDockerDelegateWizard/createDockerDelegate'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export interface DelegateTypeSelector {
  onClickBack: () => void
}

export const DelegateTypeSelector = ({ onClickBack }: DelegateTypeSelector) => {
  const history = useHistory()
  const [delegateType, setDelegateType] = React.useState<string>('')
  const [disableBtn, setDisableBtn] = React.useState(true)

  const onSuccessHandler = (): void => {
    setDisableBtn(false)
  }

  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()

  const conditionalContent = (): any => {
    switch (delegateType) {
      case 'kubernetes':
        return <CreateK8sDelegate onSuccessHandler={onSuccessHandler} />
      case 'docker':
        return <CreateDockerDelegate onSuccessHandler={onSuccessHandler} />
      default:
        break
    }
  }

  return (
    <Layout.Vertical width="50%">
      <Container className={css.header}>
        <Text font={{ variation: FontVariation.H2, weight: 'bold' }}>Install Delegate</Text>
        <div className={css.borderBottom} />
        <Text font={{ variation: FontVariation.H4 }} className={css.secondaryHeader}>
          How do you want to run the Delegate
        </Text>
        <Button
          onClick={() => setDelegateType('kubernetes')}
          className={cx(css.kubernetes, delegateType === 'kubernetes' ? css.active : undefined)}
        >
          Kubernetes
        </Button>
        <Button
          onClick={() => setDelegateType('docker')}
          className={cx(css.docker, delegateType === 'docker' ? css.active : undefined)}
        >
          Docker
        </Button>
        <div className={css.borderTop} />
      </Container>
      <Layout.Vertical
        flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        height="68.5vh"
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
            text="Back"
            icon="chevron-left"
            minimal
            onClick={() => onClickBack()}
          />
          <Button
            text="Create Pipeline"
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
