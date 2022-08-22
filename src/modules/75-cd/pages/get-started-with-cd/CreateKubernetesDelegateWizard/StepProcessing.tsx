/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, FC } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Icon, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import { useGetDelegatesHeartbeatDetailsV2 } from 'services/portal'
import { POLL_INTERVAL, TIME_OUT } from '@delegates/constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import DelegateInstallationError from '@delegates/components/CreateDelegate/components/DelegateInstallationError/DelegateInstallationError'
import delegateErrorURL from '../../home/images/delegate-error.svg'
import delegateSuccessURL from '../../home/images/cd-delegates-success.svg'
import css from './CreateK8sDelegate.module.scss'

interface StepDelegateData {
  delegateType?: string
  name?: string
  replicas?: number
  onSuccessHandler?: () => void
}

const StepProcessing: FC<StepDelegateData> = props => {
  const { name, replicas, onSuccessHandler, delegateType } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isHeartBeatVerified, setVerifyHeartBeat] = useState(false)
  const [counter, setCounter] = useState(0)
  const {
    data,
    loading,
    refetch: verifyHeartBeat
  } = useGetDelegatesHeartbeatDetailsV2({
    queryParams: {
      accountId,
      projectId: projectIdentifier,
      orgId: orgIdentifier,
      delegateName: name
    },
    debounce: 200
  })
  const [isTroubleShootVisible, setTroubleShootVisible] = React.useState(false)

  React.useEffect(() => {
    if (
      !loading &&
      (!data || (data && data?.resource?.numberOfConnectedDelegates !== replicas)) &&
      !showError &&
      !showSuccess
    ) {
      const timerId = window.setTimeout(() => {
        setCounter(counter + POLL_INTERVAL)
        verifyHeartBeat()
      }, POLL_INTERVAL)

      if (counter >= TIME_OUT * (replicas || 1)) {
        window.clearTimeout(timerId)
        setVerifyHeartBeat(true)
        setShowError(true)
      }

      return () => {
        window.clearTimeout(timerId)
      }
    } else if (data?.resource?.numberOfConnectedDelegates === replicas) {
      setVerifyHeartBeat(true)
      setShowSuccess(true)
      onSuccessHandler && onSuccessHandler()
    }
  }, [data, verifyHeartBeat, loading, onSuccessHandler])

  if (showError) {
    return (
      <Layout.Vertical className={css.iconPadding}>
        <Layout.Horizontal spacing="medium" className={css.checkItemsWrapper}>
          <Icon size={10} color={Color.RED_400} name="circle-cross" className={css.checkIcon} />
          <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.heartbeatReceived')}</Text>
          <Icon size={10} color={Color.GREY_200} name="command-artifact-check" className={css.checkIcon} />
          <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.delegateInstalled')}</Text>
        </Layout.Horizontal>
        <div className={css.spacing} />

        <Layout.Vertical className={css.danger}>
          <Layout.Horizontal className={css.textPadding}>
            <Icon name="danger-icon" size={25} className={css.iconPadding} />
            <Text className={css.dangerColor} font={{ variation: FontVariation.H6 }} color={Color.RED_600}>
              Delegate Failed to connect to Harness
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal width={'100%'}>
            <Layout.Vertical width={'83%'}>
              <Text className={css.textPadding}>
                Harness Delegate Failed to connect to our Harness SaaS. Please make sure the infrastructure the delegate
                is installed on can reach https://app.harness.io
              </Text>
              <Text className={css.textPadding}>
                The Delegate failed to come up on the cluster, please check to see if the pods are healthy or could be
                scheduled on the cluster
              </Text>
              <Text
                className={css.textPadding}
                onClick={() => setTroubleShootVisible(!isTroubleShootVisible)}
                color={Color.BLUE_700}
              >
                Troubleshoot
              </Text>
            </Layout.Vertical>
            <img className={css.buildImg} title={getString('common.getStarted.buildPipeline')} src={delegateErrorURL} />
          </Layout.Horizontal>
        </Layout.Vertical>

        {isTroubleShootVisible ? (
          <div className={css.troubleShoot}>
            <DelegateInstallationError delegateType={delegateType} showDelegateInstalledMessage={false} />
          </div>
        ) : null}
      </Layout.Vertical>
    )
  } else if (showSuccess && isHeartBeatVerified) {
    return (
      <Layout.Vertical className={css.iconPadding}>
        <Layout.Horizontal spacing="medium" className={css.checkItemsWrapper}>
          <Icon size={10} color={Color.GREEN_500} name="command-artifact-check" className={css.checkIcon} />
          <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.heartbeatReceived')}</Text>
          <Icon size={10} color={Color.GREEN_500} name="command-artifact-check" className={css.checkIcon} />
          <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.delegateInstalled')}</Text>
        </Layout.Horizontal>
        <div className={css.spacing} />

        <Layout.Vertical className={css.success}>
          <Layout.Horizontal width={'100%'}>
            <img
              className={css.buildImg}
              title={getString('common.getStarted.buildPipeline')}
              src={delegateSuccessURL}
            />
            <Layout.Vertical width={'83%'}>
              <Text className={css.successPadding} color={Color.GREEN_900}>
                Great! You have successfully installed the Delegate.
              </Text>
              <Text className={css.textPadding} color={Color.GREEN_900}>
                Please proceed to creating your first pipeline
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    )
  }
  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Icon size={16} name="steps-spinner" style={{ marginRight: '12px' }} />
        <Text font="small">{getString('delegate.successVerification.checkDelegateInstalled')}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default StepProcessing
