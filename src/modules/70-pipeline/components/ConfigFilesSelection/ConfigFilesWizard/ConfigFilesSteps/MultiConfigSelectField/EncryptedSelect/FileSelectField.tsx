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

interface EncryptedData {
  scope: string
  identifier: string
}

function FileSelectField(props: SelectEncryptedProps) {
  const { getString } = useStrings()
  const { formik, name, placeholder, readonly = false } = props
  const fileSelectedValue = get(formik.values, name) || ''

  React.useEffect(() => {
    console.log('props', props)
    console.log('value', get(formik.values, name))
  }, [props])

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

  const placeholder_ = defaultTo(placeholder, getString('select'))

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
        case Scope.PROJECT:
          return {
            ...commonProps,
            scope: getString('projectLabel')
          }
        default:
          return {
            scope: '',
            identifier: ''
          }
      }
    }
    return getData(fileSelectedValue)
  }, [formik.values])

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  // const { scope, identifier } = getData(get(formik.values, name))
  // console.log('identifier', identifier)
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
          {data.identifier ? (
            <Container flex>
              <Text lineClamp={1} color={Color.GREY_900} padding={{ left: 'xsmall' }}>
                {data.identifier}
              </Text>
            </Container>
          ) : (
            <Text color={Color.GREY_500} padding={{ left: 'xsmall' }}>
              - {placeholder_} -
            </Text>
          )}
          <Container padding={{ right: 'small' }}>
            {data.scope ? <Tag>{data.scope.toUpperCase()}</Tag> : null}
            <Icon name="chevron-down" margin={{ right: 'small', left: 'small' }} />
          </Container>
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikFileSelectInput, 'formik'>>(FileSelectField)
