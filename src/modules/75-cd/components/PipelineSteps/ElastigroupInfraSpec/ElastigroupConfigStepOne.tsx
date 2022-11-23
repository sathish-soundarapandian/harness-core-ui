/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Button, Text, ButtonVariation, Thumbnail, FormikForm, StepProps, Formik } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { ConnectorConfigDTO, StoreConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import css from './ElastigroupInfra.module.scss'

interface ElastigroupConfigStepOneProps {
  stepName: string
  isReadonly: boolean
  initialValues: StoreConfigWrapper
}

function ElastigroupConfigStepOne({
  stepName,
  isReadonly,
  initialValues,
  nextStep
}: StepProps<ConnectorConfigDTO> & ElastigroupConfigStepOneProps): React.ReactElement {
  const { getString } = useStrings()

  const submitFirstStep = async (formData: StoreConfigWrapper): Promise<void> => /* istanbul ignore next */ {
    nextStep?.({ ...formData })
  }
  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={initialValues}
        formName="elastigroupStore"
        onSubmit={formData => {
          submitFirstStep({ ...formData })
        }}
        enableReinitialize
      >
        <FormikForm>
          <Layout.Vertical
            flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            className={css.elastiStepOne}
          >
            <Layout.Vertical>
              <Layout.Horizontal spacing="large">
                <Thumbnail selected value="harness" label="harness" icon="harness" />
              </Layout.Horizontal>
            </Layout.Vertical>

            <Layout.Horizontal spacing="medium" className={css.saveBtn}>
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('continue')}
                rightIcon="chevron-right"
                disabled={isReadonly}
              />
            </Layout.Horizontal>
          </Layout.Vertical>
        </FormikForm>
      </Formik>
    </Layout.Vertical>
  )
}

export default ElastigroupConfigStepOne
