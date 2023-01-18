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
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout,
  MultiTypeInputType
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Connectors } from '@connectors/constants'
import type { StackWizardStepProps } from './index'
import css from './StackWizard.module.scss'

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

const ProvisionerDetailsStage: React.FC<StackWizardStepProps> = props => {
  const { name, identifier, nextStep, prevStepData } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <Layout.Vertical height="inherit" spacing="medium" className={css.optionsViewContainer}>
      <Heading level="2" margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Heading>
      <Formik
        initialValues={{
          workspace: '',
          connector: '',
          autoApprove: false,
          provisionerVersion: '',
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        validationSchema={Yup.object({
          workspace: Yup.string().required(getString('iacm.stackWizard.workspaceRequired')),
          connector: Yup.string().required(getString('iacm.stackWizard.connectorRequired')),
          autoApprove: Yup.boolean().required(getString('iacm.stackWizard.autoApproveRequired')),
          provisionerVersion: Yup.string().required(getString('iacm.stackWizard.provisionerVersionRequired'))
        })}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        enableReinitialize
      >
        {formik => {
          const { values, isValid } = formik
          return (
            <FormikForm>
              <Layout.Horizontal spacing="medium">
                <Layout.Vertical>
                  <FormInput.Text name="workspace" label={getString('pipelineSteps.workspace')} />
                  <FormMultiTypeConnectorField
                    key={values.connector}
                    name="connector"
                    label={getString('connector')}
                    placeholder={`${getString('select')} ${getString('connector')}`}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    multiTypeProps={{ expressions, allowableTypes: [MultiTypeInputType.FIXED] }}
                    createNewLabel={getString('connectors.createConnector')}
                    type={Connectors.AWS}
                    enableConfigureOptions={false}
                    isNewConnectorLabelVisible
                    setRefValue
                  />
                  <FormInput.Select
                    label={getString('iacm.stackWizard.provisionerVersion')}
                    name="provisionerVersion"
                    items={provisionerVersions}
                  />
                  <FormInput.CheckBox name="autoApprove" label={getString('iacm.stackWizard.autoApprove')} />
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
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default ProvisionerDetailsStage
