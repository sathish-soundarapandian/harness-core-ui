/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Text, Heading, Layout, Icon } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, Switch } from '@blueprintjs/core'
import { String, useStrings } from 'framework/strings'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { ApiKey, Feature, useGetAllFeatures, GetAllFeaturesQueryParams } from 'services/cf'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { ResourceCenter } from '@common/components/ResourceCenter/ResourceCenter'
import css from './ValidatingYourFlagView.module.scss'

const POLLING_INTERVAL_IN_MS = 30000
const INITIAL_INTERVAL_IN_MS = 240000

export interface TestYourFlagViewProps {
  flagInfo: Feature
  language: PlatformEntry
  apiKey: ApiKey
  environmentIdentifier?: string
  testDone: boolean
  setTestDone: React.Dispatch<React.SetStateAction<boolean>>
}

export const ValidateYourFlagView: React.FC<TestYourFlagViewProps> = props => {
  const { flagInfo, environmentIdentifier } = props
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: environmentIdentifier as string
  })

  const featureQueryParams: GetAllFeaturesQueryParams = {
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    metrics: true,
    environmentIdentifier: environmentIdentifier as string,
    pageSize: CF_DEFAULT_PAGE_SIZE,
    pageNumber: 0
  }

  const { data: featuresData, loading, refetch } = useGetAllFeatures({ queryParams: featureQueryParams, debounce: 250 })

  const [toggledOn, setToggledOn] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [verified, setVerified] = useState(false)

  const [timeNow] = useState<Date>(new Date())

  useEffect(() => {
    if (!props.testDone) {
      const pollingTimer = setTimeout(function () {
        refetch()
      }, POLLING_INTERVAL_IN_MS)
      return () => clearTimeout(pollingTimer)
    }
  }, [loading, refetch, props.testDone, featuresData, fetching])

  useEffect(() => {
    if (featuresData && !props.testDone) {
      setFetching(true)
      //We must initially load the for 4 minutes as this is how long the api takes to return
      //the correct information to us
      const initialTimer = setTimeout(function () {
        setFetching(false)
        props.setTestDone(true)
      }, INITIAL_INTERVAL_IN_MS)
      const lastAccess = featuresData.features?.[0].status?.lastAccess

      if (featuresData.features?.[0].status?.status === 'active') {
        //flag must be validated within the getting started flow
        //anything older than that we don't care about
        if (lastAccess) {
          if (lastAccess > timeNow.getTime()) {
            setVerified(true)
          }
        }
      } else {
        setVerified(false)
      }
      return () => clearTimeout(initialTimer)
    }
  }, [props.testDone, featuresData, props])

  return (
    <Container height="100%" className={css.listenToEventContainer}>
      <Heading
        level={2}
        className={css.listenToEventHeading}
        font={{ variation: FontVariation.H3 }}
        color={Color.GREY_800}
      >
        {getString('cf.onboarding.validatingYourFlag')}
      </Heading>
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
                props.setTestDone(false)
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
