/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Text,
  Layout,
  StepProps,
  FontVariation,
  Container,
  Formik,
  FormikForm,
  FormInput
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { NameSchema } from '@common/utils/Validation'
import type { CreateUpdateLdapWizardProps, LdapWizardStepProps } from '../CreateUpdateLdapWizard'
import css from '../CreateUpdateLdapWizard.module.scss'

export interface LdapOverview {
  displayName?: string
}

export const StepOverview: React.FC<StepProps<CreateUpdateLdapWizardProps> & LdapWizardStepProps<LdapOverview>> =
  props => {
    const { getString } = useStrings()
    const { stepData, updateStepData, name, closeWizard } = props
    const displayName = stepData?.displayName ?? ''

    const getInitialValues = {
      displayName
    }
    const validationSchema = Yup.object().shape({
      displayName: NameSchema()
    })
    return (
      <Layout.Vertical className={cx(css.stepContainer, css.verticalStretch)}>
        <Formik<LdapOverview>
          validationSchema={validationSchema}
          initialValues={getInitialValues}
          formName="stepOverviewForm"
          onSubmit={formData => {
            updateStepData(formData)
            props.nextStep?.()
          }}
        >
          <FormikForm>
            <Layout.Horizontal margin={{ bottom: 'large' }} style={{ alignItems: 'center' }}>
              <Text font={{ variation: FontVariation.H4 }} margin={{ right: 'small' }}>
                {name}
              </Text>
            </Layout.Horizontal>
            <Container>
              <FormInput.Text label={getString('name')} name="displayName" />
            </Container>
            <Layout.Horizontal className={css.stepCtaContainer}>
              <Button
                onClick={() => closeWizard?.()}
                text={getString('back')}
                icon="chevron-left"
                margin={{ right: 'small' }}
                variation={ButtonVariation.SECONDARY}
                data-testid="cancel-overview-step"
              />
              <Button
                intent="primary"
                type={'submit'}
                text={getString('continue')}
                rightIcon="chevron-right"
                data-testid="submit-overview-step"
              />
            </Layout.Horizontal>
          </FormikForm>
        </Formik>
      </Layout.Vertical>
    )
  }

export default StepOverview
