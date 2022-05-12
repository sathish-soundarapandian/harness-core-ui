/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import {
  Button,
  Formik,
  FormikForm as Form,
  Layout,
  Text,
  FormInput,
  CardSelect,
  CardBody,
  Container,
  SelectOption,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation,
  useToaster
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { NameSchema } from '@common/utils/Validation'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { SourceCodeManagerDTO, useSaveSourceCodeManagers, useUpdateSourceCodeManagers } from 'services/cd-ng'
import {
  AuthTypes,
  getAuthentication,
  getDefaultSCMType,
  getDefaultSelected,
  getFormDataBasedOnSCMType,
  getIconBySCM,
  SourceCodeType,
  SourceCodeTypes
} from '@user-profile/utils/utils'
import type { TextReferenceInterface } from '@secrets/components/TextReference/TextReference'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'

import Authentication from './Authentication'
import css from '../useSourceCodeManager.module.scss'

export interface RenderAuthSectionProps {
  selected?: SourceCodeType
  formikProps: FormikProps<SCMData>
}

interface SourceCodeManagerProps {
  onSubmit: () => void
  onClose: () => void
  initialValues?: SourceCodeManagerDTO
}

export interface SCMData {
  name: string
  authType?: AuthTypes
  username?: TextReferenceInterface
  password?: SecretReference
  sshKey?: SecretReference
  kerberosKey?: SecretReference
  accessToken?: SecretReference
  accessKey?: TextReferenceInterface
  secretKey?: SecretReference
}

const allowSCMChange = (isEditMode: boolean, selected?: string): boolean => Boolean(selected) && !isEditMode

const RenderAuthSection: React.FC<RenderAuthSectionProps> = props => {
  const { selected, formikProps } = props
  const { getString } = useStrings()
  const getAuthOptions = (type?: SourceCodeTypes): SelectOption[] => {
    switch (type) {
      case SourceCodeTypes.BITBUCKET:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          }
        ]
      case SourceCodeTypes.GITHUB:
        return [
          // {
          //   label: getString('usernamePassword'),
          //   value: AuthTypes.USERNAME_PASSWORD
          // },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          }
        ]
      case SourceCodeTypes.GITLAB:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          },
          {
            label: getString('kerberos'),
            value: AuthTypes.KERBEROS
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      case SourceCodeTypes.AWS_CODE_COMMIT:
        return [
          {
            label: getString('userProfile.awsCredentials'),
            value: AuthTypes.AWSCredentials
          }
        ]
      case SourceCodeTypes.AZURE_REPO:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      default:
        return []
    }
  }

  return selected ? <Authentication formikProps={formikProps} authOptions={getAuthOptions(selected?.value)} /> : null
}

const SourceCodeManagerForm: React.FC<SourceCodeManagerProps> = props => {
  const { onSubmit, onClose, initialValues } = props
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const bitBucketSupported = useFeatureFlag(FeatureFlag.GIT_SYNC_WITH_BITBUCKET)

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { accountId } = useParams<AccountPathProps>()
  const [data, setData] = useState({})
  const isEditMode = !isEmpty(initialValues)
  const [loading, setLoading] = useState(isEditMode)

  const { mutate: saveSourceCodeManager } = useSaveSourceCodeManagers({})
  const { mutate: updateSourceCodeManage } = useUpdateSourceCodeManagers({ identifier: initialValues?.id as string })

  const sourceCodeManagers: SourceCodeType[] = [
    {
      text: getString('common.repo_provider.githubLabel'),
      value: SourceCodeTypes.GITHUB,
      icon: getIconBySCM(SourceCodeTypes.GITHUB)
    }
  ]

  if (bitBucketSupported) {
    sourceCodeManagers.push({
      text: getString('common.repo_provider.bitbucketLabel'),
      value: SourceCodeTypes.BITBUCKET,
      icon: getIconBySCM(SourceCodeTypes.BITBUCKET)
    })
  }

  const [selected, setSelected] = useState<SourceCodeType | undefined>(
    getDefaultSCMType(sourceCodeManagers, initialValues?.type)
  )

  useEffect(() => {
    if (loading && initialValues) {
      getFormDataBasedOnSCMType(initialValues, accountId).then(formData => {
        formData && setData(formData)
        setLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const selectedValueToTypeMap: Record<SourceCodeTypes, SourceCodeTypes> = {
    [SourceCodeTypes.BITBUCKET]: SourceCodeTypes.BITBUCKET,
    [SourceCodeTypes.GITHUB]: SourceCodeTypes.GITHUB,
    [SourceCodeTypes.GITLAB]: SourceCodeTypes.GITLAB,
    [SourceCodeTypes.AWS_CODE_COMMIT]: SourceCodeTypes.AWS_CODE_COMMIT,
    [SourceCodeTypes.AZURE_REPO]: SourceCodeTypes.AZURE_REPO
  }

  const handleCreate = async (dataToSubmit: SourceCodeManagerDTO): Promise<void> => {
    const saved = await saveSourceCodeManager(dataToSubmit)
    if (saved) {
      onSubmit()
      showSuccess(getString('userProfile.scmCreateSuccess'))
    } else {
      showError(getString('userProfile.scmCreateFail'))
    }
  }

  const handleUpdate = async (dataToSubmit: SourceCodeManagerDTO): Promise<void> => {
    const parsedDataToSubmit: SourceCodeManagerDTO = { ...dataToSubmit, userIdentifier: initialValues?.userIdentifier }

    const saved = await updateSourceCodeManage(parsedDataToSubmit)
    if (saved) {
      onSubmit()
      showSuccess(getString('userProfile.scmUpdateSuccess'))
    } else {
      showError(getString('userProfile.scmUpdateFail'))
    }
  }

  const handleSubmit = async (values: SCMData): Promise<void> => {
    if (!selected?.value) {
      modalErrorHandler?.showDanger(getString('userProfile.selectSCM'))
      return
    }

    const dataToSubmit: SourceCodeManagerDTO = {
      name: values.name,
      authentication: getAuthentication(values),
      accountIdentifier: accountId,
      type: selectedValueToTypeMap[selected.value]
    }

    isEditMode ? handleUpdate(dataToSubmit) : handleCreate(dataToSubmit)
  }

  const submitText = isEditMode ? getString('update') : getString('add')
  const availableSCMs = selected ? [selected] : sourceCodeManagers

  const formInitialValues = {
    name: '',
    ...{ authType: getDefaultSelected(selected?.value) },
    ...data
  }

  return loading ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }}>
          {getString('userProfile.addSCM')}
        </Text>
        <Formik<SCMData>
          initialValues={formInitialValues}
          formName="sourceCodeManagerForm"
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            username: Yup.string().when(['authType'], {
              is: authType => authType === AuthTypes.USERNAME_PASSWORD || authType === AuthTypes.USERNAME_TOKEN,
              then: Yup.string().trim().required(getString('validation.username')),
              otherwise: Yup.string().nullable()
            }),
            password: Yup.object().when(['authType'], {
              is: AuthTypes.USERNAME_PASSWORD,
              then: Yup.object().required(getString('validation.password')),
              otherwise: Yup.object().nullable()
            }),
            kerberosKey: Yup.object().when(['authType'], {
              is: AuthTypes.KERBEROS,
              then: Yup.object().required(getString('validation.kerberosKey')),
              otherwise: Yup.object().nullable()
            }),
            accessToken: Yup.object().when(['authType'], {
              is: AuthTypes.USERNAME_TOKEN,
              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            sshKey: Yup.object().when(['authType'], {
              is: AuthTypes.SSH_KEY,
              then: Yup.object().required(getString('validation.sshKey')),
              otherwise: Yup.object().nullable()
            }),
            accessKey: Yup.string().when(['authType'], {
              is: AuthTypes.AWSCredentials,
              then: Yup.string().trim().required(getString('userProfile.scmValidation.accessKey')),
              otherwise: Yup.string().nullable()
            }),
            secretKey: Yup.object().when(['authType'], {
              is: AuthTypes.AWSCredentials,
              then: Yup.object().required(getString('userProfile.scmValidation.secretKey')),
              otherwise: Yup.object().nullable()
            })
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Layout.Vertical spacing="medium">
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <Container width={400}>
                    <FormInput.Text name="name" label={getString('name')} />
                  </Container>
                  <Text color={Color.BLACK}>{getString('userProfile.selectedSCM')}</Text>
                  <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CardSelect
                      data={availableSCMs}
                      cornerSelected={true}
                      className={css.cardRow}
                      cardClassName={css.card}
                      renderItem={item => (
                        <CardBody.Icon icon={item.icon} iconSize={25}>
                          <Text
                            font={{
                              size: 'small',
                              align: 'center'
                            }}
                            flex={{ justifyContent: 'center' }}
                            color={Color.BLACK}
                          >
                            {item.text}
                          </Text>
                        </CardBody.Icon>
                      )}
                      onChange={value => {
                        setSelected(value)
                        modalErrorHandler?.hide()
                        formikProps.setFieldValue('authType', getDefaultSelected(value.value))
                      }}
                      selected={selected}
                    />

                    {allowSCMChange(isEditMode, selected?.value) ? (
                      <Button
                        text={getString('change')}
                        variation={ButtonVariation.LINK}
                        onClick={() => {
                          setSelected(undefined)
                          formikProps.setFieldValue('authType', null)
                        }}
                      />
                    ) : null}
                  </Layout.Horizontal>
                </Layout.Vertical>

                <RenderAuthSection selected={selected} formikProps={formikProps} />

                <Layout.Horizontal spacing="small" padding={{ top: 'huge' }}>
                  <Button variation={ButtonVariation.PRIMARY} text={submitText} type="submit" />
                  <Button text={getString('cancel')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default SourceCodeManagerForm
