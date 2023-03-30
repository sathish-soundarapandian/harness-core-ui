/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Layout, Container, Heading, PillToggle, PillToggleProps, Text, Card, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParams } from '@common/hooks/useQueryParams'
import UserHint from '@cv/pages/components/UserHint/UserHint'
import type { SLODashboardWidget } from 'services/cv'
import { getErrorBudgetGaugeOptions } from '../CVSLOListingPage.utils'
import { SLOCardContentProps, SLOCardToggleViews } from '../CVSLOsListingPage.types'
import TimeRangeFilter from './TimeRangeFilter'
import ErrorBudgetGauge from './ErrorBudgetGauge'
import SLOTargetChartWithChangeTimeline from './SLOTargetChartWithChangeTimeline'
import { getDefaultOffSet } from './SLOCardContent.utils'
import { EvaluationType } from '../components/CVCreateSLOV2/CVCreateSLOV2.types'
import css from '../CVSLOsListingPage.module.scss'

const SLOCardContent: React.FC<SLOCardContentProps> = props => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { isCardView, serviceLevelObjective, setSliderTimeRange, showUserHint } = props
  const { sloPerformanceTrend, sloTargetPercentage, currentPeriodStartTime, currentPeriodEndTime } =
    serviceLevelObjective

  const [toggle, setToggle] = useState(SLOCardToggleViews.SLO)
  const [showTimelineSlider, setShowTimelineSlider] = useState(false)
  const [customTimeFilter, setCustomTimeFilter] = useState(false)
  const { notificationTime } = useQueryParams<{ notificationTime?: number }>()
  const location = useLocation()
  const history = useHistory()
  const { SRM_ENABLE_REQUEST_SLO: enableRequestSLO } = useFeatureFlags()
  const isRequestBased = serviceLevelObjective?.evaluationType === EvaluationType.REQUEST
  const hideErrorBudgetGauge = !(enableRequestSLO && isRequestBased)

  const resetSlider = useCallback(() => {
    setShowTimelineSlider(false)
    setSliderTimeRange?.()
    setDefaultOffset(0)
  }, [setSliderTimeRange])

  const toggleProps: PillToggleProps<SLOCardToggleViews> = {
    options: [
      {
        label: getString('cv.SLO'),
        value: SLOCardToggleViews.SLO
      },
      {
        label: getString('cv.errorBudget'),
        value: SLOCardToggleViews.ERROR_BUDGET
      }
    ],
    onChange: view => {
      resetSlider()
      setToggle(view)
    },
    selectedView: toggle,
    className: css.pillToggle
  }

  useEffect(() => {
    setShowTimelineSlider(true)
  }, [setSliderTimeRange])

  const renderRecalculation = (serviceLevelObjectiveData: SLODashboardWidget): JSX.Element => {
    if (serviceLevelObjectiveData?.calculatingSLI) {
      return <PageSpinner className={css.sloCardSpinner} message={getString('cv.sloAnalysisTakingLong')} />
    } else if (serviceLevelObjectiveData?.recalculatingSLI) {
      return (
        <PageSpinner
          className={css.sloCardSpinner}
          message={
            toggle === SLOCardToggleViews.SLO
              ? getString('cv.sloRecalculationInProgress')
              : getString('cv.errorBudgetRecalculationInProgress')
          }
        />
      )
    } else {
      return <></>
    }
  }

  const [defaultOffset, setDefaultOffset] = useState(0)
  const SLOAndErrorBudgetChartContainer = isCardView ? Card : Container
  const stylesSLOAndSLICard = isCardView ? css.cardSloAndSliForCardView : css.cardSloAndSli
  const headingVariation = isCardView ? FontVariation.SMALL_BOLD : FontVariation.FORM_LABEL

  useEffect(() => {
    if (notificationTime) {
      const updatedDefaultOffset = getDefaultOffSet({
        getString,
        notificationTime,
        currentPeriodEndTime,
        currentPeriodStartTime,
        percentageDiff: defaultOffset,
        showError,
        location,
        history
      })
      if (defaultOffset !== updatedDefaultOffset) {
        setDefaultOffset(updatedDefaultOffset)
      }
    }
  }, [])

  return (
    <Layout.Vertical
      spacing="large"
      margin={{ top: 'medium' }}
      padding={{ top: 'medium' }}
      border={{ color: isCardView ? Color.WHITE : Color.GREY_100, top: true }}
    >
      <Container flex={{ justifyContent: 'center' }}>
        <PillToggle {...toggleProps} />
      </Container>

      <SLOAndErrorBudgetChartContainer style={{ position: 'relative' }}>
        {toggle === SLOCardToggleViews.SLO && (
          <>
            {renderRecalculation(serviceLevelObjective)}
            <Container flex>
              <Heading level={2} font={{ variation: headingVariation }} data-tooltip-id={'SLOPerformanceTrend'}>
                {getString('cv.SLOPerformanceTrend')}
              </Heading>
              {isCardView && (
                <TimeRangeFilter
                  {...props}
                  type={SLOCardToggleViews.SLO}
                  resetSlider={resetSlider}
                  showTimelineSlider={showTimelineSlider}
                  setShowTimelineSlider={setShowTimelineSlider}
                  customTimeFilter={customTimeFilter}
                  setCustomTimeFilter={setCustomTimeFilter}
                />
              )}
            </Container>

            <Layout.Horizontal spacing="medium" margin={{ top: 'small' }}>
              <Layout.Vertical spacing="medium" margin={{ top: 'small' }}>
                <Container background={Color.GREY_100} className={stylesSLOAndSLICard}>
                  <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'SLO' }}>
                    {getString('cv.SLO')}
                  </Text>
                  <Heading
                    level={2}
                    color={Color.GREY_800}
                    font={{ variation: FontVariation.H4 }}
                    data-testid="sloTargetPercentage"
                  >
                    {(Number(sloTargetPercentage) || 0).toFixed(2)}%
                  </Heading>
                </Container>
                <Container background={Color.GREY_100} className={stylesSLOAndSLICard}>
                  <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'SLI' }}>
                    {getString('cv.slos.sli')}
                  </Text>
                  <Heading
                    inline
                    level={2}
                    color={Color.GREY_800}
                    font={{ variation: FontVariation.H4 }}
                    data-testid="sloPerformanceTrendSLI"
                  >
                    {sloPerformanceTrend[sloPerformanceTrend.length - 1]?.value?.toFixed(2) ?? 0}%
                  </Heading>
                </Container>
              </Layout.Vertical>
              <Container className={css.flexGrowOne}>
                {showUserHint && (
                  <UserHint userMessage={getString('cv.sloGraphUserHint')} dataTestId="SLOCard_UserHint_SLO" />
                )}
                <SLOTargetChartWithChangeTimeline
                  {...props}
                  type={SLOCardToggleViews.SLO}
                  resetSlider={resetSlider}
                  showTimelineSlider={showTimelineSlider}
                  setShowTimelineSlider={setShowTimelineSlider}
                  customTimeFilter={customTimeFilter}
                  setCustomTimeFilter={setCustomTimeFilter}
                  defaultOffSetPercentage={defaultOffset}
                />
              </Container>
            </Layout.Horizontal>
          </>
        )}
        {toggle === SLOCardToggleViews.ERROR_BUDGET && (
          <Layout.Horizontal spacing="medium">
            {renderRecalculation(serviceLevelObjective)}
            <Container height={200} className={css.errorBudgetGaugeContainer}>
              <Heading font={{ variation: headingVariation }} data-tooltip-id={'errorBudgetRemaining'}>
                {getString('cv.errorBudgetRemainingWithMins')}
              </Heading>
              <ErrorBudgetGauge customChartOptions={getErrorBudgetGaugeOptions(serviceLevelObjective)} />
              {hideErrorBudgetGauge && (
                <Text
                  font={{ variation: FontVariation.SMALL }}
                  className={css.errorBudgetRemaining}
                  width={175}
                  data-testid="errorBudgetRemaining"
                >
                  {serviceLevelObjective.errorBudgetRemaining}
                  <span style={{ display: 'block' }}>{getString('cv.minutesRemaining')}</span>
                </Text>
              )}
            </Container>
            <Container className={css.flexGrowOne} style={{ overflow: 'auto' }}>
              <Container flex={{ alignItems: 'flex-start' }} margin={{ bottom: 'small' }}>
                <Heading font={{ variation: headingVariation }} data-tooltip-id={'errorBudgetBurnDown'}>
                  {getString('cv.errorBudgetBurnDown')}
                </Heading>
                {isCardView && (
                  <TimeRangeFilter
                    {...props}
                    type={SLOCardToggleViews.ERROR_BUDGET}
                    resetSlider={resetSlider}
                    showTimelineSlider={showTimelineSlider}
                    setShowTimelineSlider={setShowTimelineSlider}
                    customTimeFilter={customTimeFilter}
                    setCustomTimeFilter={setCustomTimeFilter}
                  />
                )}
              </Container>
              {showUserHint && (
                <UserHint userMessage={getString('cv.sloGraphUserHint')} dataTestId="SLOCard_UserHint_ErrorBudget" />
              )}
              <SLOTargetChartWithChangeTimeline
                {...props}
                type={SLOCardToggleViews.ERROR_BUDGET}
                resetSlider={resetSlider}
                showTimelineSlider={showTimelineSlider}
                setShowTimelineSlider={setShowTimelineSlider}
                customTimeFilter={customTimeFilter}
                setCustomTimeFilter={setCustomTimeFilter}
              />
            </Container>
          </Layout.Horizontal>
        )}
      </SLOAndErrorBudgetChartContainer>
    </Layout.Vertical>
  )
}

export default SLOCardContent
