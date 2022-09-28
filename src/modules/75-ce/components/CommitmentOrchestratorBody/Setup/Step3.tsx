/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Container, FontVariation, Icon, Layout, PillToggle, PillToggleOption, Text } from '@harness/uicore'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { defaultTo, get } from 'lodash-es'
import RangeSlider from '@ce/common/RangeSlider/RangeSlider'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import formatCost from '@ce/utils/formatCost'
import { useStrings } from 'framework/strings'
import { useFetchCOSummary } from 'services/lw-co'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { UpfrontPaymentMethods, useSetupContext } from './SetupContext'
import css from './Setup.module.scss'

const paymentTermOptions: [PillToggleOption<number>, PillToggleOption<number>] = [
  { label: '1 Year', value: 1 },
  { label: '3 Years', value: 3 }
]

const DEFAULT_SAVINGS_PLAN_COVERAGE = 25

const Step3: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { setupData, setSetupData } = useSetupContext()
  const [savingsPlanTerm, setSavingsPlanTerm] = useState(get(setupData, 'savingsPlanConfig.term') || 1)
  const [riTerm, setRiTerm] = useState(get(setupData, 'riConfig.term') || 1)
  const [savingsPlanPayment, setSavingsPlanPayment] = useState<UpfrontPaymentMethods>(
    get(setupData, 'savingsPlanConfig.payment') || UpfrontPaymentMethods.No
  )
  const [riPayment, setRiPayment] = useState<UpfrontPaymentMethods>(
    get(setupData, 'riConfig.payment') || UpfrontPaymentMethods.No
  )
  const [coverage, setCoverage] = useState(
    get(setupData, 'savingsPlanConfig.coveragePercentage') || DEFAULT_SAVINGS_PLAN_COVERAGE
  )
  const [computeSpend, setComputeSpend] = useState(0)

  const { mutate: fetchSummary, loading } = useFetchCOSummary({
    accountId,
    queryParams: {
      accountIdentifier: accountId,
      start_date: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL),
      end_date: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL)
    }
  })

  const otherCoverage = 100 - coverage
  const calculatedComputeSpend = ((setupData?.overallCoverage || 0) / 100) * computeSpend
  const savingsPlanCost = (coverage / 100) * calculatedComputeSpend
  const riCost = (otherCoverage / 100) * calculatedComputeSpend

  useEffect(() => {
    fetchSummary({}).then(res => {
      setComputeSpend(defaultTo(get(res, 'response.compute_spend', 0), 0))
    })
  }, [])

  useEffect(() => {
    handlePlansConfigSave()
  }, [savingsPlanPayment, savingsPlanTerm, riPayment, riTerm, calculatedComputeSpend])

  const handlePlansConfigSave = () => {
    setSetupData?.({
      ...setupData,
      savingsPlanConfig: {
        coverage: savingsPlanCost,
        coveragePercentage: coverage,
        payment: savingsPlanPayment,
        term: savingsPlanTerm
      },
      riConfig: {
        coverage: riCost,
        coveragePercentage: otherCoverage,
        payment: riPayment,
        term: riTerm
      }
    })
  }

  return (
    <Layout.Vertical spacing={'medium'} className={css.step3Cont}>
      <Text font={{ variation: FontVariation.H4 }}>{getString('ce.commitmentOrchestration.setup.step3.heading')}</Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} className={css.desc}>
        {getString('ce.commitmentOrchestration.setup.step3.description')}
      </Text>
      <Layout.Vertical spacing={'xlarge'} className={css.coverageSection}>
        <Container className={css.computeSpendSection}>
          <Text inline font={{ variation: FontVariation.BODY }}>
            {getString('ce.commitmentOrchestration.setup.step3.computeSpendForLast30Days') + ': '}
          </Text>
          <Text inline font={{ variation: FontVariation.H5 }}>
            {loading ? (
              /* istanbul ignore next */ <Icon name="spinner" />
            ) : (
              formatCost(calculatedComputeSpend, { decimalPoints: 2 })
            )}
          </Text>
        </Container>
        <Container className={css.coverageValuesDisplay}>
          <Container>
            <Text inline>{getString('ce.commitmentOrchestration.setup.step3.savingsPlanCoverage') + ' : '}</Text>
            <Text inline color={Color.PURPLE_600} font={{ variation: FontVariation.H4 }}>
              {formatCost(savingsPlanCost, { decimalPoints: 2 })}
            </Text>
          </Container>
          <Container>
            <Text inline>{getString('ce.commitmentOrchestration.setup.step3.riCoverage') + ' : '}</Text>
            <Text inline color={Color.TEAL_600} font={{ variation: FontVariation.H4 }}>
              {formatCost(riCost, { decimalPoints: 2 })}
            </Text>
          </Container>
        </Container>
        <Container className={css.sliderSection}>
          <Layout.Horizontal flex>
            <Text color={Color.PURPLE_600}>{`${getString(
              'ce.commitmentOrchestration.setup.step3.computeSavingsPlan'
            )} ${coverage}%`}</Text>
            <Text color={Color.TEAL_600}>{`${getString(
              'ce.commitmentOrchestration.setup.step3.convertibleRI'
            )} ${otherCoverage}%`}</Text>
          </Layout.Horizontal>
          <RangeSlider
            trackColor={Color.TEAL_600}
            lowFillColor={Color.PURPLE_600}
            rangeProps={{ value: coverage }}
            onChange={/* istanbul ignore next */ val => setCoverage(val)}
            onMouseUp={handlePlansConfigSave}
          />
        </Container>
        <Container className={css.paymentSection}>
          <Layout.Vertical spacing={'xlarge'} className={css.paymentCol}>
            <Text>{getString('ce.commitmentOrchestration.setup.step3.savingsPlanTerm')}</Text>
            <PillToggle<number>
              options={paymentTermOptions}
              selectedView={savingsPlanTerm}
              onChange={setSavingsPlanTerm}
              className={css.tenureSelector}
            />
            <Text>{getString('ce.commitmentOrchestration.setup.step3.savingsPlanPaymentStrategy')}</Text>
            <RadioGroup
              selectedValue={savingsPlanPayment}
              onChange={
                /* istanbul ignore next */ event =>
                  setSavingsPlanPayment(event.currentTarget.value as UpfrontPaymentMethods)
              }
            >
              <Radio label={UpfrontPaymentMethods.All} value={UpfrontPaymentMethods.All} />
              <Radio label={UpfrontPaymentMethods.Partial} value={UpfrontPaymentMethods.Partial} />
              <Radio label={UpfrontPaymentMethods.No} value={UpfrontPaymentMethods.No} />
            </RadioGroup>
          </Layout.Vertical>
          <Layout.Vertical spacing={'xlarge'} className={css.paymentCol}>
            <Text>{getString('ce.commitmentOrchestration.setup.step3.riTerm')}</Text>
            <PillToggle<number>
              options={paymentTermOptions}
              selectedView={riTerm}
              onChange={setRiTerm}
              className={css.tenureSelector}
            />
            <Text>{getString('ce.commitmentOrchestration.setup.step3.riPaymentStrategy')}</Text>
            <RadioGroup
              selectedValue={riPayment}
              onChange={
                /* istanbul ignore next */ event => setRiPayment(event.currentTarget.value as UpfrontPaymentMethods)
              }
            >
              <Radio label={UpfrontPaymentMethods.All} value={UpfrontPaymentMethods.All} />
              <Radio label={UpfrontPaymentMethods.Partial} value={UpfrontPaymentMethods.Partial} />
              <Radio label={UpfrontPaymentMethods.No} value={UpfrontPaymentMethods.No} />
            </RadioGroup>
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default Step3
