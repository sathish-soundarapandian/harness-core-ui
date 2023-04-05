/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import {
  Layout,
  Formik,
  Text,
  StepProps,
  Container,
  CardSelect,
  FormInput,
  Button,
  ButtonVariation,
  FormikForm
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'
import { setupBackOffStrategyFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import { BackOffStrategy } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useConnectorWizard } from '../../../CreateConnectorWizard/ConnectorWizardContext'
import { shouldHideHeaderAndNavBtns } from '../../CreateConnectorUtils'
import css from './StepBackOffStrategy.module.scss'

interface AWSBackOffStrategySpec {
  fixedBackoff?: number
  baseDelay?: number
  maxBackoffTime?: number
  retryCount?: number
}
export interface AWSBackOffStrategyValues {
  type: BackOffStrategy
  spec: AWSBackOffStrategySpec
}

interface BackOffStrategyCardType {
  type: BackOffStrategy
  title: string
}

export interface StepBackOffStrategyProps extends ConnectorInfoDTO {
  name: string
  awsSdkClientBackOffStrategyOverride: AWSBackOffStrategyValues
}

const getBackOffStrategySelectionCards = (getString: UseStringsReturn['getString']): BackOffStrategyCardType[] => {
  return [
    {
      type: BackOffStrategy.FixedDelayBackoffStrategy,
      title: getString('connectors.aws.fixedDelay')
    },
    {
      type: BackOffStrategy.EqualJitterBackoffStrategy,
      title: getString('connectors.aws.equalJitter')
    },
    {
      type: BackOffStrategy.FullJitterBackoffStrategy,
      title: getString('connectors.aws.fullJitter')
    }
  ]
}

const defaultInitialValues: AWSBackOffStrategySpec = {
  fixedBackoff: 0,
  baseDelay: 0,
  maxBackoffTime: 0,
  retryCount: 0
}

const StepBackOffStrategy: React.FC<StepProps<StepBackOffStrategyProps> & ConnectorDetailsProps> = props => {
  const { prevStepData, nextStep, context, isEditMode, connectorInfo, helpPanelReferenceId } = props

  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const [initialValues, setInitialValues] = useState<AWSBackOffStrategySpec>(
    (connectorInfo as ConnectorInfoDTO)?.spec?.awsSdkClientBackOffStrategyOverride?.spec ?? defaultInitialValues
  )
  const [selectedBackOffStrategyType, setSelectedBackOffStrategyType] = useState<BackOffStrategy | null>(null)

  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  useConnectorWizard({
    helpPanel: helpPanelReferenceId ? { referenceId: helpPanelReferenceId, contentWidth: 900 } : undefined
  })

  useEffect(() => {
    if (
      isEditMode &&
      connectorInfo &&
      connectorInfo.spec.awsSdkClientBackOffStrategyOverride?.type &&
      !prevStepData?.awsSdkClientBackOffStrategyOverride?.type
    ) {
      const backOffStrategyInitialData = setupBackOffStrategyFormData(connectorInfo)
      setInitialValues(backOffStrategyInitialData.spec)
      setSelectedBackOffStrategyType(backOffStrategyInitialData.type)
    }
  }, [isEditMode, connectorInfo, prevStepData])

  useEffect(() => {
    if (prevStepData && prevStepData.awsSdkClientBackOffStrategyOverride?.type) {
      setSelectedBackOffStrategyType(prevStepData.awsSdkClientBackOffStrategyOverride.type)
    }
  }, [isEditMode, prevStepData])

  useTrackEvent(ConnectorActions.BackOffStrategyStepLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.AWS
  })

  const backOffStrategyCards = getBackOffStrategySelectionCards(getString)
  const selectedBackOffStrategyCard = backOffStrategyCards.find(card => card.type === selectedBackOffStrategyType)

  const getRetryCountValidationSchema = (): Yup.NumberSchema<number | undefined> => {
    return Yup.number()
      .min(0)
      .typeError(getString('common.validation.fieldIsRequired', { name: getString('connectors.aws.retryCount') }))
  }

  const getSpecValidationSchemaObject = () => {
    if (!selectedBackOffStrategyType) {
      return {}
    }

    if (selectedBackOffStrategyType === BackOffStrategy.FixedDelayBackoffStrategy) {
      return {
        fixedBackoff: Yup.number()
          .min(0)
          .typeError(
            getString('common.validation.fieldIsRequired', {
              name: getString('connectors.aws.fixedBackoff')
            })
          ),
        retryCount: getRetryCountValidationSchema()
      }
    }

    return {
      baseDelay: Yup.number()
        .min(0)
        .typeError(
          getString('common.validation.fieldIsRequired', {
            name: getString('connectors.aws.baseDelay')
          })
        ),
      maxBackoffTime: Yup.number()
        .min(0)
        .typeError(
          getString('common.validation.fieldIsRequired', {
            name: getString('connectors.aws.maxBackoffTime')
          })
        ),
      retryCount: getRetryCountValidationSchema()
    }
  }

  const validationSchema = Yup.object().shape(getSpecValidationSchemaObject())

  const changeBackOffStrategyType = (selected: BackOffStrategyCardType) => {
    if (selectedBackOffStrategyType === selected.type) {
      setSelectedBackOffStrategyType(null)
    } else {
      setSelectedBackOffStrategyType(selected.type)
    }
  }

  const handleValidate = (formData: AWSBackOffStrategySpec): void => {
    if (hideHeaderAndNavBtns) {
      handleSubmit(formData)
    }
  }

  const handleSubmit = (formData: AWSBackOffStrategySpec): void => {
    trackEvent(ConnectorActions.BackOffStrategyStepSubmit, {
      category: Category.CONNECTOR,
      connector_type: Connectors.AWS
    })
    const specObj: AWSBackOffStrategySpec =
      selectedBackOffStrategyType === BackOffStrategy.FixedDelayBackoffStrategy
        ? {
            fixedBackoff: formData.fixedBackoff,
            retryCount: formData.retryCount
          }
        : {
            baseDelay: formData.baseDelay,
            maxBackoffTime: formData.maxBackoffTime,
            retryCount: formData.retryCount
          }

    const awsBackOffStrategyData = {
      awsSdkClientBackOffStrategyOverride: {
        type: selectedBackOffStrategyType,
        spec: specObj
      }
    }

    nextStep?.({
      ...connectorInfo,
      ...prevStepData,
      ...(selectedBackOffStrategyType ? awsBackOffStrategyData : {})
    } as StepBackOffStrategyProps)
  }

  const RetryCountField = (
    <FormInput.Text
      name={'retryCount'}
      label={getString('connectors.aws.retryCount')}
      placeholder={getString('connectors.aws.retryCountPlaceholder')}
      inputGroup={{
        type: 'number'
      }}
    />
  )

  return (
    <Layout.Vertical spacing="xxlarge">
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }}>{getString('connectors.aws.awsBackOffStrategy')}</Text>
      )}
      <Formik<AWSBackOffStrategySpec>
        initialValues={{
          ...initialValues,
          ...(prevStepData?.awsSdkClientBackOffStrategyOverride?.spec ?? {})
        }}
        formName="stepAwsBackOffStrategy"
        validationSchema={validationSchema}
        validate={handleValidate}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <FormikForm>
            <Container style={{ minHeight: 460 }}>
              <Text
                font={{ variation: FontVariation.FORM_LABEL, weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'selectBackOffStrategyType' }}
                data-testid={'function-definition-header-container'}
              >
                {getString('connectors.aws.selectBackOffStrategyTypeLabel')}
              </Text>

              <Container margin={{ top: 'medium', bottom: 'medium' }}>
                <CardSelect
                  data={backOffStrategyCards}
                  cornerSelected={true}
                  className={css.backOffStrategySelectionCardWrapper}
                  renderItem={(item: BackOffStrategyCardType) => (
                    <Layout.Horizontal flex spacing={'small'}>
                      <Text
                        font={{ variation: FontVariation.BODY2 }}
                        color={selectedBackOffStrategyType === item.type ? Color.PRIMARY_7 : Color.GREY_800}
                      >
                        {item.title}
                      </Text>
                    </Layout.Horizontal>
                  )}
                  selected={selectedBackOffStrategyCard}
                  onChange={changeBackOffStrategyType}
                />
              </Container>
              <Container margin={{ top: 'huge', bottom: 'medium' }}>
                {selectedBackOffStrategyType === BackOffStrategy.FixedDelayBackoffStrategy && (
                  <>
                    <FormInput.Text
                      name={'fixedBackoff'}
                      label={getString('connectors.aws.fixedBackoff')}
                      placeholder={getString('connectors.aws.fixedBackoffPlaceholder')}
                      inputGroup={{
                        type: 'number'
                      }}
                    />
                    {RetryCountField}
                  </>
                )}
                {(selectedBackOffStrategyType === BackOffStrategy.EqualJitterBackoffStrategy ||
                  selectedBackOffStrategyType === BackOffStrategy.FullJitterBackoffStrategy) && (
                  <>
                    <FormInput.Text
                      name={'baseDelay'}
                      label={getString('connectors.aws.baseDelay')}
                      placeholder={getString('connectors.aws.baseDelayPlaceholder')}
                      inputGroup={{
                        type: 'number'
                      }}
                    />
                    <FormInput.Text
                      name={'maxBackoffTime'}
                      label={getString('connectors.aws.maxBackoffTime')}
                      placeholder={getString('connectors.aws.maxBackoffTimePlaceholder')}
                      inputGroup={{
                        type: 'number'
                      }}
                    />
                    {RetryCountField}
                  </>
                )}
              </Container>
            </Container>
            {!hideHeaderAndNavBtns && (
              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => props?.previousStep?.(props?.prevStepData)}
                  data-name="awsBackButton"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  onClick={formikProps.submitForm}
                  text={getString('continue')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            )}
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepBackOffStrategy
