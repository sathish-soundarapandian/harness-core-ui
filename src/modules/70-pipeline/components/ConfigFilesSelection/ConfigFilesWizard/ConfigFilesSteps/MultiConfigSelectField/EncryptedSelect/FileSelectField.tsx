import React from 'react'
import { connect, FormikContextType } from 'formik'
import { Layout, Icon, Container, Text, Tag } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get, isPlainObject, defaultTo } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import { Scope } from '@common/interfaces/SecretsInterface'
import useCreateOrSelectSecretModal from '@secrets/modals/CreateOrSelectSecretModal/useCreateOrSelectSecretModal'

import { useStrings } from 'framework/strings'

import css from './FileSelectField.module.scss'

interface SelectEncryptedProps {
  name: string
  formik: any
  id: string
  index: number
  onChange: (newValue: any, i: number) => void
  readonly?: boolean
  placeholder?: string
  field: any
}

interface FormikFileSelectInput extends SelectEncryptedProps {
  formik: FormikContextType<any>
}

function FileSelectField(props: SelectEncryptedProps) {
  const { getString } = useStrings()
  const { formik, name, placeholder, readonly = false, field } = props
  const fileSelectedValue = field.value
  // const modalFileStore = useFileStoreModal({
  //   applySelected: value => formik.setFieldValue(name, value)
  // })
  const { openCreateOrSelectSecretModal } = useCreateOrSelectSecretModal(
    {
      type: 'SecretFile',
      onSuccess: value => formik.setFieldValue(name, value)
    },
    []
  )

  const placeholder_ = defaultTo(placeholder, getString('select'))

  const getScope = (scopeType: string): string => {
    switch (scopeType) {
      case Scope.ACCOUNT:
        return getString('account')
      case Scope.ORG:
        return getString('orgLabel')
      case Scope.PROJECT:
        return getString('projectLabel')
      default:
        return getString('account')
    }
  }

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  return (
    <FormGroup
      helperText={errorCheck() ? get(formik?.errors, name) : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
      style={{ width: '100%' }}
    >
      <Layout.Vertical>
        <Container
          flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          className={css.container}
          onClick={() => {
            if (!readonly) {
              openCreateOrSelectSecretModal()
            }
          }}
        >
          {fileSelectedValue?.name ? (
            <Container flex>
              <Text lineClamp={1} color={Color.GREY_900} padding={{ left: 'xsmall' }}>
                {fileSelectedValue?.name}
              </Text>
            </Container>
          ) : (
            <Text color={Color.GREY_500} padding={{ left: 'xsmall' }}>
              - {placeholder_} -
            </Text>
          )}
          <Container padding={{ right: 'small' }}>
            {fileSelectedValue?.scope ? <Tag>{getScope(fileSelectedValue?.scope).toUpperCase()}</Tag> : null}
            <Icon name="chevron-down" margin={{ right: 'small', left: 'small' }} />
          </Container>
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikFileSelectInput, 'formik'>>(FileSelectField)
