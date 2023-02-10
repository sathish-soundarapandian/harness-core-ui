/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import {
  Button,
  Card,
  Carousel,
  Icon,
  Layout,
  Text,
  Container,
  ButtonVariation,
  PillToggle,
  getErrorInfoFromErrorObject,
  PageError
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { capitalize, defaultTo, isUndefined } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import {
  ArtifactDeploymentDetail,
  ArtifactInstanceDetail,
  EnvironmentInstanceDetail,
  GetArtifactInstanceDetailsQueryParams,
  GetEnvironmentInstanceDetailsQueryParams,
  useGetArtifactInstanceDetails,
  useGetEnvironmentInstanceDetails
} from 'services/cd-ng'
import { EnvCardViewEmptyState } from './ServiceDetailEmptyStates'
import ServiceDetailsDialog from './ServiceDetailsDialog'

import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsEnvViewProps {
  setEnvId: React.Dispatch<React.SetStateAction<string | undefined>>
  setArtifactName: React.Dispatch<React.SetStateAction<string | undefined>>
}

enum CardView {
  ENV = 'ENV',
  ARTIFACT = 'ARTIFACT'
}

interface EnvCardProps {
  envId: string
  envName?: string
  environmentType?: 'PreProduction' | 'Production'
  artifactDeploymentDetail: ArtifactDeploymentDetail
  count?: number
}

function createGroups(
  arr: ArtifactInstanceDetail[] | EnvCardProps[],
  groupSize: number
): (ArtifactInstanceDetail[] | EnvCardProps[])[] {
  const numGroups = Math.ceil(arr.length / groupSize)
  return new Array(numGroups).fill('').map((_, i) => arr.slice(i * groupSize, (i + 1) * groupSize))
}

const EnvCard = (
  setSelectedEnv: React.Dispatch<React.SetStateAction<string | undefined>>,
  setEnvId: React.Dispatch<React.SetStateAction<string | undefined>>,
  setIsDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setEnv: React.Dispatch<React.SetStateAction<string>>,
  env?: EnvCardProps,
  selectedEnv?: string
): JSX.Element => {
  const { getString } = useStrings()
  const envName = env?.envName
  const envId = env?.envId
  if (isUndefined(envId)) {
    return <></>
  }
  return (
    <Card
      className={cx(css.envCards, css.cursor)}
      onClick={() => {
        if (selectedEnv === envId) {
          setSelectedEnv(undefined)
          setEnvId(undefined)
        } else {
          setSelectedEnv(envId)
          setEnvId(envId)
        }
      }}
      selected={selectedEnv === envId}
    >
      <div className={css.envCardTitle}>
        <Text
          icon="infrastructure"
          font={{ variation: FontVariation.CARD_TITLE }}
          color={Color.GREY_600}
          lineClamp={1}
          tooltipProps={{ isDark: true }}
        >
          {envName}
        </Text>
      </div>
      {env?.environmentType && (
        <Text
          className={cx(css.environmentType, {
            [css.production]: env?.environmentType === EnvironmentType.PRODUCTION
          })}
          font={{ size: 'small' }}
        >
          {getString(
            env?.environmentType === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType'
          )}
        </Text>
      )}
      {env?.artifactDeploymentDetail.lastDeployedAt && (
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
          {getString('pipeline.lastDeployed')} <ReactTimeago date={env.artifactDeploymentDetail.lastDeployedAt} />
        </Text>
      )}
      {env?.count && (
        <div className={css.instanceCountStyle}>
          <Icon name="instances" color={Color.GREY_600} />
          <Text
            onClick={e => {
              e.stopPropagation()
              setEnv(env.envId)
              setIsDetailsDialogOpen(true)
            }}
            color={Color.PRIMARY_7}
            font={{ variation: FontVariation.TINY_SEMI }}
          >
            {env.count} {capitalize(getString('pipeline.execution.instances'))}
          </Text>
        </div>
      )}
      <Container flex={{ justifyContent: 'flex-end' }}>
        <Text
          font={{ variation: FontVariation.CARD_TITLE, weight: 'semi-bold' }}
          color={Color.GREY_800}
          lineClamp={1}
          tooltipProps={{ isDark: true }}
        >
          {env?.artifactDeploymentDetail.artifact ? env?.artifactDeploymentDetail.artifact : '-'}
        </Text>
      </Container>
    </Card>
  )
}

const ArtifactCard = (
  setArtifactName: React.Dispatch<React.SetStateAction<string | undefined>>,
  setSelectedArtifact: React.Dispatch<React.SetStateAction<string | undefined>>,
  artifact?: ArtifactInstanceDetail | null,
  selectedArtifact?: string
): JSX.Element => {
  const artifactName = artifact?.artifact
  const { getString } = useStrings()
  const envList = artifact?.environmentInstanceDetails.environmentInstanceDetails || []

  if (isUndefined(artifactName) && !envList.length) {
    return <></>
  }

  return (
    <Card
      className={cx(css.artifactCards, css.cursor)}
      onClick={() => {
        if (selectedArtifact === artifactName) {
          setSelectedArtifact(undefined)
          setArtifactName(undefined)
        } else {
          setSelectedArtifact(artifactName)
          setArtifactName(artifactName)
        }
      }}
      selected={selectedArtifact === artifactName}
    >
      <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_600} lineClamp={1} tooltipProps={{ isDark: true }}>
        {artifactName}
      </Text>
      <div className={css.artifactViewEnvList}>
        {envList.map(envInfo => (
          <Layout.Horizontal key={envInfo.envId} className={css.artifactViewEnvDetail}>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text
                font={{ variation: FontVariation.BODY2 }}
                color={Color.GREY_600}
                lineClamp={1}
                padding={{ right: 'small' }}
                tooltipProps={{ isDark: true }}
              >
                {envInfo.envName}
              </Text>
              {envInfo?.environmentType && (
                <Text
                  className={cx(css.environmentType, {
                    [css.production]: envInfo?.environmentType === EnvironmentType.PRODUCTION
                  })}
                  font={{ size: 'xsmall' }}
                  height={16}
                >
                  {getString(
                    envInfo?.environmentType === EnvironmentType.PRODUCTION
                      ? 'cd.serviceDashboard.prod'
                      : 'cd.preProductionType'
                  )}
                </Text>
              )}
            </Layout.Horizontal>
            {envInfo?.artifactDeploymentDetail.lastDeployedAt && (
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
                <ReactTimeago date={envInfo.artifactDeploymentDetail.lastDeployedAt} />
              </Text>
            )}
          </Layout.Horizontal>
        ))}
      </div>
    </Card>
  )
}

export function ServiceDetailsEnvView(props: ServiceDetailsEnvViewProps): React.ReactElement {
  const { setEnvId, setArtifactName } = props
  const { getString } = useStrings()
  const [selectedEnv, setSelectedEnv] = useState<string>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const [activeSlide, setActiveSlide] = useState<number>(1)
  const [cardView, setCardView] = useState(CardView.ENV)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false)
  const [env, setEnv] = useState<string>('')

  //artifact state
  const [selectedArtifact, setSelectedArtifact] = useState<string>()

  const queryParams: GetEnvironmentInstanceDetailsQueryParams | GetArtifactInstanceDetailsQueryParams = {
    accountIdentifier: accountId,
    serviceId,
    orgIdentifier,
    projectIdentifier
  }

  //Env Card
  const {
    data: envData,
    loading: envLoading,
    error: envError,
    refetch: envRefetch
  } = useGetEnvironmentInstanceDetails({ queryParams })
  const resData = defaultTo(envData?.data?.environmentInstanceDetails, [] as EnvironmentInstanceDetail[])

  //Artifact Card
  const {
    data: artifactData,
    loading: artifactLoading,
    error: artifactError,
    refetch: artifactRefetch
  } = useGetArtifactInstanceDetails({ queryParams })
  const artifactCardData = defaultTo(artifactData?.data?.artifactInstanceDetails, [] as ArtifactInstanceDetail[])

  const envList: EnvCardProps[] = resData.map(item => {
    return {
      envId: item.envId,
      envName: item.envName,
      environmentType: item.environmentType,
      count: item.count,
      artifactDeploymentDetail: item.artifactDeploymentDetail
    }
  })

  const artifactList: ArtifactInstanceDetail[] = artifactCardData.map(item => {
    return {
      artifact: item.artifact,
      environmentInstanceDetails: item.environmentInstanceDetails
    }
  })

  const [data, loading, error, refetch, visibleCardCount, cardInfoList] =
    cardView === CardView.ENV
      ? [resData, envLoading, envError, envRefetch, 5, envList]
      : [artifactCardData, artifactLoading, artifactError, artifactRefetch, 4, artifactList] //todo

  const renderCards = createGroups(cardInfoList, visibleCardCount)

  const CardSlides =
    cardView === CardView.ENV
      ? renderCards.map((item, idx) => {
          const envInfo = item as EnvCardProps[]
          return (
            <Layout.Horizontal key={idx} className={css.envCardGrid}>
              {envInfo[0] && EnvCard(setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv, envInfo[0], selectedEnv)}
              {envInfo[1] && EnvCard(setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv, envInfo[1], selectedEnv)}
              {envInfo[2] && EnvCard(setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv, envInfo[2], selectedEnv)}
              {envInfo[3] && EnvCard(setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv, envInfo[3], selectedEnv)}
              {envInfo[4] && EnvCard(setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv, envInfo[4], selectedEnv)}
            </Layout.Horizontal>
          )
        })
      : renderCards.map((item, idx) => {
          const artifactInfo = item as ArtifactInstanceDetail[]
          return (
            <Layout.Horizontal key={idx} className={css.artifactCardGrid}>
              {artifactInfo[0] && ArtifactCard(setArtifactName, setSelectedArtifact, artifactInfo[0], selectedArtifact)}
              {artifactInfo[1] && ArtifactCard(setArtifactName, setSelectedArtifact, artifactInfo[1], selectedArtifact)}
              {artifactInfo[2] && ArtifactCard(setArtifactName, setSelectedArtifact, artifactInfo[2], selectedArtifact)}
              {artifactInfo[3] && ArtifactCard(setArtifactName, setSelectedArtifact, artifactInfo[3], selectedArtifact)}
            </Layout.Horizontal>
          )
        })

  return (
    <Container>
      <div className={css.titleStyle}>
        <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
          {getString('environments')}
        </Text>
        <div>
          <Button
            variation={ButtonVariation.LINK}
            style={{ paddingRight: 0, fontSize: 13 }}
            icon="panel-table"
            iconProps={{ size: 13 }}
            text={getString('cd.environmentDetailPage.viewInTable')}
            onClick={() => {
              setEnv('')
              setIsDetailsDialogOpen(true)
            }}
            disabled={!data || data.length === 0}
          />
          <ServiceDetailsDialog isOpen={isDetailsDialogOpen} setIsOpen={setIsDetailsDialogOpen} envFilter={env} />
          <PillToggle
            selectedView={cardView}
            options={[
              { label: getString('environments'), value: CardView.ENV },
              { label: getString('artifacts'), value: CardView.ARTIFACT }
            ]}
            className={css.pillToggle}
            onChange={val => {
              setEnvId(undefined)
              setArtifactName(undefined)
              setSelectedEnv('')
              setSelectedArtifact('')
              setCardView(val)
            }}
          />
        </div>
      </div>
      {loading ? (
        <Container
          flex={{ justifyContent: 'center', alignItems: 'center' }}
          height={250}
          data-test="ServiceDetailsEnvCardLoading"
        >
          <Icon name="spinner" color={Color.BLUE_500} size={30} />
        </Container>
      ) : error ? (
        <Container data-test="ServiceDetailsEnvCardError" height={250} flex={{ justifyContent: 'center' }}>
          <PageError onClick={() => refetch?.()} message={getErrorInfoFromErrorObject(error)} />
        </Container>
      ) : !data || data.length === 0 ? (
        <EnvCardViewEmptyState message={getString('pipeline.ServiceDetail.envCardEmptyStateMsg')} />
      ) : (
        <Carousel
          previousElement={
            activeSlide > 1 ? (
              <Button
                intent="primary"
                className={css.prevButton}
                icon="double-chevron-left"
                minimal
                iconProps={{
                  size: 22,
                  color: Color.PRIMARY_7
                }}
              />
            ) : (
              <span />
            )
          }
          nextElement={
            activeSlide < Math.ceil(defaultTo(data, []).length / visibleCardCount) ? (
              <Button
                intent="primary"
                className={css.nextButton}
                icon="double-chevron-right"
                minimal
                iconProps={{
                  size: 22,
                  color: Color.PRIMARY_7
                }}
              />
            ) : (
              <span />
            )
          }
          hideIndicators={true}
          onChange={setActiveSlide}
          slideClassName={cx(css.slideStyle, { [css.paddingLeft12]: activeSlide === 1 })}
        >
          {CardSlides}
        </Carousel>
      )}
    </Container>
  )
}
