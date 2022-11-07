/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, Container, Formik, FormikForm, Layout, StepProps, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { FormikHelpers } from 'formik'

import { String, useStrings } from 'framework/strings'
import { IdentifierSchema } from '@common/utils/Validation'
import { ConnectorConfigDTO, validateTheIdentifierIsUniquePromise } from 'services/cd-ng'
import { validateKubernetesYamlPromise } from 'services/portal'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { delegateNameRegex } from '@delegates/components/CreateDelegate/K8sDelegate/DelegateSetupStep/DelegateSetupStep.constants'
import { quickCreateDelegateParams } from '@ce/utils/cloudIntegrationUtils'

import css from '../K8sQuickCreateModal.module.scss'

interface OverviewProps {
  name: string
}

const Overview: React.FC<OverviewProps & StepProps<ConnectorConfigDTO>> = ({ nextStep, prevStepData }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (
    formData: ConnectorConfigDTO,
    formikActions: FormikHelpers<ConnectorConfigDTO>
  ): Promise<void> => {
    const { identifier } = formData
    const name = formData.name.trim()

    try {
      setLoading(true)
      /* istanbul ignore else */ if (
        !prevStepData?.yaml ||
        prevStepData.name !== name ||
        prevStepData.identifier !== identifier
      ) {
        const [delegateIdRes, k8sConnectorIdRes, ccmK8sConnectorIdRes] = await Promise.all([
          validateKubernetesYamlPromise({
            queryParams: { accountId },
            body: {
              ...quickCreateDelegateParams,
              name,
              identifier
            }
          }),
          validateTheIdentifierIsUniquePromise({
            queryParams: { identifier, accountIdentifier: accountId }
          }),
          validateTheIdentifierIsUniquePromise({
            queryParams: { identifier: `${identifier}Costaccess`, accountIdentifier: accountId }
          })
        ])

        /* istanbul ignore if */ if (delegateIdRes.responseMessages?.length) {
          formikActions.setFieldError('name', getString('delegates.delegateNameNotUnique'))
          return
        }

        /* istanbul ignore else */ if (
          k8sConnectorIdRes.status === 'SUCCESS' &&
          ccmK8sConnectorIdRes.status === 'SUCCESS'
        ) {
          /* istanbul ignore else */ if (k8sConnectorIdRes.data && ccmK8sConnectorIdRes.data) {
            nextStep?.({ ...prevStepData, name, identifier, yaml: undefined })
          } else {
            formikActions.setFieldError(
              'name',
              getString('validation.duplicateIdError', {
                connectorName: name,
                connectorIdentifier: identifier
              })
            )
          }
        }
      } /* istanbul ignore else */ else {
        nextStep?.({ ...prevStepData, name, identifier })
      }
    } catch (error) {
      formikActions.setFieldError('name', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Layout.Vertical spacing={'xlarge'}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('overview')}</Text>
        <Formik<ConnectorConfigDTO>
          formName="k8sQuickCreateForm"
          initialValues={{ name: prevStepData?.name || '', identifier: prevStepData?.identifier || '' }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('validation.connectorName'))
              .max(63)
              .matches(delegateNameRegex, getString('delegates.delegateNameRegexIssue')),
            identifier: IdentifierSchema()
          })}
          onSubmit={(formData, formikActions) => {
            handleSubmit(formData, formikActions)
          }}
        >
          <FormikForm>
            <Container className={css.modalContent}>
              <div className={css.nameInput}>
                <NameId />
              </div>
              <div className={css.infoText}>
                <Text
                  icon="info-messaging"
                  iconProps={{ size: 24, padding: { right: 'small' }, style: { alignSelf: 'flex-start' } }}
                  font={{ variation: FontVariation.BODY }}
                  color={Color.GREY_800}
                >
                  <String stringID="ce.k8sQuickCreate.overview.nameInfo" useRichText />
                </Text>
              </div>
            </Container>
            <Button
              disabled={loading}
              rightIcon="chevron-right"
              text={getString('continue')}
              variation={ButtonVariation.PRIMARY}
              type="submit"
            />
          </FormikForm>
        </Formik>
      </Layout.Vertical>
    </>
  )
}

export default Overview
