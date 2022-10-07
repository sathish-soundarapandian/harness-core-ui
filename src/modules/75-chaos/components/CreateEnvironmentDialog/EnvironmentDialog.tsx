/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Spinner } from '@blueprintjs/core'
import {
  Button,
  ButtonProps,
  ButtonVariation,
  CardSelect,
  Container,
  Dialog,
  Formik,
  FormikForm,
  Layout,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import type { FormikErrors } from 'formik'
import * as Yup from 'yup'
import { EnvironmentResponseDTO, ResponseEnvironmentResponseDTO, useCreateEnvironment } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useToaster } from '@common/exports'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { getErrorMessage } from '@chaos/utils/MessageUtils'
import { useStrings } from 'framework/strings'

import css from './EnvironmentDialog.module.scss'

export interface EnvironmentDialogProps {
  disabled?: boolean
  onCreate: (response?: ResponseEnvironmentResponseDTO) => void
  buttonProps?: ButtonProps
  environments?: EnvironmentResponseDTO[]
}

interface EnvironmentValues {
  name: string
  identifier: string
  description: string
  tags: {
    [key: string]: string
  }
  type: EnvironmentType
}

const EnvironmentDialog: React.FC<EnvironmentDialogProps> = ({ disabled, onCreate, buttonProps, environments }) => {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { mutate: createEnv, loading } = useCreateEnvironment({
    queryParams: {
      accountId
    }
  })

  const envTypes = [
    {
      text: getString('production'),
      value: EnvironmentType.PRODUCTION
    },
    {
      text: getString('nonProduction'),
      value: EnvironmentType.NON_PRODUCTION
    }
  ]

  /* istanbul ignore next */
  const getTypeOption = (v: string) => envTypes.find(x => x.value === v) || envTypes[0]

  const initialValues: EnvironmentValues = {
    name: '',
    identifier: '',
    description: '',
    type: EnvironmentType.NON_PRODUCTION,
    tags: {}
  }

  const handleSubmit = (values: EnvironmentValues) => {
    createEnv({
      name: values.name,
      identifier: values.identifier,
      description: values.description,
      projectIdentifier,
      orgIdentifier,
      type: values.type,
      tags: values.tags
    })
      .then(
        /* istanbul ignore next */ response => {
          hideModal()
          onCreate(response)
        }
      )
      .catch(error => {
        showError(getErrorMessage(error), 0, 'cf.create.env.error')
      })
  }

  const handleValidation = (values: EnvironmentValues): FormikErrors<EnvironmentValues> => {
    const errors: { name?: string } = {}

    if (environments?.some(env => env.name === values.name)) {
      errors.name = getString('chaos.environments.create.duplicateName')
    }
    return errors
  }

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        enforceFocus={false}
        isOpen
        onClose={hideModal}
        className={css.dialog}
        title={getString('chaos.environments.create.title')}
      >
        <Formik
          initialValues={initialValues}
          formName="chaosEnvDialog"
          onSubmit={handleSubmit}
          onReset={
            /* istanbul ignore next */ () => {
              hideModal()
            }
          }
          validationSchema={Yup.object().shape({
            name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Environment' }) }),
            identifier: IdentifierSchema()
          })}
          validate={handleValidation}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Text color={Color.GREY_800} font={{ variation: FontVariation.SMALL }}>
                  {getString('chaos.environments.create.description')}
                </Text>
                <Layout.Vertical padding={{ top: 'medium', left: 'xsmall', right: 'xsmall' }} className={css.container}>
                  <NameIdDescriptionTags formikProps={formikProps} />

                  <Layout.Vertical spacing="small">
                    <Text font={{ variation: FontVariation.FORM_SUB_SECTION }}>
                      {getString('chaos.environments.create.envTypeLabel')}
                    </Text>
                    <CardSelect
                      cornerSelected
                      data={envTypes}
                      selected={getTypeOption(formikProps.values.type)}
                      className={css.cardSelect}
                      onChange={
                        /* istanbul ignore next */ nextValue => formikProps.setFieldValue('type', nextValue.value)
                      }
                      renderItem={cardData => (
                        <Container
                          flex={{ align: 'center-center', distribution: 'space-between', justifyContent: 'center' }}
                          className={css.cardBody}
                        >
                          <Text font={{ variation: FontVariation.SMALL }}>{cardData.text}</Text>
                        </Container>
                      )}
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
                <Layout.Horizontal spacing="small" padding={{ top: 'xxlarge' }}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('createSecretYAML.create')}
                    intent="primary"
                    disabled={loading}
                  />
                  <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} type="reset" minimal />
                  {loading && <Spinner size={16} />}
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [loading])

  return (
    <RbacButton
      icon="plus"
      disabled={disabled}
      onClick={() => {
        openModal()
      }}
      text={getString('newEnvironment')}
      intent="primary"
      variation={ButtonVariation.PRIMARY}
      padding={{
        top: 'small',
        bottom: 'small',
        left: 'huge',
        right: 'huge'
      }}
      permission={{
        resource: { resourceType: ResourceType.ENVIRONMENT },
        permission: PermissionIdentifier.EDIT_ENVIRONMENT
      }}
      {...buttonProps}
    />
  )
}

export default EnvironmentDialog
