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
  EnvironmentInstanceDetail,
  GetEnvironmentInstanceDetailsQueryParams,
  useGetEnvironmentInstanceDetails
} from 'services/cd-ng'
import { EnvCardViewEmptyState } from './ServiceDetailEmptyStates'
import ServiceDetailsDialog from './ServiceDetailsDialog'

import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsEnvViewProps {
  setEnvId: React.Dispatch<React.SetStateAction<string | undefined>>
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

function createGroups(arr: EnvCardProps[] | undefined): EnvCardProps[][] {
  if (isUndefined(arr)) {
    return []
  }
  const numGroups = Math.ceil(arr.length / 5)
  return new Array(numGroups).fill('').map((_, i) => arr.slice(i * 5, (i + 1) * 5))
}

const EnvCard = (
  env: EnvCardProps | undefined,
  selectedEnv: string | undefined,
  setSelectedEnv: React.Dispatch<React.SetStateAction<string | undefined>>,
  setEnvId: React.Dispatch<React.SetStateAction<string | undefined>>,
  setIsDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setEnv: React.Dispatch<React.SetStateAction<string>>
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
        <Icon name="success-tick" />
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
        <Text font={{ variation: FontVariation.CARD_TITLE }} lineClamp={1} tooltipProps={{ isDark: true }}>
          {env?.artifactDeploymentDetail.artifact ? env?.artifactDeploymentDetail.artifact : '-'}
        </Text>
      </Container>
    </Card>
  )
}

export function ServiceDetailsEnvView(props: ServiceDetailsEnvViewProps): React.ReactElement {
  const { setEnvId } = props
  const { getString } = useStrings()
  const [selectedEnv, setSelectedEnv] = useState<string>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const [activeSlide, setActiveSlide] = useState<number>(1)
  const [cardView, setCardView] = useState(CardView.ENV)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false)
  const [env, setEnv] = useState<string>('')

  const queryParams: GetEnvironmentInstanceDetailsQueryParams = {
    accountIdentifier: accountId,
    serviceId,
    orgIdentifier,
    projectIdentifier
  }

  const { data, loading, error, refetch } = useGetEnvironmentInstanceDetails({ queryParams })
  const resData = defaultTo(data?.data?.environmentInstanceDetails, [] as EnvironmentInstanceDetail[])

  const envList = resData.map(item => {
    return {
      envId: item.envId,
      envName: item.envName,
      environmentType: item.environmentType,
      count: item.count,
      artifactDeploymentDetail: item.artifactDeploymentDetail
    }
  })

  const renderCards = createGroups(envList)

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
            disabled={resData.length === 0}
          />
          <ServiceDetailsDialog isOpen={isDetailsDialogOpen} setIsOpen={setIsDetailsDialogOpen} envFilter={env} />
          <PillToggle
            selectedView={cardView}
            options={[
              { label: getString('environments'), value: CardView.ENV },
              { label: getString('artifacts'), value: CardView.ARTIFACT }
            ]}
            className={css.pillToggle}
            onChange={val => setCardView(val)}
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
      ) : resData.length === 0 ? (
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
            activeSlide < Math.ceil(defaultTo(resData, []).length / 5) ? (
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
          {renderCards.map((item, idx) => {
            return (
              <Layout.Horizontal key={idx} className={css.cardGrid}>
                {item[0] && EnvCard(item[0], selectedEnv, setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv)}
                {item[1] && EnvCard(item[1], selectedEnv, setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv)}
                {item[2] && EnvCard(item[2], selectedEnv, setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv)}
                {item[3] && EnvCard(item[3], selectedEnv, setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv)}
                {item[4] && EnvCard(item[4], selectedEnv, setSelectedEnv, setEnvId, setIsDetailsDialogOpen, setEnv)}
              </Layout.Horizontal>
            )
          })}
        </Carousel>
      )}
    </Container>
  )
}
