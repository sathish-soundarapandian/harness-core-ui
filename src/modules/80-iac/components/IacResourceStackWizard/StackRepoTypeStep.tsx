/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { StepProps, Layout, ButtonVariation, Text, Formik, FormikForm, Button, ThumbnailSelect } from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConnectorIcons, ConnectorTypes } from '@pipeline/components/ApplicationConfig/ApplicationConfig.types'
import type { StackWizardStepProps } from '.'
import css from './StackWizard.module.scss'

const AllowedTypes: Array<ConnectorTypes> = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Harness']

const StackRepoTypeStep: React.FC<StepProps<StackWizardStepProps>> = props => {
  const { name, identifier, nextStep, prevStepData } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [connectorType, setConnectorType] = React.useState<ConnectorTypes | undefined>()
  const { expressions } = useVariablesExpression()
  const connectorTypesOptions = useMemo(
    (): Item[] =>
      AllowedTypes.map((connector: string) => ({
        label: connector,
        icon: ConnectorIcons[connector],
        value: connector
      })),
    []
  )

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {name}
      </Text>
      <Formik
        initialValues={{
          repoConnectorType: '',
          repoConnector: '',
          ...prevStepData
        }}
        formName={`resourcestack-wizard-${identifier}`}
        onSubmit={formData => nextStep?.({ ...prevStepData, ...formData })}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          repoConnectorType: Yup.string().required('Required'),
          repoConnector: Yup.string().when('repoConnectorType', {
            is: (val: string) => val !== 'Harness',
            then: Yup.string().required('Required')
          })
        })}
      >
        {formik => {
          const { values, setFieldValue, isValid } = formik
          return (
            <FormikForm>
              <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Layout.Horizontal spacing="medium">
                  <Layout.Vertical>
                    <Layout.Horizontal spacing="medium">
                      <ThumbnailSelect
                        className={css.thumbnailSelect}
                        name={'repoConnectorType'}
                        items={connectorTypesOptions}
                        isReadonly={false}
                        onChange={provisionerTypeSelected => {
                          setConnectorType(provisionerTypeSelected as ConnectorTypes)
                          if (provisionerTypeSelected === 'Harness') {
                            setFieldValue('repoConnector', '')
                          }
                        }}
                      />
                    </Layout.Horizontal>
                    {get(values, 'repoConnectorType') !== 'Harness' && (
                      <FormMultiTypeConnectorField
                        label={<Text color={Color.GREY_900}>{'Select Git Connector'}</Text>}
                        type={connectorType as ConnectorInfoDTO['type']}
                        name="repoConnector"
                        placeholder={getString('select')}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        style={{ marginBottom: 10 }}
                        multiTypeProps={{ expressions }}
                        setRefValue
                      />
                    )}
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

export default StackRepoTypeStep
