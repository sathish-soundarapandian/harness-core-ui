/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Heading, Icon, Layout, Text, Container } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import SLOTargetChartWrapper from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart'
import {
  PeriodTypes,
  PeriodLengthTypes,
  SLOV2FormFields,
  ErrorBudgetInterface,
  SLOTargetAndBudgetPolicyProps
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { flexStart } from './SLOTargetAndBudgetPolicy.constants'
import { convertSLOFormDataToServiceLevelIndicatorDTO } from '../../components/CVCreateSLOV2/CVCreateSLOV2.utils'
import {
  getPeriodLengthOptions,
  getPeriodLengthOptionsForRolling,
  getPeriodTypeOptions,
  getWindowEndOptionsForMonth,
  getWindowEndOptionsForWeek,
  getErrorBudget,
  getCustomOptionsForSLOTargetChart
} from './SLOTargetAndBudgetPolicy.utils'
import { useConfigureSLIContext } from '../SLI/SLIContext'
import SLOTargetCss from './SLOTargetAndBudgetPolicy.module.scss'

interface SLOPeriodInterface {
  periodType?: string
  periodLengthType?: string
  verticalOrientation?: boolean
}

export const SloPeriodLength = ({
  periodType,
  periodLengthType,
  verticalOrientation
}: SLOPeriodInterface): JSX.Element => {
  const { getString } = useStrings()
  const ComponentLayout = verticalOrientation ? Layout.Vertical : Layout.Horizontal
  return (
    <ComponentLayout spacing="medium">
      <FormInput.Select
        name={SLOV2FormFields.PERIOD_TYPE}
        label={getString('cv.slos.sloTargetAndBudget.periodType')}
        items={getPeriodTypeOptions(getString)}
      />
      {periodType === PeriodTypes.CALENDAR ? (
        <>
          <FormInput.Select
            name={SLOV2FormFields.PERIOD_LENGTH_TYPE}
            label={getString('cv.periodLength')}
            items={getPeriodLengthOptions(getString)}
          />
          {periodLengthType === PeriodLengthTypes.MONTHLY && (
            <FormInput.Select
              name={SLOV2FormFields.DAY_OF_MONTH}
              label={getString('cv.windowEndsDay')}
              items={getWindowEndOptionsForMonth()}
              disabled={!periodLengthType}
            />
          )}
          {periodLengthType === PeriodLengthTypes.WEEKLY && (
            <FormInput.Select
              name={SLOV2FormFields.DAY_OF_WEEK}
              label={getString('cv.widowEnds')}
              items={getWindowEndOptionsForWeek(getString)}
              disabled={!periodLengthType}
            />
          )}
        </>
      ) : (
        <FormInput.Select
          name={SLOV2FormFields.PERIOD_LENGTH}
          label={getString('cv.periodLengthDays')}
          items={getPeriodLengthOptionsForRolling()}
        />
      )}
    </ComponentLayout>
  )
}

export const ErrorBudgetCard = (props: ErrorBudgetInterface): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal
      width={200}
      className={SLOTargetCss.errorBudget}
      background={Color.PRIMARY_1}
      margin={{ top: 'large' }}
      padding="medium"
      spacing="small"
      border={{ radius: 15, width: 0 }}
    >
      <Text font={{ variation: FontVariation.FORM_LABEL }} color={Color.GREY_600}>
        {getString('cv.errorBudget')}
      </Text>
      <Text inline font={{ variation: FontVariation.FORM_HELP }}>
        {getErrorBudget({ ...props })} {getString('cv.mins')}
      </Text>
    </Layout.Horizontal>
  )
}

const SLOTargetAndBudgetPolicy: React.FC<SLOTargetAndBudgetPolicyProps> = ({ children, formikProps, ...rest }) => {
  const { getString } = useStrings()

  const { isWindowBased } = useConfigureSLIContext()
  const { periodType, periodLength = '', periodLengthType, SLOTargetPercentage } = formikProps.values || {}
  const errorBudgetCardProps = { periodType, periodLength, periodLengthType, SLOTargetPercentage }

  return (
    <>
      <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'xsmall' }}>
        {getString('cv.slos.sloTargetAndBudget.setSLOTarget')}
      </Heading>
      <Layout.Horizontal flex={{ justifyContent: flexStart, alignItems: 'stretch' }}>
        <Container width="50%" border={{ right: true }} padding={{ right: 'xlarge' }}>
          <Layout.Vertical width="100%">
            <Heading
              level={4}
              font={{ variation: FontVariation.FORM_SUB_SECTION }}
              margin={{ top: 'small', bottom: 'medium' }}
            >
              {getString('cv.slos.sloTargetAndBudget.complianceTimePeriodTitle')}
            </Heading>
            <SloPeriodLength periodType={periodType} periodLengthType={periodLengthType} />
            <FormInput.Text
              name={SLOV2FormFields.SLO_TARGET_PERCENTAGE}
              label={getString('cv.SLOTarget')}
              inputGroup={{
                type: 'number',
                min: 0,
                max: 100,
                step: 'any',
                rightElement: <Icon name="percentage" padding="small" />
              }}
              className={SLOTargetCss.sloTarget}
            />
          </Layout.Vertical>
        </Container>
        <Container height="inherit" width="50%" padding={{ left: 'xxlarge' }}>
          <SLOTargetChartWrapper
            customChartOptions={getCustomOptionsForSLOTargetChart(formikProps.values.SLOTargetPercentage)}
            monitoredServiceIdentifier={formikProps.values.monitoredServiceRef}
            serviceLevelIndicator={convertSLOFormDataToServiceLevelIndicatorDTO(formikProps.values)}
            {...rest}
            bottomLabel={
              <Text
                color={Color.GREY_500}
                font={{ variation: FontVariation.SMALL_SEMI }}
                margin={{ top: 'large', left: 'xxxlarge' }}
                icon="symbol-square"
                iconProps={{ color: Color.PRIMARY_4 }}
                flex={{ alignItems: 'center' }}
              >
                {getString('cv.SLIMetricRatio')}
              </Text>
            }
          />
          {isWindowBased && <ErrorBudgetCard {...errorBudgetCardProps} />}
        </Container>
      </Layout.Horizontal>
    </>
  )
}

export default SLOTargetAndBudgetPolicy
