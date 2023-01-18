/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import {
  StepProps,
  Layout,
  ButtonVariation,
  Text,
  Formik,
  FormikForm,
  Button,
  ThumbnailSelect,
  Heading,
  MultiTypeInputType
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConnectorIcons, ConnectorTypes } from '@pipeline/components/ApplicationConfig/ApplicationConfig.types'
import type { StackWizardStepProps } from './index'
import css from './StackWizard.module.scss'

const connectorTypesOptions = (_getString: UseStringsReturn['getString']): Item[] => {
  return [
    {
      label: _getString('pipeline.manifestType.gitConnectorLabel'),
      icon: ConnectorIcons['Git'],
      value: 'Git'
    },
    {
      label: _getString('common.repo_provider.githubLabel'),
      icon: ConnectorIcons['Github'],
      value: 'Github'
    },
    {
      label: _getString('common.repo_provider.gitlabLabel'),
      icon: ConnectorIcons['GitLab'],
      value: 'GitLab'
    },
    {
      label: _getString('common.repo_provider.bitbucketLabel'),
      icon: ConnectorIcons['Bitbucket'],
      value: 'Bitbucket'
    }
  ]
}

const StackRepoTypeStep: React.FC<StepProps<StackWizardStepProps>> = props => {
  const { name, identifier, nextStep, prevStepData } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [connectorType, setConnectorType] = React.useState<ConnectorTypes | undefined>()
  const { expressions } = useVariablesExpression()

  return (
    <Layout.Vertical height="inherit" spacing="medium" className={css.optionsViewContainer}>
      <Heading level="2" margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Heading>
      <Formik
        initialValues={{
          repoConnectorType: '',
          repoConnector: '',
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        validationSchema={Yup.object({
          repoConnectorType: Yup.string().required(getString('iacm.stackWizard.repoConnectorTypeRequired')),
          repoConnector: Yup.string().when('repoConnectorType', {
            is: (val: string) => val !== 'Harness',
            then: Yup.string().required(getString('common.validation.repository'))
          })
        })}
        enableReinitialize
      >
        {formik => {
          const { values, isValid, setFieldValue } = formik
          setConnectorType(values?.repoConnectorType as ConnectorTypes)
          return (
            <FormikForm>
              <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Layout.Vertical>
                  <Layout.Horizontal spacing="medium">
                    <ThumbnailSelect
                      className={css.thumbnailSelect}
                      name="repoConnectorType"
                      items={connectorTypesOptions(getString)}
                      isReadonly={false}
                      onChange={provisionerTypeSelected => {
                        setConnectorType(provisionerTypeSelected as ConnectorTypes)
                      }}
                    />
                  </Layout.Horizontal>
                  {values?.repoConnectorType !== 'Harness' && values?.repoConnectorType && (
                    <FormMultiTypeConnectorField
                      label={<Text color={Color.GREY_900}>{getString('iacm.stackWizard.selectGitConnector')}</Text>}
                      type={connectorType as ConnectorInfoDTO['type']}
                      name="repoConnectorObject"
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      style={{ marginBottom: 10 }}
                      multiTypeProps={{ expressions, allowableTypes: [MultiTypeInputType.FIXED] }}
                      onChange={(value: any) => {
                        /* istanbul ignore next */
                        const connectorValue =
                          /* istanbul ignore next */
                          value?.scope && value?.scope !== 'project'
                            ? `${value.scope}.${value?.record?.identifier}`
                            : value?.record?.identifier || value
                        setFieldValue('repoConnector', connectorValue)
                      }}
                    />
                  )}
                </Layout.Vertical>
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

export default StackRepoTypeStep
