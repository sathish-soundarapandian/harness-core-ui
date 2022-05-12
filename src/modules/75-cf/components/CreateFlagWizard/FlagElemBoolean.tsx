/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useState, useEffect } from 'react'
import * as yup from 'yup'
import {
  Formik,
  FormikForm,
  FormInput,
  StepProps,
  Text,
  Layout,
  SelectOption,
  Container,
  Button,
  ButtonVariation,
  ModalErrorHandler,
  FlexExpander
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { FormikEffect, FormikEffectProps } from '@common/components/FormikEffect/FormikEffect'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import type { FlagWizardFormValues } from './FlagWizard'
import css from './FlagElemVariations.module.scss'

export interface FlagElemBooleanProps extends StepProps<Partial<FlagWizardFormValues>> {
  toggleFlagType: (newFlag: string) => void
  flagTypeOptions: SelectOption[]
  projectIdentifier?: string | number | null | undefined
  // FIXME: Check for the right type
  setModalErrorHandler: Dispatch<SetStateAction<any>>
  isLoadingCreateFeatureFlag: boolean
}

const TRUE = 'true'
const FALSE = 'false'
const True = 'True'
const False = 'False'

const FlagElemBoolean = (props: FlagElemBooleanProps): JSX.Element => {
  const {
    toggleFlagType,
    flagTypeOptions,
    prevStepData,
    previousStep,
    setModalErrorHandler,
    isLoadingCreateFeatureFlag,
    currentStep,
    totalSteps
  } = props
  const { getString } = useStrings()

  const handleNewFlagType = (newFlagTypeVal: string): void => {
    toggleFlagType(newFlagTypeVal)
  }

  const [trueFlagOption, setTrueFlagOption] = useState(True)
  const [falseFlagOption, setFalseFlagOption] = useState(False)

  const onTrueFlagChange = (valInput: string): void => {
    setTrueFlagOption(valInput)
  }

  const onFalseFlagChange = (valInput: string): void => {
    setFalseFlagOption(valInput)
  }

  const selectValueTrue = { label: trueFlagOption, value: TRUE }
  const selectValueFalse = { label: falseFlagOption, value: FALSE }

  const flagBooleanRules = [selectValueTrue, selectValueFalse]

  const onClickBack = (): void => {
    previousStep?.({ ...prevStepData })
  }

  const isLastStep = currentStep?.() === totalSteps?.()

  const onFormikEffect: FormikEffectProps['onChange'] = ({ prevValues, nextValues }) => {
    if (prevValues.variations[0].name !== nextValues.variations[0].name) {
      onTrueFlagChange(nextValues.variations[0].name)
    }

    if (prevValues.variations[1].name !== nextValues.variations[1].name) {
      onFalseFlagChange(nextValues.variations[1].name)
    }
  }

  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(FeatureActions.VariationSettings, {
      category: Category.FEATUREFLAG,
      flagTypeView: FlagTypeVariations.booleanFlag
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Formik
      initialValues={{
        kind: FlagTypeVariations.booleanFlag,
        variations: [
          { identifier: TRUE, name: True, value: TRUE },
          { identifier: FALSE, name: False, value: FALSE }
        ],
        defaultOnVariation: TRUE,
        defaultOffVariation: FALSE
      }}
      formName="cfFlagBool"
      validationSchema={yup.object().shape({
        variations: yup.array().of(
          yup.object().shape({
            name: yup.string().trim().required(getString('cf.creationModal.nameIsRequired'))
          })
        )
      })}
      onSubmit={formData => {
        trackEvent(FeatureActions.CreateFeatureFlagSubmit, {
          category: Category.FEATUREFLAG,
          data: { ...prevStepData, ...formData, kind: FlagTypeVariations.booleanFlag }
        })
        props.nextStep?.({ ...prevStepData, ...formData, kind: FlagTypeVariations.booleanFlag })
      }}
    >
      {formik => (
        <FormikForm data-testid="boolean-step-form">
          <FormikEffect onChange={onFormikEffect} formik={formik} />
          <Container
            flex
            height="100%"
            style={{ flexDirection: 'column', alignItems: 'baseline' }}
            className={css.booleanForm}
          >
            <Container style={{ flexGrow: 1, overflow: 'auto' }} width="100%">
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Text
                style={{ fontSize: '18px', color: Color.GREY_700 }}
                margin={{ bottom: 'xlarge' }}
                padding={{ left: 'xsmall' }}
              >
                {getString('cf.creationModal.variationSettingsHeading')}
              </Text>
              <Layout.Vertical padding={{ left: 'xsmall' }}>
                <FormInput.Select
                  data-testid="kind-dropdown"
                  name="kind"
                  label={getString('cf.creationModal.flagType')}
                  items={flagTypeOptions}
                  onChange={newFlagType => handleNewFlagType(newFlagType.value as string)}
                  className={css.inputSelectFlagType}
                />

                <Layout.Horizontal
                  style={{
                    background: '#FAFBFC',
                    boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                    borderRadius: '4px',
                    width: '570px',
                    marginBottom: 'var(--spacing-small)',
                    padding: 'var(--spacing-small) var(--spacing-small) 0 var(--spacing-medium)'
                  }}
                >
                  <Container width={255}>
                    <FormInput.InputWithIdentifier
                      inputName="variations[0].name"
                      idName="variations[0].identifier"
                      inputLabel={getString('name')}
                      isIdentifierEditable={false}
                      inputGroupProps={{ inputGroup: { autoFocus: true } }}
                    />
                  </Container>
                  <Container width={20} />
                  <Container width={255}>
                    <FormInput.Text
                      name="variations[0].value"
                      label={getString('valueLabel')}
                      disabled
                      className={css.disabledInput}
                    />
                  </Container>
                </Layout.Horizontal>

                <Layout.Horizontal
                  style={{
                    background: '#FAFBFC',
                    boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                    borderRadius: '4px',
                    width: '570px',
                    padding: 'var(--spacing-small) var(--spacing-small) 0 var(--spacing-medium)'
                  }}
                >
                  <Container width={255}>
                    <FormInput.InputWithIdentifier
                      inputName="variations[1].name"
                      idName="variations[1].identifier"
                      inputLabel={getString('name')}
                      isIdentifierEditable={false}
                    />
                  </Container>
                  <Container width={20} />
                  <Container width={255}>
                    <FormInput.Text
                      name="variations[1].value"
                      label={getString('valueLabel')}
                      disabled
                      className={css.disabledInput}
                    />
                  </Container>
                </Layout.Horizontal>
                <Container margin={{ bottom: 'xlarge' }}>
                  <Text color={Color.BLACK} margin={{ top: 'medium' }}>
                    {getString('cf.creationModal.defaultRules')}
                  </Text>

                  <Layout.Vertical margin={{ top: 'medium' }}>
                    <Container>
                      <Layout.Horizontal>
                        <Text width="25%" className={css.serveTextAlign}>
                          {getString('cf.creationModal.flagOn')}
                        </Text>
                        <FormInput.Select name="defaultOnVariation" items={flagBooleanRules} />
                      </Layout.Horizontal>
                    </Container>
                    <Container>
                      <Layout.Horizontal>
                        <Text width="25%" className={css.serveTextAlign}>
                          {getString('cf.creationModal.flagOff')}
                        </Text>
                        <FormInput.Select name="defaultOffVariation" items={flagBooleanRules} />
                      </Layout.Horizontal>
                    </Container>
                  </Layout.Vertical>
                </Container>
              </Layout.Vertical>
            </Container>

            <Layout.Horizontal spacing="small" margin={{ top: 'large' }} width="100%">
              <Button text={getString('back')} onClick={onClickBack} variation={ButtonVariation.SECONDARY} />
              <Button
                type="submit"
                intent="primary"
                rightIcon={isLastStep ? undefined : 'chevron-right'}
                text={isLastStep ? getString('cf.creationModal.saveAndClose') : getString('next')}
                variation={ButtonVariation.PRIMARY}
                disabled={isLoadingCreateFeatureFlag}
                loading={isLoadingCreateFeatureFlag}
              />
              <FlexExpander />
            </Layout.Horizontal>
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}

export default FlagElemBoolean
