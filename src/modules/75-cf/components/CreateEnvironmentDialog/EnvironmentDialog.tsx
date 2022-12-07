/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
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
  FormInput,
  Layout,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import type { FormikErrors } from 'formik'
import * as Yup from 'yup'
import { EnvironmentResponseDTO, ResponseEnvironmentResponseDTO, useCreateEnvironment } from 'services/cd-ng'
import { StringKeys, useStrings } from 'framework/strings'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { Description } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import css from './EnvironmentDialog.module.scss'

export interface EnvironmentDialogProps {
  disabled?: boolean
  onCreate: (response?: ResponseEnvironmentResponseDTO) => void
  buttonProps?: ButtonProps
  environments?: EnvironmentResponseDTO[]
  isLinkVariation?: boolean
  buttonText?: StringKeys
  createEnvFromInput?: boolean
  createEnvName?: string
  onCloseDialog?: () => void
  setSelectedEnvironment?: (env: EnvironmentResponseDTO | undefined) => void
}

interface EnvironmentValues {
  name: string
  identifier: string
  description: string
  type: EnvironmentType
}

const EnvironmentDialog: React.FC<EnvironmentDialogProps> = ({
  disabled,
  onCreate,
  buttonProps,
  environments,
  isLinkVariation,
  buttonText,
  createEnvFromInput = false,
  onCloseDialog = () => undefined,
  createEnvName = '',
  setSelectedEnvironment = () => undefined
}) => {
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

  const getTypeOption = (v: string) => envTypes.find(x => x.value === v) || envTypes[0]

  const initialValues: EnvironmentValues = {
    name: createEnvName,
    identifier: getIdentifierFromName(createEnvName),
    description: '',
    type: EnvironmentType.NON_PRODUCTION
  }

  const handleSubmit = (values: EnvironmentValues): void => {
    trackEvent(FeatureActions.CreateEnvSubmit, {
      category: Category.FEATUREFLAG,
      data: values
    })
    createEnv({
      name: values.name,
      identifier: values.identifier,
      description: values.description,
      projectIdentifier,
      orgIdentifier,
      type: values.type
    })
      .then(response => {
        hideModal()
        setSelectedEnvironment(response.data)
        onCreate(response)
      })
      .catch(error => {
        showError(getErrorMessage(error), 0, 'cf.create.env.error')
      })
  }

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const handleValidation = (values: EnvironmentValues): FormikErrors<EnvironmentValues> => {
    const errors: { name?: string } = {}

    if (environments?.some(env => env.name === values.name)) {
      errors.name = getString('cf.environments.create.duplicateName')
    }
    return errors
  }
  const { trackEvent } = useTelemetry()

  const handleCloseModal = (): void => {
    hideModal()
    onCloseDialog()
  }

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        enforceFocus={false}
        isOpen
        onClose={handleCloseModal}
        className={css.dialog}
        title={getString('cf.environments.create.title')}
      >
        <Formik
          initialValues={initialValues}
          formName="cfEnvDialog"
          onSubmit={handleSubmit}
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
                  {getString('cf.environments.create.description')}
                </Text>
                <Layout.Vertical padding={{ top: 'medium', left: 'xsmall', right: 'xsmall' }} className={css.container}>
                  <FormInput.InputWithIdentifier
                    inputName="name"
                    idName="identifier"
                    isIdentifierEditable
                    inputLabel={getString('cf.environments.create.nameLabel')}
                    inputGroupProps={{ inputGroup: { autoFocus: true } }}
                  />
                  <Description />
                  <Layout.Vertical spacing="small">
                    <Text font={{ variation: FontVariation.FORM_LABEL }}>
                      {getString('cf.environments.create.envTypeLabel')}
                    </Text>
                    <CardSelect
                      cornerSelected
                      data={envTypes}
                      selected={getTypeOption(formikProps.values.type)}
                      className={css.cardSelect}
                      onChange={nextValue => formikProps.setFieldValue('type', nextValue.value)}
                      renderItem={cardData => {
                        const cardSelected = getTypeOption(formikProps.values.type).value === cardData.value
                        return (
                          <Container
                            flex={{ align: 'center-center', distribution: 'space-between', justifyContent: 'center' }}
                            className={css.cardBody}
                            data-testid={`environmentType${cardSelected ? 'Selected' : ''}`}
                          >
                            <Text font={{ variation: FontVariation.SMALL }}>{cardData.text}</Text>
                          </Container>
                        )
                      }}
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
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('cancel')}
                    type="reset"
                    minimal
                    onClick={() => {
                      trackEvent(FeatureActions.CreateEnvCancel, {
                        category: Category.FEATUREFLAG
                      })
                      handleCloseModal()
                    }}
                  />
                  {loading && <Spinner size={16} />}
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [loading])

  useEffect(() => {
    if (createEnvFromInput) {
      openModal()
    } else {
      hideModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createEnvFromInput])

  return !createEnvFromInput ? (
    <RbacButton
      icon="plus"
      disabled={disabled}
      onClick={() => {
        trackEvent(FeatureActions.CreateEnvClick, {
          category: Category.FEATUREFLAG
        })
        openModal()
      }}
      text={getString(buttonText || 'newEnvironment')}
      intent="primary"
      variation={isLinkVariation ? ButtonVariation.LINK : ButtonVariation.PRIMARY}
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
      {...planEnforcementProps}
    />
  ) : null
}

export default EnvironmentDialog
