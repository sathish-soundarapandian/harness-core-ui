/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  DateInput,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { FormGroup } from '@blueprintjs/core'
import { get } from 'lodash-es'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Connectors } from '@connectors/constants'
import type { StackWizardStepProps } from '.'
import css from './StackWizard.module.scss'

const ProvisionerDetailsStage: React.FC<StepProps<StackWizardStepProps>> = props => {
  const { name, identifier, nextStep, prevStepData } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [multitypeInputValue] = useState<MultiTypeInputType | undefined>(undefined)
  const provisionerVersions = [
    {
      label: '1.0.0',
      value: '1.0.0'
    },
    {
      label: '2.0.0',
      value: '2.0.0'
    }
  ]

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Text>
      <Formik
        initialValues={{
          workspace: '',
          ttl: '',
          connector: '',
          autoApprove: false,
          provisionerVersion: '',
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        validationSchema={Yup.object().shape({
          workspace: Yup.string().required('Required'),
          ttl: Yup.string().required('Required'),
          connector: Yup.string().required('Required'),
          autoApprove: Yup.boolean().required('Required'),
          provisionerVersion: Yup.string().required('Required')
        })}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        enableReinitialize={true}
      >
        {formik => {
          const { values, setFieldValue, errors, isValid } = formik
          return (
            <FormikForm>
              <Layout.Vertical>
                <Layout.Horizontal spacing="medium">
                  <Layout.Vertical>
                    <FormInput.MultiTextInput name="workspace" label="Workspace" />
                    <FormGroup
                      label={'Time to Live'}
                      labelFor={'ttl'}
                      helperText={get(errors, 'ttl')}
                      intent={get(errors, 'ttl') ? 'danger' : undefined}
                    >
                      <DateInput
                        name={'ttl'}
                        contentEditable={false}
                        timePrecision="minute"
                        value={String(values.ttl)}
                        onChange={value => {
                          setFieldValue('ttl', Number(value))
                        }}
                        dateProps={{
                          timePickerProps: { useAmPm: true },
                          highlightCurrentDay: true,
                          maxDate: moment().add(5, 'year').toDate()
                        }}
                        popoverProps={{
                          disabled: false,
                          usePortal: true
                        }}
                        dateTimeFormat="LLLL"
                        autoComplete="off"
                        readOnly
                      />
                    </FormGroup>
                    <FormMultiTypeConnectorField
                      key={values.connector}
                      name="connector"
                      label={`${getString('connector')}`}
                      placeholder={`${getString('select')} ${getString('connector')}`}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      multiTypeProps={{ expressions }}
                      isNewConnectorLabelVisible={true}
                      createNewLabel={'Create New Connector'}
                      type={Connectors.AWS}
                      enableConfigureOptions={false}
                      multitypeInputValue={multitypeInputValue}
                      setRefValue
                      // gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    <FormInput.Select
                      label={'Provisioner Version'}
                      name="provisionerVersion"
                      items={provisionerVersions}
                    />
                    <FormInput.CheckBox name="autoApprove" label="Auto Approve" />
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    disabled={!isValid}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default ProvisionerDetailsStage
