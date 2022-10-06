/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'

import { Container, Icon, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type {
  Maybe,
  NodeRecommendationDto,
  RecommendationOverviewStats,
  RecommendationResponse
} from 'services/ce/services'
import formatCost from '@ce/utils/formatCost'
import css from './NodeRecommendation.module.scss'

interface RecommenderProps {
  stats: RecommendationOverviewStats
  details: NodeRecommendationDto
  loading: boolean
}

interface CardRow {
  label: string
  current: string | number
  spot: string | number
  demand: string | number
  renderer?: (data: CardRow, type: CardType) => React.ReactNode
}

const instaceFamLabelStringKey = 'ce.nodeRecommendation.instanceFam'
const nodeCountLabelStringKey = 'ce.nodeRecommendation.nodeCount'
const estimatedSavingsStringKey = 'ce.nodeRecommendation.estimatedSavings'

const Recommender = (props: RecommenderProps) => {
  const { getString } = useStrings()
  const { stats, details, loading } = props

  const instanceTypeToLabel: Record<string, string> = useMemo(() => {
    return {
      ON_DEMAND: getString('ce.nodeRecommendation.onDemand'),
      SPOT: getString('ce.nodeRecommendation.spot')
    }
  }, [])

  const getCardTextStyle = useCallback((isLabel, cardStyle) => (isLabel ? FontVariation.SMALL_SEMI : cardStyle), [])

  const data: CardRow[] = useMemo(() => {
    const curInstanceType = defaultTo(details.current?.instanceCategory, '')
    const getCostPerNodePerHour = (obj: RecommendationResponse | null) => {
      if (curInstanceType === 'ON_DEMAND') {
        return get(obj, 'nodePools[0].vm.onDemandPrice', 0)
      }

      return get(obj, 'nodePools[0].vm.avgPrice', 0)
    }

    const getMonthlyCostFor = (type: CardType) => {
      const mp = defaultTo(details.recommended?.accuracy?.masterPrice, 0)
      if (type === CardType.RECOMMENDED_SPOT) {
        return (mp + defaultTo(details.recommended?.accuracy?.spotPrice, 0)) * 24 * 30
      }

      return (mp + defaultTo(details.recommended?.accuracy?.workerPrice, 0)) * 24 * 30
    }

    const getEstimatedSavingsFor = (type: CardType) => {
      const recommendedMonthlyCost = getMonthlyCostFor(type)
      return stats.totalMonthlyCost - recommendedMonthlyCost
    }

    const getCpusAndMemoryPerVm = (vmDetails: Maybe<RecommendationResponse>) => {
      if (vmDetails && vmDetails.nodePools?.length) {
        return `(CPU: ${vmDetails.nodePools[0]?.vm?.cpusPerVm} Mem: ${vmDetails.nodePools[0]?.vm?.memPerVm})`
      }

      return null
    }

    const vmTypePropertyPath = 'nodePools[0].vm.type'
    const sumNodesPropertyPath = 'nodePools[0].sumNodes'
    const cpusPerVmPropertyPath = 'nodePools[0].vm.cpusPerVm'
    const memPerVmPropertyPath = 'nodePools[0].vm.memPerVm'

    return [
      {
        label: '',
        current: curInstanceType,
        spot: 'SPOT',
        demand: 'ON_DEMAND',
        renderer: (value, type) => {
          const v = value[type]
          return v && <div className={css.cardLabelPill}>{instanceTypeToLabel[v]}</div>
        }
      },
      {
        label: getString(estimatedSavingsStringKey),
        current: 0,
        spot: getEstimatedSavingsFor(CardType.RECOMMENDED_SPOT),
        demand: getEstimatedSavingsFor(CardType.RECOMMENDED_ON_DEMAND),
        renderer: (value, type) => {
          const v = value[type]
          const isLabel = type === CardType.LABEL

          const color = isLabel ? Color.GREY_700 : v < 0 ? Color.RED_500 : Color.GREEN_700

          return (
            <Text
              color={color}
              font={{
                variation: getCardTextStyle(isLabel, FontVariation.H5)
              }}
            >
              {isLabel ? v : formatCost(+v)}
            </Text>
          )
        }
      },
      {
        label: getString(instaceFamLabelStringKey),
        current: get(details.current, vmTypePropertyPath, ''),
        spot: get(details.recommended, vmTypePropertyPath, ''),
        demand: get(details.recommended, vmTypePropertyPath, ''),
        renderer: (value, type) => {
          const v = value[type]
          const isLabel = type === CardType.LABEL

          const vmDetails = type === CardType.CURRENT ? details?.current : details?.recommended

          return (
            <Container>
              <Text
                color={Color.GREY_700}
                font={{
                  variation: getCardTextStyle(isLabel, FontVariation.H6)
                }}
              >
                {v}
              </Text>
              {!isLabel ? (
                <Text color={Color.GREY_700} font={{ variation: FontVariation.TINY_SEMI, align: 'center' }}>
                  {getCpusAndMemoryPerVm(vmDetails)}
                </Text>
              ) : null}
            </Container>
          )
        }
      },
      {
        label: getString(nodeCountLabelStringKey),
        current: get(details.current, sumNodesPropertyPath, 0),
        spot: get(details.recommended, sumNodesPropertyPath, 0),
        demand: get(details.recommended, sumNodesPropertyPath, 0),
        renderer: (value, type) => {
          const v = value[type]
          const isLabel = type === CardType.LABEL

          return (
            <Text
              color={Color.GREY_700}
              font={{
                variation: getCardTextStyle(isLabel, FontVariation.H6)
              }}
            >
              {v}
            </Text>
          )
        }
      },
      {
        label: getString('ce.nodeRecommendation.cpus'),
        current: get(details.current, cpusPerVmPropertyPath, 0).toFixed(2),
        spot: get(details.recommended, cpusPerVmPropertyPath, 0).toFixed(2),
        demand: get(details.recommended, cpusPerVmPropertyPath, 0).toFixed(2)
      },

      {
        label: getString('ce.nodeRecommendation.memory'),
        current: get(details.current, memPerVmPropertyPath, 0).toFixed(2),
        spot: get(details.recommended, memPerVmPropertyPath, 0).toFixed(2),
        demand: get(details.recommended, memPerVmPropertyPath, 0).toFixed(2)
      },
      {
        label: getString('ce.nodeRecommendation.costPerHour'),
        current: formatCost(getCostPerNodePerHour(details.current)),
        spot: formatCost(get(details.recommended, 'nodePools[0].vm.avgPrice', 0)),
        demand: formatCost(get(details.recommended, 'nodePools[0].vm.onDemandPrice', 0))
      },
      {
        label: getString('regionLabel'),
        current: defaultTo(details.current?.region, ''),
        spot: defaultTo(details.recommended?.region, ''),
        demand: defaultTo(details.recommended?.region, '')
      },
      {
        label: getString('ce.nodeRecommendation.monthlyCost'),
        current: formatCost(stats.totalMonthlyCost),
        spot: formatCost(getMonthlyCostFor(CardType.RECOMMENDED_SPOT)),
        demand: formatCost(getMonthlyCostFor(CardType.RECOMMENDED_ON_DEMAND)),
        renderer: (value, type) => {
          const v = value[type]
          const isLabel = type === CardType.LABEL

          return (
            <Text
              color={Color.GREY_700}
              font={{ variation: isLabel ? FontVariation.SMALL_SEMI : FontVariation.SMALL_BOLD }}
            >
              {v}
            </Text>
          )
        }
      }
    ]
  }, [stats, details])

  return (
    <Container className={css.comparisonCtn}>
      <Container>
        <Container className={css.cardCategory}>
          <Container />
          <Text
            color={Color.GREY_700}
            font={{ variation: FontVariation.H5, align: 'center' }}
            // tooltipProps={{ dataTooltipId: 'currentDetails' }}
          >
            {getString('common.current')}
          </Text>
          <Container />
          <Container className={css.recommendationCategory}>
            <Text
              color={Color.GREY_700}
              font={{ variation: FontVariation.H5 }}
              tooltipProps={{ dataTooltipId: 'recommendedDetails' }}
            >
              {getString('ce.nodeRecommendation.recommended')}
            </Text>
          </Container>
        </Container>
        <Container className={css.cards}>
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow, css.leftAlign)} type={CardType.LABEL} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
          <Card data={data} classNames={css.white} type={CardType.CURRENT} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
          <Card data={data} classNames={css.blue} type={CardType.RECOMMENDED_SPOT} loading={loading} />
          <Card data={data} classNames={css.blue} type={CardType.RECOMMENDED_ON_DEMAND} loading={loading} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
        </Container>
      </Container>
    </Container>
  )
}

const enum CardType {
  LABEL = 'label',
  CURRENT = 'current',
  RECOMMENDED_SPOT = 'spot',
  RECOMMENDED_ON_DEMAND = 'demand'
}

interface CardProps {
  classNames?: string
  data: CardRow[]
  type?: CardType
  emptyCards?: boolean
  loading?: boolean
}

const Card = (props: CardProps) => {
  const { getString } = useStrings()

  const { classNames, data = [], type, emptyCards = false, loading = false } = props
  const isRecommendationCard = type === CardType.RECOMMENDED_ON_DEMAND || type === CardType.RECOMMENDED_SPOT
  const isLabel = type === CardType.LABEL

  if (loading) {
    return (
      <div className={cx(css.card)}>
        <Loader />
      </div>
    )
  }

  if (emptyCards) {
    return (
      <div className={cx(css.card, classNames)}>
        {data.map((_, idx) => (
          <div key={idx} className={css.cardItem} />
        ))}
      </div>
    )
  }

  return (
    <div className={cx(css.card, classNames)}>
      {isRecommendationCard && <div className={css.cardOverlay} />}
      {data.map((d, index) => {
        const isInstaceFamilyCardOnDemand =
          type === CardType.RECOMMENDED_ON_DEMAND && d.label === getString(instaceFamLabelStringKey)
        const isInstaceFamilyCardSpot =
          type === CardType.RECOMMENDED_SPOT && d.label === getString(instaceFamLabelStringKey)
        const isNodeCountCardDemand =
          type === CardType.RECOMMENDED_ON_DEMAND && d.label === getString(nodeCountLabelStringKey)
        const isNodeCountCardSpot = type === CardType.RECOMMENDED_SPOT && d.label === getString(nodeCountLabelStringKey)
        const isEstimatedSavingsCardOnDemand =
          type === CardType.RECOMMENDED_ON_DEMAND && d.label === getString(estimatedSavingsStringKey)
        const isEstimatedSavingsCardSpot =
          type === CardType.RECOMMENDED_SPOT && d.label === getString(estimatedSavingsStringKey)

        const cardStyles = cx(
          css.cardItem,
          { [css.borderTopLeft]: isEstimatedSavingsCardSpot },
          { [css.borderTopRight]: isEstimatedSavingsCardOnDemand },
          { [css.borderLeft]: isInstaceFamilyCardSpot },
          { [css.borderRight]: isInstaceFamilyCardOnDemand },
          { [css.borderBottomLeft]: isNodeCountCardSpot },
          { [css.borderBottomRight]: isNodeCountCardDemand }
        )

        return typeof d.renderer === 'function' ? (
          <div key={index} className={cardStyles}>
            {d.renderer(d, type!)}
          </div>
        ) : (
          <Text
            key={index}
            className={cardStyles}
            color={Color.GREY_700}
            font={{ variation: isLabel ? FontVariation.SMALL_SEMI : FontVariation.SMALL }}
          >
            {d[type!]}
          </Text>
        )
      })}
    </div>
  )
}

const Loader = (props: { className?: string }) => {
  return (
    <Container className={cx(css.cardLoadingContainer, props.className)}>
      <Icon name="spinner" color="primary5" size={30} />
    </Container>
  )
}

export default Recommender
