import React from 'react'
import { connect, FormikContextType } from 'formik'
import { Link } from 'react-router-dom'

import { Layout, Icon, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get, isPlainObject } from 'lodash-es'
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
  allowSelection: boolean
}

interface FormikFileSelectInput extends SelectEncryptedProps {
  formik: FormikContextType<any>
}

interface EncryptedData {
  scope: string
  identifier: string
}

function FileSelectField(props: SelectEncryptedProps) {
  const { getString } = useStrings()
  const { formik, name, placeholder, allowSelection = true } = props
  const secretValue = get(formik.values, name) || ''

  const { openCreateOrSelectSecretModal } = useCreateOrSelectSecretModal(
    {
      type: 'SecretFile',
      onSuccess: value => {
        const { projectIdentifier, orgIdentifier, identifier } = value
        let result = `${Scope.ACCOUNT}.${identifier}`
        if (orgIdentifier) {
          result = `${Scope.ORG}.${identifier}`
        }
        if (projectIdentifier) {
          result = `${Scope.PROJECT}.${identifier}`
        }
        formik.setFieldValue(name, result)
      }
    },
    []
  )

  const data = React.useMemo(() => {
    const getData = (encryptedValue: string): EncryptedData => {
      const [scopeValue, encryptedIdentifier] =
        typeof encryptedValue === 'string' ? get(formik.values, name).split('.') : ['', '']
      const commonProps = {
        identifier: encryptedIdentifier
      }
      switch (scopeValue) {
        case Scope.ACCOUNT:
          return {
            ...commonProps,
            scope: getString('account')
          }
        case Scope.ORG:
          return {
            ...commonProps,
            scope: getString('orgLabel')
          }
        default:
          return {
            scope: '',
            identifier: get(formik.values, name)
          }
      }
    }
    return getData(secretValue)
  }, [formik.values])

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  const getPlaceHolder = (): string => {
    if (placeholder) {
      return placeholder
    }

    return allowSelection ? getString('createOrSelectSecret') : getString('secrets.createSecret')
  }
  return (
    <FormGroup
      helperText={errorCheck() ? get(formik?.errors, name) : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
      style={{ width: '100%' }}
    >
      <Layout.Vertical className={css.container}>
        <Link
          to="#"
          className={css.containerLink}
          data-testid={name}
          onClick={e => {
            e.preventDefault()
            openCreateOrSelectSecretModal()
          }}
        >
          <Icon size={24} height={12} name={'key-main'} />
          <Text
            color={Color.PRIMARY_7}
            flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
            padding="small"
            className={css.containerLinkText}
          >
            <div>{secretValue ? getString('secrets.secret.configureSecret') : getPlaceHolder()}</div>
            {data.identifier ? <div>{data.identifier}</div> : null}
          </Text>
        </Link>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikFileSelectInput, 'formik'>>(FileSelectField)
