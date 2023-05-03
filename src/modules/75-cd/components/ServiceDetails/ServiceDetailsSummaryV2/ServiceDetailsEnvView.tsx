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
  PageError,
  DropDown,
  SelectOption
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { Popover, Position } from '@blueprintjs/core'
import { capitalize, defaultTo, isEmpty, isUndefined } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { useServiceContext } from '@cd/context/ServiceContext'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import {
  ArtifactDeploymentDetail,
  ArtifactInstanceDetail,
  EnvironmentGroupInstanceDetail,
  GetArtifactInstanceDetailsQueryParams,
  GetEnvironmentInstanceDetailsQueryParams,
  NGServiceConfig,
  useGetArtifactInstanceDetails,
  useGetEnvironmentInstanceDetails
} from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { supportedDeploymentTypesForPostProdRollback } from './PostProdRollback/PostProdRollbackUtil'
import { EnvCardViewEmptyState } from './ServiceDetailEmptyStates'
import ServiceDetailsDialog from './ServiceDetailsDialog'
import ServiceDetailDriftTable from './ServiceDetailDriftTable'
import PostProdRollbackDrawer from './PostProdRollback/ServiceDetailPostProdRollback'

import css from './ServiceDetailsSummaryV2.module.scss'

enum CardSortOption {
  ALL = 'All',
  PROD = 'PRODUCTION',
  PRE_PROD = 'PREPRODUCTION'
}

interface ServiceDetailsEnvViewProps {
  setEnvId: React.Dispatch<React.SetStateAction<string | string[] | undefined>>
  setArtifactName: React.Dispatch<React.SetStateAction<string | undefined>>
}

enum CardView {
  ENV = 'ENV',
  ARTIFACT = 'ARTIFACT'
}

export interface EnvCardProps {
  id: string
  name?: string
  environmentTypes?: ('PreProduction' | 'Production')[]
  artifactDeploymentDetails?: ArtifactDeploymentDetail[]
  count?: number
  isEnvGroup?: boolean
  isDrift?: boolean
  isRollback?: boolean
  isRevert?: boolean
}

function createGroups(
  arr: ArtifactInstanceDetail[] | EnvCardProps[],
  groupSize: number
): (ArtifactInstanceDetail[] | EnvCardProps[])[] {
  const numGroups = Math.ceil(arr.length / groupSize)
  return new Array(numGroups).fill('').map((_, i) => arr.slice(i * groupSize, (i + 1) * groupSize))
}

interface EnvCardComponentProps {
  setSelectedEnv: React.Dispatch<
    React.SetStateAction<
      | {
          envId?: string
          isEnvGroup: boolean
        }
      | undefined
    >
  >
  setEnvId: React.Dispatch<React.SetStateAction<string | string[] | undefined>>
  setIsDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEnvFilter: React.Dispatch<
    React.SetStateAction<{
      envId?: string
      isEnvGroup: boolean
      envName?: string
      isRollbackAllowed?: boolean
    }>
  >
  env?: EnvCardProps
  selectedEnv?: {
    envId?: string
    isEnvGroup: boolean
  }
}

const getLatestTimeAndArtifact = (data: ArtifactDeploymentDetail[] | undefined): ArtifactDeploymentDetail => {
  return defaultTo(
    data?.reduce(
      (latest, deployment) =>
        deployment.lastDeployedAt !== undefined &&
        latest.lastDeployedAt &&
        deployment.lastDeployedAt > latest.lastDeployedAt
          ? deployment
          : latest,
      { lastDeployedAt: Number.MIN_SAFE_INTEGER, artifact: undefined }
    ),
    { lastDeployedAt: Number.MIN_SAFE_INTEGER, artifact: undefined }
  )
}

function EnvCard({
  setSelectedEnv,
  setEnvId,
  setIsDetailsDialogOpen,
  setEnvFilter,
  env,
  selectedEnv
}: EnvCardComponentProps): JSX.Element | null {
  const { getString } = useStrings()
  const envName = env?.name
  const envId = env?.id
  const { lastDeployedAt: latestTime, artifact: artifactName } = getLatestTimeAndArtifact(
    env?.artifactDeploymentDetails
  )
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)

  //serviceType
  const { serviceResponse } = useServiceContext()
  const serviceDataParse = React.useMemo(
    () => yamlParse<NGServiceConfig>(defaultTo(serviceResponse?.yaml, '')),
    [serviceResponse?.yaml]
  )
  const serviceType = serviceDataParse?.service?.serviceDefinition?.type

  // Allow rollback action or not
  const showRollbackAction =
    useFeatureFlag(FeatureFlag.POST_PROD_ROLLBACK) &&
    serviceType &&
    supportedDeploymentTypesForPostProdRollback.includes(serviceType)

  const deploymentText = env?.isRollback
    ? getString('cd.serviceDashboard.rollbacked')
    : env?.isRevert
    ? getString('cd.serviceDashboard.hotfixed')
    : ''

  const isDrift = env?.isDrift
  const isEnvGroup = env?.isEnvGroup

  const envGroupEnvIds = env?.isEnvGroup
    ? (defaultTo(env.artifactDeploymentDetails?.map(envValue => envValue.envId)?.filter(Boolean), []) as string[])
    : []

  if (isUndefined(envId)) {
    return null
  }
  return (
    <>
      <Card
        className={cx(css.envCards, css.cursor)}
        onClick={() => {
          if (selectedEnv?.envId === envId) {
            setSelectedEnv(undefined)
            setEnvId(undefined)
          } else {
            setSelectedEnv({ envId: envId, isEnvGroup: !!isEnvGroup })
            setEnvId(isEnvGroup ? envGroupEnvIds : envId)
          }
        }}
        selected={selectedEnv?.envId === envId}
      >
        {isEnvGroup && <String tagName="div" className={css.headerTile} stringID="cd.serviceDashboard.envGroupTitle" />}
        <div className={css.envCardTitle}>
          <Text
            font={{ variation: FontVariation.FORM_SUB_SECTION }}
            color={Color.GREY_600}
            lineClamp={1}
            tooltipProps={{ isDark: true }}
          >
            {!isEmpty(envName) ? envName : '--'}
          </Text>
        </div>
        <div>
          {env?.environmentTypes?.map((item, index) => (
            <Text
              key={index}
              className={cx(css.environmentType, {
                [css.production]: item === EnvironmentType.PRODUCTION
              })}
              font={{ size: 'small' }}
              margin={{ right: 'small' }}
            >
              {item
                ? getString(item === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType')
                : '-'}
            </Text>
          ))}
        </div>
        {!!(latestTime && latestTime !== Number.MIN_SAFE_INTEGER) && (
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800} className={css.lastDeployedText}>
            {deploymentText ? (
              <String
                useRichText
                stringID="cd.serviceDashboard.lastDeployedText"
                vars={{
                  status: deploymentText
                }}
              />
            ) : (
              getString('pipeline.lastDeployed')
            )}
            <ReactTimeago date={latestTime} />
          </Text>
        )}
        {env?.count && (
          <div className={css.instanceCountStyle}>
            <Icon name="instances" color={Color.GREY_600} />
            <Text
              onClick={e => {
                e.stopPropagation()
                setEnvFilter({
                  envId: env.id,
                  isEnvGroup: !!env.isEnvGroup,
                  envName: env.name,
                  isRollbackAllowed: showRollbackAction
                })
                setIsDetailsDialogOpen(true)
              }}
              color={Color.PRIMARY_7}
              font={{ variation: FontVariation.TINY_SEMI }}
            >
              {env.count} {capitalize(getString('pipeline.execution.instances'))}
            </Text>
          </div>
        )}
        <Container flex>
          <Popover
            interactionKind="hover"
            content={
              <ServiceDetailDriftTable data={defaultTo(env?.artifactDeploymentDetails, [])} isArtifactView={false} />
            }
            disabled={!isDrift}
            popoverClassName={css.driftPopover}
            position={Position.BOTTOM}
            modifiers={{ preventOverflow: { escapeWithReference: true } }}
          >
            <Container flex={{ alignItems: 'center' }}>
              {isDrift && <Icon name="execution-warning" color={Color.RED_700} />}
              <Text
                font={{ variation: FontVariation.CARD_TITLE, weight: 'semi-bold' }}
                color={isDrift ? Color.RED_700 : Color.GREY_800}
                lineClamp={1}
                margin={{ left: 'small' }}
                tooltipProps={{ isDark: true, disabled: isDrift }}
              >
                {artifactName || '-'}
              </Text>
            </Container>
          </Popover>
          {showRollbackAction ? (
            <Container className={css.rollbackActionIcon}>
              <Icon
                name="rollback-service"
                color={Color.GREY_700}
                size={14}
                onClick={e => {
                  e.stopPropagation()
                  setDrawerOpen(true)
                }}
              />
            </Container>
          ) : null}
        </Container>
      </Card>
      {drawerOpen && env?.id ? (
        <PostProdRollbackDrawer
          drawerOpen={drawerOpen}
          isEnvGroup={!!env?.isEnvGroup}
          setDrawerOpen={setDrawerOpen}
          entityId={env?.id}
          entityName={env?.name}
        />
      ) : null}
    </>
  )
}

interface ArtifactCardProps {
  setArtifactName: React.Dispatch<React.SetStateAction<string | undefined>>
  setSelectedArtifact: React.Dispatch<React.SetStateAction<string | undefined>>
  setIsDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEnvFilter: React.Dispatch<
    React.SetStateAction<{
      envId?: string
      isEnvGroup: boolean
    }>
  >
  setArtifactFilter: React.Dispatch<React.SetStateAction<string | undefined>>
  artifact?: ArtifactInstanceDetail | null
  selectedArtifact?: string
  setArtifactFilterApplied?: React.Dispatch<React.SetStateAction<boolean>>
}

function ArtifactCard({
  setArtifactName,
  setSelectedArtifact,
  setIsDetailsDialogOpen,
  setEnvFilter,
  setArtifactFilter,
  artifact,
  selectedArtifact,
  setArtifactFilterApplied
}: ArtifactCardProps): JSX.Element | null {
  const artifactName = artifact?.artifact
  const { getString } = useStrings()
  const envList = artifact?.environmentGroupInstanceDetails.environmentGroupInstanceDetails || []

  if (isUndefined(artifactName) && !envList.length) {
    return null
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
      <Text
        font={{ variation: FontVariation.H5 }}
        color={Color.GREY_600}
        lineClamp={1}
        className={css.hoverUnderline}
        tooltipProps={{ isDark: true }}
        onClick={e => {
          e.stopPropagation()
          setArtifactFilter(artifactName)
          setEnvFilter({ envId: undefined, isEnvGroup: false })
          setArtifactFilterApplied?.(true)
          setIsDetailsDialogOpen(true)
        }}
      >
        {!isEmpty(artifactName) ? artifactName : '--'}
      </Text>
      <div className={css.artifactViewEnvList}>
        {envList.map((envInfo, idx) => {
          const { lastDeployedAt: latestTime } = getLatestTimeAndArtifact(envInfo?.artifactDeploymentDetails)
          const isDrift = envInfo?.isDrift
          const isEnvGroup = envInfo?.isEnvGroup
          return (
            <Layout.Horizontal key={`${envInfo.id}_${idx}`} className={css.artifactViewEnvDetail}>
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Popover
                  interactionKind="hover"
                  content={
                    <ServiceDetailDriftTable
                      data={defaultTo(envInfo.artifactDeploymentDetails, [])}
                      isArtifactView={true}
                      artifactName={artifactName}
                    />
                  }
                  disabled={!isDrift}
                  popoverClassName={css.driftPopover}
                  position={Position.TOP}
                  modifiers={{ preventOverflow: { escapeWithReference: true } }}
                >
                  <Container flex>
                    <Text
                      font={{ variation: FontVariation.BODY2 }}
                      color={isDrift ? Color.RED_700 : Color.GREY_600}
                      lineClamp={1}
                      padding={{ right: 'small' }}
                      tooltipProps={{ isDark: true, disabled: isDrift }}
                      className={css.hoverUnderline}
                      onClick={e => {
                        e.stopPropagation()
                        setEnvFilter({ envId: envInfo.id, isEnvGroup: !!envInfo.isEnvGroup })
                        setArtifactFilter(artifactName)
                        setArtifactFilterApplied?.(true)
                        setIsDetailsDialogOpen(true)
                      }}
                    >
                      {!isEmpty(envInfo.name) ? envInfo.name : '--'}
                    </Text>
                    {isDrift && <Icon name="execution-warning" color={Color.RED_700} padding={{ right: 'small' }} />}
                  </Container>
                </Popover>
                <Container flex>
                  {envInfo?.environmentTypes?.map((item, index) => (
                    <Text
                      key={index}
                      className={cx(css.environmentType, {
                        [css.production]: item === EnvironmentType.PRODUCTION
                      })}
                      font={{ size: 'small' }}
                      height={16}
                      margin={{ right: 'small' }}
                    >
                      {item
                        ? getString(
                            item === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType'
                          )
                        : '-'}
                    </Text>
                  ))}
                </Container>
                {isEnvGroup && (
                  <Text
                    font={{ variation: FontVariation.TINY_SEMI }}
                    color={Color.PRIMARY_9}
                    width={45}
                    height={18}
                    border={{ radius: 2, color: '#CDF4FE' }}
                    id="groupLabel"
                    background={Color.PRIMARY_1}
                    flex={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    {getString('pipeline.verification.tableHeaders.group')}
                  </Text>
                )}
              </Layout.Horizontal>
              {!!(latestTime && latestTime !== Number.MIN_SAFE_INTEGER) && (
                <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
                  <ReactTimeago date={latestTime} />
                </Text>
              )}
            </Layout.Horizontal>
          )
        })}
      </div>
    </Card>
  )
}

export function ServiceDetailsEnvView(props: ServiceDetailsEnvViewProps): React.ReactElement {
  const { setEnvId, setArtifactName } = props
  const { getString } = useStrings()
  const [selectedEnv, setSelectedEnv] = useState<{ envId?: string; isEnvGroup: boolean }>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const [activeSlide, setActiveSlide] = useState<number>(1)
  const [cardView, setCardView] = useState(CardView.ENV)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false)
  const [envFilter, setEnvFilter] = useState<{
    envId?: string
    isEnvGroup: boolean
    envName?: string
    isRollbackAllowed?: boolean
  }>({
    envId: undefined,
    isEnvGroup: false,
    isRollbackAllowed: false
  })

  //artifact state
  const [selectedArtifact, setSelectedArtifact] = useState<string>()
  const [artifactFilter, setArtifactFilter] = useState<string | undefined>('')
  const [artifactFilterApplied, setArtifactFilterApplied] = useState(false)

  //filter
  const [sortOptions, setSortOptions] = useState<CardSortOption>(CardSortOption.ALL)

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
  } = useMutateAsGet(useGetEnvironmentInstanceDetails, {
    queryParams,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })
  const resData = defaultTo(envData?.data?.environmentGroupInstanceDetails, [] as EnvironmentGroupInstanceDetail[])

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
      id: item.id,
      name: item.name,
      environmentTypes: item.environmentTypes,
      count: item.count,
      artifactDeploymentDetails: item.artifactDeploymentDetails,
      isDrift: item.isDrift,
      isEnvGroup: item.isEnvGroup,
      isRevert: item.isRevert,
      isRollback: item.isRollback
    }
  })

  const artifactList: ArtifactInstanceDetail[] = artifactCardData.map(item => {
    return {
      artifact: item.artifact,
      environmentGroupInstanceDetails: item.environmentGroupInstanceDetails
    }
  })

  const [data, loading, error, refetch, visibleCardCount, cardInfoList] =
    cardView === CardView.ENV
      ? [resData, envLoading, envError, envRefetch, 5, envList]
      : [artifactCardData, artifactLoading, artifactError, artifactRefetch, 3, artifactList]

  const renderCards = createGroups(cardInfoList, visibleCardCount)

  const artifactSlide = [0, 1, 2]
  const envSlide = [0, 1, 2, 3, 4]

  const cardSlides =
    cardView === CardView.ENV
      ? renderCards.map((item, idx) => {
          const envInfo = item as EnvCardProps[]
          return (
            <Layout.Horizontal key={idx} className={css.envCardGrid}>
              {envSlide.map(i => {
                if (!envInfo[i]) return null
                return (
                  <EnvCard
                    key={i}
                    setSelectedEnv={setSelectedEnv}
                    setEnvId={setEnvId}
                    setIsDetailsDialogOpen={setIsDetailsDialogOpen}
                    setEnvFilter={setEnvFilter}
                    env={envInfo[i]}
                    selectedEnv={selectedEnv}
                  />
                )
              })}
            </Layout.Horizontal>
          )
        })
      : renderCards.map((item, idx) => {
          const artifactInfo = item as ArtifactInstanceDetail[]
          return (
            <Layout.Horizontal key={idx} className={css.artifactCardGrid}>
              {artifactSlide.map(i => {
                if (!artifactInfo[i]) return null

                return (
                  <ArtifactCard
                    key={i}
                    setArtifactName={setArtifactName}
                    setSelectedArtifact={setSelectedArtifact}
                    setIsDetailsDialogOpen={setIsDetailsDialogOpen}
                    setEnvFilter={setEnvFilter}
                    setArtifactFilter={setArtifactFilter}
                    artifact={artifactInfo[i]}
                    selectedArtifact={selectedArtifact}
                    setArtifactFilterApplied={setArtifactFilterApplied}
                  />
                )
              })}
            </Layout.Horizontal>
          )
        })

  const dropdownOptions = React.useMemo(() => {
    return [
      {
        label: getString('cd.serviceDashboard.bothTypeLabel'),
        value: CardSortOption.ALL
      },
      {
        label: getString('cd.serviceDashboard.prod'),
        value: CardSortOption.PROD
      },
      {
        label: getString('cd.preProductionType'),
        value: CardSortOption.PRE_PROD
      }
    ]
  }, [])

  const onDropdownChange = React.useCallback((item: SelectOption) => {
    const sortFilter = []
    if (item.value === CardSortOption.ALL) {
      setSortOptions(CardSortOption.ALL)
      sortFilter.push('Production')
      sortFilter.push('PreProduction')
    } else if (item.value === CardSortOption.PROD) {
      setSortOptions(CardSortOption.PROD)
      sortFilter.push('Production')
    } else if (item.value === CardSortOption.PRE_PROD) {
      setSortOptions(CardSortOption.PRE_PROD)
      sortFilter.push('PreProduction')
    }

    envRefetch({
      queryParams,
      body: {
        filterType: 'Environment',
        environmentTypes: sortFilter
      }
    })
  }, [])

  return (
    <Container>
      <Text color={Color.GREY_800} font={{ variation: FontVariation.H6 }} className={css.titleText}>
        {cardView === CardView.ENV ? getString('cd.serviceDashboard.envAndGroup') : getString('artifacts')}
      </Text>
      <div className={css.titleStyle}>
        <DropDown
          items={dropdownOptions}
          onChange={onDropdownChange}
          value={sortOptions}
          filterable={false}
          usePortal
          disabled={cardView === CardView.ARTIFACT}
        />
        <div>
          <Button
            variation={ButtonVariation.LINK}
            style={{ paddingRight: 0, fontSize: 13 }}
            icon="panel-table"
            iconProps={{ size: 13 }}
            text={getString('cd.environmentDetailPage.viewInTable')}
            onClick={() => {
              setEnvFilter({ envId: undefined, isEnvGroup: false, isRollbackAllowed: false })
              setArtifactFilter(undefined)
              setIsDetailsDialogOpen(true)
              setArtifactFilterApplied(false)
            }}
            disabled={!data || data.length === 0}
          />
          <ServiceDetailsDialog
            isOpen={isDetailsDialogOpen}
            setIsOpen={setIsDetailsDialogOpen}
            envFilter={envFilter}
            artifactFilter={artifactFilter}
            isEnvView={cardView === CardView.ENV}
            artifactFilterApplied={artifactFilterApplied}
          />
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
              setSelectedEnv(undefined)
              setSelectedArtifact(undefined)
              setArtifactFilterApplied(false)
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
          key={cardView}
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
          {cardSlides}
        </Carousel>
      )}
    </Container>
  )
}
