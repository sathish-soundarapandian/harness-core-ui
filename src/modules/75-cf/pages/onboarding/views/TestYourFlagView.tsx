/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Container, Text, Heading, Layout, Icon } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Classes, Switch } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import routes from '@common/RouteDefinitions'
import { ApiKey, FeatureFlagRequestRequestBody, useGetAllFeatures } from 'services/cf'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { TestFlagInfoView } from './TestFlagInfoView'
import css from './TestYourFlagView.module.scss'

const POLLING_INTERVAL_IN_MS = 3000

export interface TestYourFlagViewProps {
  flagInfo: FeatureFlagRequestRequestBody
  language: PlatformEntry
  apiKey: ApiKey
  environmentIdentifier: string | undefined
  testDone: boolean
  setTestDone: React.Dispatch<React.SetStateAction<boolean>>
}

export const TestYourFlagView: React.FC<TestYourFlagViewProps> = props => {
  const { flagInfo, environmentIdentifier } = props
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: environmentIdentifier as string
  })
  const queryParams = useMemo(
    () => ({
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      identifier: flagInfo.identifier,
      metrics: true
    }),
    [projectIdentifier, environmentIdentifier, accountIdentifier, orgIdentifier, flagInfo.identifier]
  )
  const { data, loading, refetch } = useGetAllFeatures({
    lazy: true,
    queryParams
  })
  const [checked, setChecked] = useState(false)
  const timeoutIdRef = useRef<number>()

  let link = routes.toCFFeatureFlagsDetail({
    orgIdentifier: orgIdentifier as string,
    projectIdentifier: projectIdentifier as string,
    featureFlagIdentifier: flagInfo.identifier,
    accountId: accountIdentifier
  })
  link = location.hash.startsWith('#/account/') ? '/#' + link : link

  useEffect(() => {
    if (!props.testDone) {
      const pollingFn = (): void => {
        if (!loading) {
          refetch().finally(() => {
            clearTimeout(timeoutIdRef.current)
            timeoutIdRef.current = window.setTimeout(pollingFn, POLLING_INTERVAL_IN_MS)
          })
        } else {
          clearTimeout(timeoutIdRef.current)
          timeoutIdRef.current = window.setTimeout(pollingFn, POLLING_INTERVAL_IN_MS)
        }
      }
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = window.setTimeout(pollingFn, POLLING_INTERVAL_IN_MS)

      return () => clearTimeout(timeoutIdRef.current)
    }
  }, [loading, refetch, props.testDone])

  useEffect(() => {
    if (!props.testDone && data) {
      if (data.features?.[0].status?.status === 'active') {
        clearTimeout(timeoutIdRef.current)
        props.setTestDone(true)
      }
    }
  }, [props.testDone, data, props])

  return (
    <Container height="100%">
      <Container className={css.listenToEventContainer} width="calc(100% - 765px)" height="calc(100vh - 140px)">
        <Heading level={2} className={css.listenToEvenHeading}>
          {getString('cf.onboarding.listenToEvent')}
        </Heading>
        <Text className={css.toggleLabel}>{getString('cf.onboarding.toggleLabel')}</Text>
        <Container margin={{ top: 'xlarge', bottom: 'xlarge' }} className={css.toggleContainer}>
          <Layout.Horizontal padding={{ left: 'small', bottom: 'large' }}>
            <Switch
              onChange={() => {
                if (checked) {
                  toggleFeatureFlag.off(flagInfo.identifier)
                } else {
                  toggleFeatureFlag.on(flagInfo.identifier)
                }

                setChecked(!checked)
              }}
              alignIndicator="right"
              className={Classes.LARGE}
              checked={checked}
            />
            <Container className={css.flagInfoNameContainer}>
              <Text className={css.flagInfoName}>{flagInfo.name}</Text>
            </Container>
          </Layout.Horizontal>
          {!props.testDone && (
            <Layout.Horizontal className={css.testDoneLayout}>
              <Icon name="steps-spinner" size={24} color={Color.BLUE_500} />
              <Text className={css.listeningToEvent}>{getString('cf.onboarding.listeningToEvent')}</Text>
            </Layout.Horizontal>
          )}
        </Container>
        {props.testDone && (
          <>
            <Text className={css.allSet}>{getString('cf.onboarding.allSet')}</Text>
            <Text margin={{ top: 'small' }}>
              <String stringID="cf.onboarding.tryTarget" vars={{ link }} useRichText />
            </Text>
          </>
        )}
      </Container>
      <Container className={css.containerMain}>
        <Container className={css.containerSub} width={300} height={150}>
          <Text font={{ mono: true }} color={Color.WHITE}>
            <pre style={{ margin: 0 }}>
              {getString('cf.onboarding.waitForConnect', {
                message: props.testDone ? getString('cf.onboarding.connected') : ''
              })}
            </pre>
          </Text>
        </Container>
        <Text width={300} margin={{ top: 'large' }}>
          {getString('cf.onboarding.behindTheSenes')}
        </Text>
      </Container>
      <TestFlagInfoView />
    </Container>
  )
}
