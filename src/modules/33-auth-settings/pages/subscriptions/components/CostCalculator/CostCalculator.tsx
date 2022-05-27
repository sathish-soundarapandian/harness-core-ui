/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Button, ButtonSize, Layout, PillToggle, Text, Toggle } from '@harness/uicore'
import cx from 'classnames'
import { Classes, Dialog, IDialogProps, NumericInput, Slider } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import { ButtonVariation, Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { isNaN } from 'lodash-es'
import { Editions } from '@common/constants/SubscriptionTypes'
import {
  acquireCurrentPlan,
  ffUnitTypes,
  PlanType
} from '@auth-settings/pages/subscriptions/components/CostCalculator/CostCalculatorUtils'
import { ReviewPage } from '@auth-settings/pages/subscriptions/components/SubscribeNPay/ReviewAndBuyPlanUpgrades'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useCreateFfSubscription, useListSubscriptions, useRetrieveProductPrices } from 'services/cd-ng/index'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ModuleName } from 'framework/types/ModuleName'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import recommendedIcon from './images/recommendedbig.png'
import usageIcon from './images/usagebig.png'
import plannedUsageIcon from './images/currentbig.png'
import css from './CostCalculator.module.scss'

interface InfoBoxParams {
  title: string
  planned?: number
  units?: string
  recommended: number
  using: number
}

const InfoBox = ({ title, units, using, recommended, planned }: InfoBoxParams) => {
  const newUnits = units ? units : ''

  return (
    <Layout.Vertical
      padding={{ top: 'medium', bottom: 'medium', left: 'xlarge', right: 'xlarge' }}
      className={cx(css.infocard)}
    >
      <Layout.Horizontal padding={{ bottom: 'medium' }} flex={{ alignItems: 'baseline', justifyContent: 'left' }}>
        <Text
          font={{ variation: FontVariation.H4 }}
          className={cx(css.textwrap)}
          color={Color.GREY_600}
          padding={{ right: 'xsmall' }}
        >
          {title}
        </Text>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ justifyContent: 'space-around' }} padding={{ bottom: 'xlarge' }}>
        {!isNaN(planned as number) && (
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.SMALL }}>Current Plan</Text>
            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              className={cx(css.infocardItemIcongap)}
            >
              <img src={plannedUsageIcon} height={'10px'} width={'10px'} />
              <Text font={{ variation: FontVariation.H3 }} padding={{ left: '10px' }}>
                {planned + newUnits}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        )}
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.SMALL }}>Usage</Text>
          <Layout.Horizontal
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            className={cx(css.infocardItemIcongap)}
          >
            <img src={usageIcon} height={'10px'} width={'10px'} />
            <Text font={{ variation: FontVariation.H3 }} padding={{ left: '10px' }}>
              {using + newUnits}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.SMALL }}>Recommended</Text>
          <Layout.Horizontal
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            className={cx(css.infocardItemIcongap)}
          >
            <img src={recommendedIcon} height={'15px'} width={'12px'} />
            <Text font={{ variation: FontVariation.H3 }} padding={{ left: '10px' }}>
              {recommended + newUnits}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

interface CostSliderParams {
  title: string
  summary: string
  inputUnit: string
  plannedUsage?: number
  currentUsage: number
  recommended: number
  currentSliderValue: number
  minVal: number
  maxVal: number
  tickSize: number
  labelTickSize: number
  onSliderChange: (newSlider: number) => void
  labelSuffix: string
  labelSummary: string
}

interface EditionBox {
  editionType: Editions | PlanType
}

export const GetEditionBox = ({ editionType }: EditionBox) => {
  const backGround = Object.values(Editions).includes(editionType as Editions) ? css.editionBg : css.planBg

  return (
    <Container className={cx(css.editionPlanBox, backGround)}>
      <Text font={{ variation: FontVariation.TABLE_HEADERS }} color={Color.WHITE}>
        {editionType.toUpperCase()}
      </Text>
    </Container>
  )
}

const CustomProgress = (usage: number, planned: number, recommended: number) => {
  const percent: Array<[string, number]> = [
    ['usage', Math.round(usage * 100)],
    ['planned', Math.round(planned * 100)],
    ['recommended', Math.round(recommended * 100)]
  ]
  const sortedPercent = percent.sort((a, b) => a[1] - b[1])
  sortedPercent[2][1] = sortedPercent[2][1] - sortedPercent[1][1]
  sortedPercent[1][1] = sortedPercent[1][1] - sortedPercent[0][1]
  sortedPercent.forEach((x, i: number) => {
    if (x[1] <= 2) {
      sortedPercent[i][1] = 2
    }
  })
  const colourCode: Record<string, string> = { usage: '#42AB45', planned: '#000000', recommended: '#0278D5' }
  const divs = sortedPercent.map((x, i) => {
    return (
      <div key={i} style={{ backgroundColor: colourCode[sortedPercent[i][0]], width: `${x[1]}%`, height: '100%' }} />
    )
  })

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
      {divs}
    </div>
  )
}

const CostSlider = (costSliderParms: CostSliderParams) => {
  const [thumbMoved, setThumbMoved] = useState<boolean>(false)

  const usagePercent = costSliderParms.currentUsage / costSliderParms.maxVal
  const recommendedPercent = costSliderParms.recommended / costSliderParms.maxVal
  const plannedPercent = (costSliderParms.plannedUsage || 0) / costSliderParms.maxVal

  return (
    <Layout.Vertical padding={{ top: 'xlarge' }}>
      <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ bottom: 'xxlarge' }}>
        <Text font={{ size: 'normal' }} color={Color.GREY_600}>
          {costSliderParms.title}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_700}>
          {costSliderParms.summary}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <NumericInput
          value={costSliderParms.currentSliderValue}
          onValueChange={valueProvided => costSliderParms.onSliderChange(valueProvided)}
          width={'50px'}
          buttonPosition={'none'}
          min={costSliderParms.minVal}
          max={costSliderParms.maxVal}
          minorStepSize={costSliderParms.tickSize}
          stepSize={costSliderParms.tickSize}
          majorStepSize={costSliderParms.labelTickSize}
        />
        <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_800} padding={{ left: 'small' }}>
          {costSliderParms.inputUnit}
        </Text>
      </Layout.Horizontal>
      <Container padding={{ top: 'small', bottom: 'small' }}>
        {CustomProgress(usagePercent, plannedPercent, recommendedPercent)}
      </Container>
      <Slider
        min={costSliderParms.minVal}
        max={costSliderParms.maxVal}
        stepSize={costSliderParms.tickSize}
        onChange={x => {
          costSliderParms.onSliderChange(x)
          setThumbMoved(true)
        }}
        onRelease={() => setThumbMoved(false)}
        labelStepSize={costSliderParms.labelTickSize}
        value={costSliderParms.currentSliderValue}
        labelRenderer={providedValue => {
          if (!thumbMoved) {
            return `${providedValue}`
          }
          if (
            providedValue === costSliderParms.minVal ||
            providedValue === costSliderParms.maxVal ||
            (providedValue - costSliderParms.minVal) % costSliderParms.labelTickSize === 0
          ) {
            return `${providedValue}${costSliderParms.labelSuffix}`
          }
          return `${providedValue}${costSliderParms.labelSuffix} \n ${costSliderParms.labelSummary}`
        }}
      />
    </Layout.Vertical>
  )
}

enum CalcPage {
  Calculator,
  Review
}

export const CostCalculator = (): JSX.Element => {
  const [, plan] = acquireCurrentPlan('')
  const frequencyString = (time: PlanType) => (time === PlanType.MONTHLY ? 'month' : 'year')

  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CF)

  const licenseInfo = useLicenseStore()
  const edition = licenseInfo?.licenseInformation?.CF?.edition

  const { usage } = usageData
  const { limit } = limitData

  const developerPlannedSeats = limit?.ff?.totalFeatureFlagUnits || 0
  const developerUsageSeats = usage?.ff?.activeFeatureFlagUsers?.count || 0
  const developerRecommendedSeats = Math.ceil((developerUsageSeats + 1) * 1.1)

  const mauPlannedSeats = limit?.ff?.totalFeatureFlagUnits || 0
  const mauUsageSeats = usage?.ff?.activeClientMAUs?.count || 0
  const mauRecommendedSeats = Math.ceil((mauUsageSeats / 25 + 1) * 1.1) * 25

  const [paymentFrequencySelected, setPaymentFrequencySelected] = useState<PlanType>(PlanType.YEARLY)
  const [editionSelected, setEditionSelected] = useState<Editions>(Editions.TEAM)
  const [developerSelected, setDeveloperSelected] = useState<number>(developerRecommendedSeats)
  const [mausSelected, setMausSelected] = useState<number>(mauRecommendedSeats)
  const [shownPage, setShownPage] = useState<CalcPage>(CalcPage.Calculator)
  const [premiumSupport, setPremiumSupport] = useState<boolean>(true)
  const [premiumSupportDisabled, setPremiumSupportDisabled] = useState<boolean>(false)

  const { accountId } = useParams<AccountPathProps>()
  const { mutate: createNewSubscription, loading: subscriptionLoading } = useCreateFfSubscription({
    queryParams: { accountIdentifier: accountId }
  })
  const [clientSecret, setClientSecret] = useState<string>('')
  const [reviewClicked, setReviewClicked] = useState<boolean>(false)

  useEffect(() => {
    if (!reviewClicked) {
      return
    }
    createNewSubscription({
      accountId: accountId,
      edition: editionSelected,
      numberOfDevelopers: developerSelected,
      numberOfMau: Math.round(mausSelected / 25),
      paymentFreq: paymentFrequencySelected,
      premiumSupport: !premiumSupportDisabled
    })
      .then(resp => {
        const respondedData = resp?.data
        const paymentIntent = respondedData?.paymentIntent
        const dueTodayTotal = respondedData?.totalAmount || 0
        const acqCl = resp?.data?.clientSecret || ''
        setClientSecret(acqCl)
      })
      .then(() => {
        setShownPage(CalcPage.Review)
      })
      .finally(() => {
        setReviewClicked(false)
        setShownPage(CalcPage.Review)
      })
  }, [
    accountId,
    createNewSubscription,
    developerSelected,
    editionSelected,
    mausSelected,
    paymentFrequencySelected,
    premiumSupportDisabled,
    reviewClicked
  ])

  const isLoading = limitData.loadingLimit || usageData.loadingUsage

  useEffect(() => {
    if (paymentFrequencySelected === PlanType.MONTHLY) {
      setPremiumSupport(false)
      setPremiumSupportDisabled(true)
    } else {
      setPremiumSupportDisabled(false)
    }
  }, [paymentFrequencySelected])

  const { data } = useRetrieveProductPrices({ queryParams: { accountIdentifier: accountId, moduleType: 'CF' } })
  if (!data) {
    return <ContainerSpinner />
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const providedPrices = [...data?.data?.prices]
  const allPrices = {
    FF_TEAM_DEVELOPERS_MONTHLY: undefined,
    FF_TEAM_MAU_MONTHLY: undefined,
    FF_TEAM_DEVELOPERS_YEARLY: undefined,
    FF_TEAM_MAU_YEARLY: undefined,
    FF_ENTERPRISE_DEVELOPERS_MONTHLY: undefined,
    FF_ENTERPRISE_DEVELOPERS_YEARLY: undefined,
    FF_ENTERPRISE_MAU_MONTHLY: undefined,
    FF_ENTERPRISE_MAU_YEARLY: undefined
  }
  providedPrices.forEach(metaData => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    allPrices[metaData.lookupKey] = metaData.unitAmount
  })

  const pricesSelected = {
    TEAM: {
      monthly: {
        developer: allPrices?.FF_TEAM_DEVELOPERS_MONTHLY,
        MAU: allPrices?.FF_TEAM_MAU_MONTHLY
      },
      yearly: {
        developer: allPrices?.FF_TEAM_DEVELOPERS_YEARLY,
        MAU: allPrices?.FF_TEAM_MAU_YEARLY
      }
    },
    ENTERPRISE: {
      monthly: {
        developer: allPrices?.FF_ENTERPRISE_DEVELOPERS_MONTHLY,
        MAU: allPrices?.FF_ENTERPRISE_MAU_MONTHLY
      },
      yearly: {
        developer: allPrices?.FF_ENTERPRISE_DEVELOPERS_YEARLY,
        MAU: allPrices?.FF_ENTERPRISE_MAU_YEARLY
      }
    }
  }

  if (isLoading) {
    return <ContainerSpinner />
  }

  const nextMonthStart = moment().add(1, 'month').startOf('month')
  const nextYearStart = moment().add(1, 'year').startOf('year')

  let prorateDate
  // let timeDiff
  // let fractionCost
  if (paymentFrequencySelected === PlanType.MONTHLY) {
    prorateDate = nextMonthStart
    // timeDiff = [dayDiffMonth, 'days']
    // fractionCost = fractionCostMonth
  } else {
    prorateDate = nextYearStart
    // timeDiff = [monthDiffYear, 'months']
    // fractionCost = fractionCostYear
  }

  const getCostForUnits = (units: number, unitType: ffUnitTypes, editionProvided: Editions, planType: PlanType) => {
    switch (editionProvided) {
      case Editions.FREE:
        return 0
      case Editions.TEAM:
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return (pricesSelected['TEAM'][planType][unitType] * units) / 100
      case Editions.ENTERPRISE:
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return (pricesSelected['ENTERPRISE'][planType][unitType] * units) / 100
      default:
        return 0
    }
  }

  const totalDeveloperRate = getCostForUnits(
    developerSelected,
    ffUnitTypes.DEVELOPER,
    editionSelected,
    paymentFrequencySelected
  )
  const totalMauRate = getCostForUnits(mausSelected, ffUnitTypes.MAU, editionSelected, paymentFrequencySelected) / 25

  const moneySavedYearly =
    paymentFrequencySelected === PlanType.MONTHLY
      ? totalDeveloperRate * 12 -
        getCostForUnits(developerSelected, ffUnitTypes.DEVELOPER, editionSelected, PlanType.YEARLY) +
        (totalMauRate * 12 - getCostForUnits(mausSelected, ffUnitTypes.MAU, editionSelected, PlanType.YEARLY) / 25)
      : 0
  const supportCost = premiumSupport ? 160 : 0
  const totalCost = totalDeveloperRate + totalMauRate + supportCost
  // const dueTodayCost = Math.round(totalCost * fractionCost)

  const title = `Feature Flag Subscription`
  const monthYear = frequencyString(paymentFrequencySelected)

  return (
    <div>
      {shownPage === CalcPage.Calculator && (
        <div style={{ margin: '0 68px 44px 68px' }}>
          <Layout.Horizontal id={'title'} flex={{ justifyContent: 'space-around' }} padding={{ bottom: 'xxlarge' }}>
            <Text
              icon={'ff-solid'}
              iconProps={{ size: 24 }}
              font={{ variation: FontVariation.H3 }}
              className={cx(css.textwrap)}
            >
              {title}
            </Text>
            <GetEditionBox editionType={edition as Editions} />
            <div style={{ width: '100%' }} />
            <Text
              font={{ variation: FontVariation.SMALL }}
              className={cx(css.textwrap, css.linkDecoration)}
              padding={{ right: 'large' }}
            >
              <a>Compare features</a>
            </Text>
            <PillToggle
              onChange={editionClick => setEditionSelected(editionClick)}
              options={[
                { label: 'Team', value: Editions.TEAM },
                {
                  label: 'Enterprise',
                  value: Editions.ENTERPRISE
                }
              ]}
              selectedView={editionSelected}
            />
          </Layout.Horizontal>
          <Container>
            <Layout.Horizontal
              flex={{ justifyContent: 'space-between' }}
              padding={{ top: 'xsmall', bottom: 'xxlarge' }}
            >
              <Layout.Vertical>
                <InfoBox
                  title={'Developer Seats'}
                  recommended={developerRecommendedSeats}
                  using={developerUsageSeats}
                  planned={developerPlannedSeats}
                />
                <CostSlider
                  title={'How many developers do you need'}
                  summary={`1 developer = $ ${totalDeveloperRate / developerSelected}/ ${monthYear}`}
                  inputUnit={'Developers'}
                  plannedUsage={developerPlannedSeats}
                  currentUsage={developerUsageSeats}
                  recommended={developerRecommendedSeats}
                  currentSliderValue={developerSelected}
                  minVal={1}
                  maxVal={50}
                  tickSize={1}
                  labelTickSize={49}
                  onSliderChange={x => setDeveloperSelected(x)}
                  labelSuffix={' developers'}
                  labelSummary={`$ ${totalDeveloperRate}/ ${monthYear}`}
                />
              </Layout.Vertical>
              <Layout.Vertical>
                <InfoBox
                  title={'MAUs Usage'}
                  units={'k'}
                  recommended={mauRecommendedSeats}
                  using={mauUsageSeats}
                  planned={mauPlannedSeats}
                />
                <CostSlider
                  title={'How many monthly active units do you need'}
                  summary={`25k MAUs = $ ${totalMauRate / (mausSelected / 25)}/ ${monthYear} `}
                  inputUnit={'K MAUs'}
                  plannedUsage={mauPlannedSeats}
                  currentUsage={mauUsageSeats}
                  recommended={mauRecommendedSeats}
                  currentSliderValue={mausSelected}
                  minVal={0}
                  maxVal={1000}
                  tickSize={25}
                  labelTickSize={250}
                  onSliderChange={x => setMausSelected(x)}
                  labelSuffix={'k MAUs'}
                  labelSummary={`$ ${totalMauRate}/ ${monthYear}`}
                />
              </Layout.Vertical>
            </Layout.Horizontal>
          </Container>
          <Layout.Horizontal padding={{ top: 'xlarge', bottom: 'xlarge' }} className={cx(css.pillboxgap)}>
            <PillToggle
              onChange={planFrequency => setPaymentFrequencySelected(planFrequency)}
              options={[
                {
                  label: 'Yearly',
                  value: PlanType.YEARLY
                },
                { label: 'Monthly', value: PlanType.MONTHLY }
              ]}
              selectedView={paymentFrequencySelected}
            />
            {paymentFrequencySelected === PlanType.MONTHLY && (
              <Text font={{ variation: FontVariation.SMALL }}>{`Save $ ${moneySavedYearly} paying yearly`}</Text>
            )}
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
              <Layout.Vertical>
                <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
                  {'Developer Seats'}
                </Text>
                <Layout.Horizontal flex={{ alignItems: 'baseline' }} padding={{ top: 'small' }}>
                  <Text font={{ size: 'medium' }} padding={{ bottom: 'xsmall' }}>
                    {`$ ${totalDeveloperRate}`}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
              <Layout.Vertical
                flex={{ justifyContent: 'center' }}
                padding={{ left: 'small', right: 'small', top: 'small' }}
              >
                <Text font={{ size: 'medium' }}>{`+`}</Text>
              </Layout.Vertical>
            </Layout.Horizontal>
            <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
              <Layout.Vertical>
                <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
                  {'MAUs Usage'}
                </Text>
                <Layout.Horizontal flex={{ alignItems: 'baseline' }} padding={{ top: 'small' }}>
                  <Text font={{ size: 'medium' }}>{`$ ${totalMauRate}`}</Text>
                </Layout.Horizontal>
              </Layout.Vertical>
              <Layout.Vertical
                flex={{ justifyContent: 'center' }}
                padding={{ left: 'small', right: 'small', top: 'small' }}
              >
                <Text font={{ size: 'medium' }}>{`+`}</Text>
              </Layout.Vertical>
            </Layout.Horizontal>
            <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
              <Layout.Vertical>
                <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
                  {'Support'}
                </Text>
                <Layout.Horizontal flex={{ alignItems: 'baseline' }} className={cx(css.supportInfoBoxText)}>
                  <Text font={{ size: 'medium' }}>{`$ ${supportCost}`}</Text>
                </Layout.Horizontal>
                <Toggle
                  label={premiumSupport ? 'Premium Support' : 'Standard support'}
                  disabled={premiumSupportDisabled}
                  checked={premiumSupport}
                  onToggle={toggleState => setPremiumSupport(toggleState)}
                />
              </Layout.Vertical>
              <Layout.Vertical
                flex={{ justifyContent: 'center' }}
                padding={{ left: 'small', right: 'small', top: 'small' }}
              >
                <Text font={{ size: 'medium' }}>{`=`}</Text>
              </Layout.Vertical>
            </Layout.Horizontal>
            <Layout.Horizontal className={cx(css.pricingdisplayItem)}>
              <Layout.Vertical>
                <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
                  {'Next Payment'}
                </Text>
                <Layout.Horizontal flex={{ alignItems: 'baseline' }} className={cx(css.nextPaymentPadding)}>
                  <Text font={{ size: 'medium' }}>
                    {`$ ${totalCost} per ${frequencyString(paymentFrequencySelected)} `}
                  </Text>
                </Layout.Horizontal>
                <Text font={{ size: 'small' }} color={Color.BLACK}>
                  {`On ${prorateDate.format('MMMM Do YYYY')}`}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
            {/*<div style={{ width: '100%' }} />*/}
            {/*  <Layout.Horizontal className={cx(css.pricingdisplayItem, css.duetodaybox)}>*/}
            {/*    <Layout.Vertical>*/}
            {/*      <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>*/}
            {/*        {'Due Today'}*/}
            {/*      </Text>*/}
            {/*      <Layout.Horizontal className={cx(css.dueTodayPadding)}>*/}
            {/*        <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>*/}
            {/*          {`$ ${dueTodayCost}`}*/}
            {/*        </Text>*/}
            {/*      </Layout.Horizontal>*/}
            {/*      <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>*/}
            {/*        {`Prorated for next ${timeDiff[0]} ${timeDiff[1]}`}*/}
            {/*      </Text>*/}
            {/*    </Layout.Vertical>*/}
            {/*  </Layout.Horizontal>*/}
          </Layout.Horizontal>
          <Layout.Horizontal padding={{ top: 'xxlarge' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <Button
              text={'Review Changes'}
              variation={ButtonVariation.PRIMARY}
              size={ButtonSize.MEDIUM}
              onClick={() => setReviewClicked(true)}
              disabled={reviewClicked}
            />
            <Layout.Horizontal padding={{ left: 'xlarge' }}>
              <Text>Or</Text>
              <Text padding={{ left: 'small' }} className={cx(css.linkDecoration)}>
                <a>Contact Sales</a>
              </Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </div>
      )}
      {shownPage === CalcPage.Review && (
        <ReviewPage
          previousEdition={edition}
          previousPlan={plan}
          newEdition={editionSelected}
          newPlan={paymentFrequencySelected}
          previousDevelopers={developerPlannedSeats ? developerPlannedSeats : developerUsageSeats}
          previousMau={mauPlannedSeats ? mauPlannedSeats : mauUsageSeats}
          newDevelopers={developerSelected}
          developerCost={totalDeveloperRate}
          newMau={mausSelected}
          mauCost={totalMauRate}
          supportCost={supportCost}
          total={totalCost + supportCost + supportCost}
          clientSecret={clientSecret}
          backButtonClick={() => setShownPage(CalcPage.Calculator)}
        />
      )}
    </div>
  )
}

export const ExampleModal = () => {
  const modalPropsLight: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    title: '',
    className: Classes.DIALOG,
    style: { width: 1056, height: 750 }
  }

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      <CostCalculator />
    </Dialog>
  ))

  return (
    <React.Fragment>
      <Button text="Open Modal" onClick={openModal} />
    </React.Fragment>
  )
}
