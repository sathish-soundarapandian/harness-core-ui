/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FieldArray, FieldArrayRenderProps, FormikProps } from 'formik'
import {
  Container,
  FormInput,
  StepProps,
  Layout,
  Text,
  Formik,
  Button,
  Icon,
  FormikForm,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  FlexExpander
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { TagInput } from '@blueprintjs/core'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import { useCreateBudget, Budget, AlertThreshold, useUpdateBudget } from 'services/ce'
import { EmailSchema } from '@common/utils/Validation'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { BudgetStepData } from '../types'
import css from '../PerspectiveCreateBudget.module.scss'
interface Props {
  name: string
  viewId: string
  accountId: string
  onSuccess: () => void
  budget?: Budget
  isEditMode: boolean
  initiatorPage?: string
}

interface ThresholdForm {
  alertThresholds: AlertThreshold[]
}

const makeNewThresold = (): AlertThreshold => {
  return {
    percentage: undefined,
    basedOn: 'ACTUAL_COST',
    userGroupIds: [],
    emailAddresses: []
  }
}

const ConfigureAlerts: React.FC<StepProps<BudgetStepData> & Props> = props => {
  const { getString } = useStrings()
  const [loading, setLoading] = useState(false)
  const [hasError, setError] = useState(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { prevStepData, previousStep, accountId, budget, isEditMode, initiatorPage = '' } = props
  const {
    type,
    perspective,
    growthRate,
    period,
    budgetName,
    perspectiveName,
    startTime,
    budgetAmount = 0
  } = (prevStepData || {}) as BudgetStepData
  const { trackEvent } = useTelemetry()

  const { mutate: updateBudget } = useUpdateBudget({
    id: budget?.uuid || '',
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: createBudget } = useCreateBudget({
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    trackEvent(USER_JOURNEY_EVENTS.CONFIGURE_BUDGET_ALERTS, { pageName: initiatorPage, isEditMode })
  }, [])

  const getInitialValues = () => {
    return { alertThresholds: budget?.alertThresholds || [makeNewThresold()] }
  }

  const handleSubmit = async ({ alertThresholds }: ThresholdForm) => {
    setError(false)
    setLoading(true)

    trackEvent(USER_JOURNEY_EVENTS.SAVE_BUDGET, {
      pageName: initiatorPage,
      isEditMode,
      alerts: alertThresholds.length,
      budgetType: type,
      budgetPeriod: period
    })

    const altThresholds = alertThresholds.map(alt => {
      return {
        basedOn: alt.basedOn,
        emailAddresses: alt.emailAddresses,
        percentage: alt.percentage,
        userGroupIds: alt.userGroupIds
      }
    })

    /* istanbul ignore next */
    const emptyThresholds = (t: AlertThreshold) => (t.emailAddresses?.length || 0) > 0 && t.percentage
    const payload = {
      accountId,
      name: budgetName,
      alertThresholds: altThresholds.filter(emptyThresholds),
      type: type === 'PREVIOUS_MONTH_SPEND' ? 'PREVIOUS_PERIOD_SPEND' : type,
      period,
      startTime,
      growthRate: growthRate,
      budgetAmount: +budgetAmount,
      scope: {
        viewName: perspectiveName,
        type: 'PERSPECTIVE',
        viewId: perspective
      }
    }

    try {
      /* istanbul ignore next */
      await (isEditMode ? updateBudget(payload as Budget) : createBudget(payload as Budget))
      props.onSuccess()
    } catch (e) {
      setError(true)
      setLoading(false)
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
    }
  }

  return (
    <Container>
      <Formik<ThresholdForm>
        formName="alertThresholds"
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          alertThresholds: Yup.array(
            Yup.object({
              emailAddresses: EmailSchema()
            })
          )
        })}
        onSubmit={data => {
          handleSubmit(data)
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container className={css.selectPerspectiveContainer}>
                <Text
                  font={{ variation: FontVariation.H4 }}
                  tooltipProps={{
                    dataTooltipId: 'createBudgetConfigureAlerts'
                  }}
                >
                  {getString('ce.perspectives.budgets.configureAlerts.title')}
                </Text>
                <ModalErrorHandler bind={setModalErrorHandler} />
                <Text
                  margin={{
                    top: 'xlarge',
                    bottom: 'xlarge'
                  }}
                >
                  {getString('ce.perspectives.budgets.configureAlerts.subTitle')}
                </Text>
                <Container
                  margin={{
                    bottom: 'xlarge'
                  }}
                >
                  <Text inline color="grey800" margin={{ right: 'small' }}>
                    {getString('ce.perspectives.budgets.configureAlerts.budgetAmount')}
                  </Text>
                  <Text inline color="grey800" font={{ weight: 'bold', size: 'medium' }}>
                    {formatCost(+budgetAmount)}
                  </Text>
                </Container>
                <Thresholds formikProps={formikProps} hasError={hasError} />
                <FlexExpander />
                <Layout.Horizontal spacing="medium">
                  <Button
                    text={getString('previous')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(prevStepData)}
                  />
                  <Button
                    intent="primary"
                    rightIcon={'chevron-right'}
                    disabled={loading}
                    onClick={() => {
                      setTimeout(() => {
                        formikProps.submitForm()
                      }, 0)
                    }}
                  >
                    {getString('save')}
                  </Button>
                </Layout.Horizontal>
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

interface ThresholdsProps {
  formikProps: FormikProps<ThresholdForm>
  hasError: boolean
}

const Thresholds = (props: ThresholdsProps): JSX.Element => {
  const { formikProps } = props
  const { alertThresholds: alerts } = formikProps.values
  const endRef = useRef<HTMLDivElement>(null)
  const { getString } = useStrings()

  const renderLabels = () => {
    return (
      <div className={css.thresholdLabel}>
        <Text className={css.label}>{getString('ce.perspectives.budgets.configureAlerts.basedOn')}</Text>
        <Text color="grey0">{getString('ce.perspectives.budgets.configureAlerts.exceeds')}</Text>
        <Text className={css.label}>{getString('ce.perspectives.budgets.configureAlerts.percent')}</Text>
        <Text className={css.label}>{getString('ce.perspectives.budgets.configureAlerts.sendAlertTo')}</Text>
      </div>
    )
  }

  const renderThresholds = (arrayHelpers: FieldArrayRenderProps) => {
    return alerts.map((at, idx) => {
      return (
        <Threshold
          key={idx}
          index={idx}
          value={at}
          formikProps={formikProps}
          handleEmailChange={values => {
            formikProps.setFieldValue(`alertThresholds.${idx}.emailAddresses`, values)
          }}
          onDelete={() => {
            if (alerts.length > 1) {
              arrayHelpers.remove(idx)
            }
          }}
        />
      )
    })
  }

  const renderAddThresholdButton = (arrayHelpers: FieldArrayRenderProps) => {
    return (
      <Container margin="medium">
        <Button
          withoutBoxShadow={true}
          className={css.addNewAlertBtn}
          text={getString('ce.perspectives.budgets.configureAlerts.createAlert')}
          onClick={() => {
            arrayHelpers.push(makeNewThresold())
            const timer = setTimeout(() => {
              endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
              clearTimeout(timer)
            }, 0)
          }}
        />
      </Container>
    )
  }

  return (
    <FieldArray
      name="alertThresholds"
      render={arrayHelpers => {
        return (
          <Container>
            <div className={css.thresholds}>
              {renderLabels()}
              <div className={css.threshCtn}>
                {renderThresholds(arrayHelpers)}
                <div ref={endRef} />
              </div>
              {renderAddThresholdButton(arrayHelpers)}
            </div>
          </Container>
        )
      }}
    />
  )
}

interface ThresholdProps {
  handleEmailChange: (value: React.ReactNode) => void
  value: AlertThreshold
  onDelete: () => void
  index: number
  formikProps: FormikProps<ThresholdForm>
}

const Threshold = (props: ThresholdProps): JSX.Element => {
  const { value, index: idx, onDelete, handleEmailChange, formikProps } = props
  const { getString } = useStrings()
  const BASED_ON_OPTIONS = useMemo(() => {
    return [
      {
        label: getString('ce.perspectives.budgets.configureAlerts.actual'),
        value: 'ACTUAL_COST'
      },
      {
        label: getString('ce.perspectives.budgets.configureAlerts.forecasted'),
        value: 'FORECASTED_COST'
      }
    ]
  }, [])

  return (
    <div className={css.threshold}>
      <FormInput.Select
        value={BASED_ON_OPTIONS.find(op => op.value === value.basedOn)}
        items={BASED_ON_OPTIONS}
        name={`alertThresholds.${idx}.basedOn`}
      />
      <Text className={css.pushdown7}>exceeds</Text>
      <FormInput.Text name={`alertThresholds.${idx}.percentage`} inputGroup={{ type: 'number' }} />
      <Container>
        <TagInput
          addOnBlur
          className={css.tagInput}
          tagProps={{ className: css.tag }}
          placeholder={getString('ce.perspectives.reports.emailPlaceholder')}
          onChange={values => handleEmailChange(values)}
          // onAdd={values => {}}
          values={value.emailAddresses || []}
        />
        <Text font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
          {((formikProps.errors.alertThresholds || [])[idx] as any)?.emailAddresses}
        </Text>
      </Container>
      <Icon
        color="grey200"
        size={18}
        name="ban-circle"
        className={css.pushdown7}
        onClick={onDelete}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}

export default ConfigureAlerts
