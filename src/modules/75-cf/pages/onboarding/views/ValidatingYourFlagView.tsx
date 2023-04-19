/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, Switch } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { ApiKey, Feature, GetFeatureMetricsQueryParams, useGetFeatureMetrics } from 'services/cf'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { ResourceCenter } from '@common/components/ResourceCenter/ResourceCenter'
import css from './ValidatingYourFlagView.module.scss'

const POLLING_INTERVAL_IN_MS = 30000
const MAX_TRIES = 8

export interface TestYourFlagViewProps {
  flagInfo: Feature
  language: PlatformEntry
  apiKey: ApiKey
  environmentIdentifier?: string
  testDone: boolean
  setTestDone: (done: boolean) => void
  verified: boolean
  setVerified: (success: boolean) => void
}

export const ValidateYourFlagView: React.FC<TestYourFlagViewProps> = ({
  flagInfo,
  environmentIdentifier,
  testDone,
  setTestDone,
  verified,
  setVerified
}) => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: environmentIdentifier as string
  })

  const queryParams = useMemo<GetFeatureMetricsQueryParams>(() => {
    return {
      projectIdentifier,
      environmentIdentifier: environmentIdentifier as string,
      accountIdentifier,
      orgIdentifier,
      pageSize: 1,
      featureIDs: [flagInfo.identifier],
      pageNumber: 0
    }
  }, [projectIdentifier, environmentIdentifier, accountIdentifier, orgIdentifier, flagInfo.identifier])

  const { data: featureMetrics, refetch: refetchMetrics } = useGetFeatureMetrics({
    queryParams: {
      ...queryParams,
      environmentIdentifier: environmentIdentifier as any
    }
  })

  const [toggledOn, setToggledOn] = useState(false)
  const [fetching, setFetching] = useState(false)

  const [tries, setTries] = useState(0)

  const [startTime] = useState<number>(Date.now())

  // determine when to start polling
  useEffect(() => {
    if (toggledOn && !testDone) {
      setFetching(true)
      setTries(0)
    }
  }, [toggledOn, testDone])

  // determine whether to poll or timeout
  useEffect(() => {
    if (fetching && !verified) {
      if (tries < MAX_TRIES) {
        const pollingTimer = setTimeout(() => {
          setTries(currentTries => currentTries + 1)
          refetchMetrics()
        }, POLLING_INTERVAL_IN_MS)

        return () => clearTimeout(pollingTimer)
      } else {
        setFetching(false)
        setVerified(false)
        setTestDone(true)
      }
    }
  }, [refetchMetrics, fetching, setTestDone, verified, tries, setVerified])

  useEffect(() => {
    // flag must be validated within the getting started flow
    // anything older than that we don't care about
    if (
      Array.isArray(featureMetrics) &&
      featureMetrics[0].status?.status === 'active' &&
      featureMetrics[0].status?.lastAccess > startTime
    ) {
      setFetching(false)
      setVerified(true)
      setTestDone(true)
    }
  }, [featureMetrics, startTime, setTestDone, setVerified])

  return (
    <Container className={css.listenToEventContainer}>
      <Container
        className={css.listenToEventInfo}
        width="480px"
        font={{ variation: FontVariation.BODY2_SEMI }}
        color={Color.GREY_500}
      >
        <String useRichText stringID="cf.onboarding.validatingFlagInfo" />
      </Container>
      <Container margin={{ top: 'xlarge', bottom: 'xlarge' }} className={css.toggleContainer} width="480px">
        <Layout.Horizontal padding={{ left: 'small', bottom: 'large' }}>
          <Switch
            data-testid="flagToggle"
            onChange={() => {
              if (toggledOn) {
                toggleFeatureFlag.off(flagInfo.identifier)
                setTestDone(false)
              } else {
                toggleFeatureFlag.on(flagInfo.identifier)
              }
              setToggledOn(!toggledOn)
            }}
            alignIndicator="right"
            className={Classes.LARGE}
            checked={toggledOn}
          />
          <Container className={css.flagInfoNameContainer}>
            <Text className={css.flagInfoName} font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
              {flagInfo.name}
            </Text>
            <Text className={css.flagInfoId} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_300}>
              {flagInfo.identifier}
            </Text>
          </Container>
        </Layout.Horizontal>
        {toggledOn && (
          <Layout.Horizontal className={css.testDoneLayout} data-testid="fetchingContainer" height="50px">
            {fetching && (
              <>
                <Icon name="spinner" size={16} color={Color.BLUE_500} />
                <Text
                  className={css.listeningToEvent}
                  font={{ variation: FontVariation.TINY_SEMI }}
                  color={Color.GREY_500}
                >
                  <String stringID="cf.onboarding.listenToEvent" useRichText />
                </Text>
              </>
            )}
            {verified && !fetching && (
              <>
                <Icon name="coverage-status-success" data-testid="status-success" size={20} />
                <Text className={css.listeningToEvent} font={{ weight: 'semi-bold' }} color={Color.GREY_500}>
                  {getString('cf.onboarding.eventWeReceived')}: <strong>{getString('enabledLabel')}</strong>
                </Text>
              </>
            )}
            {!verified && !fetching && (
              <>
                <Icon name="coverage-status-error" data-testid="status-error" size={20} />
                <Text
                  className={css.errorListeningToEvent}
                  width="300px"
                  font={{ variation: FontVariation.TINY, weight: 'light' }}
                  color={Color.GREY_500}
                >
                  {getString('cf.onboarding.toggleError')}
                </Text>
              </>
            )}
          </Layout.Horizontal>
        )}
      </Container>
      {!verified && !fetching && toggledOn && (
        <Text
          width="450px"
          className={css.listenToEventInfo}
          font={{ variation: FontVariation.BODY2_SEMI }}
          color={Color.GREY_500}
          data-testid="error-info"
          tag="div"
        >
          <String stringID="cf.onboarding.errorReceivingEvent" useRichText />
          <Layout.Horizontal className={css.contactSupport}>
            <String stringID="cf.onboarding.furtherAssistance" useRichText />
            <ResourceCenter link={true} />
          </Layout.Horizontal>
        </Text>
      )}
      {verified && !fetching && toggledOn && (
        <Text
          className={css.listenToEventInfo}
          font={{ variation: FontVariation.BODY2_SEMI }}
          color={Color.GREY_500}
          width="480px"
          data-testid="success-info"
        >
          <String stringID="cf.onboarding.createdAndValidated" useRichText />
        </Text>
      )}
    </Container>
  )
}
