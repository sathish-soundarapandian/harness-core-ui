/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { connect, FormikContextType } from 'formik'
import {
  Layout,
  Icon,
  Container,
  Text,
  DataTooltipInterface,
  FormikTooltipContext,
  HarnessDocTooltip,
  Tag,
  FormError
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get, isPlainObject, defaultTo } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'

import { useStrings } from 'framework/strings'
import type { FileUsage } from '@filestore/interfaces/FileStore'
import useFileStoreModal from '@filestore/components/FileStoreComponent/FileStoreComponent'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'

import css from './FileStoreSelectField.module.scss'

export interface FileStoreSelectProps {
  name: string
  label?: string
  tooltipProps?: DataTooltipInterface
  placeholder?: string
  readonly?: boolean
  formik: FormikContextType<any>
  onChange?: (value: string, id?: any) => void
  fileUsage?: FileUsage
}

interface FormikFileStoreInput extends FileStoreSelectProps {
  formik: FormikContextType<any>
}

export interface FileStoreFieldData {
  path: string
  scope: string
}

export const getScope = (fsValue: string): FileStoreFieldData => {
  const [scope, path] = (fsValue && fsValue.split(':')) || ['', '']
  switch (scope) {
    case Scope.ACCOUNT:
    case Scope.ORG:
      return {
        scope,
        path
      }
    default:
      return {
        scope: Scope.PROJECT,
        path: fsValue || ''
      }
  }
}

function FileStoreInput(props: FormikFileStoreInput): React.ReactElement {
  const { getString } = useStrings()
  const { formik, label, name, tooltipProps, placeholder, readonly = false, onChange, fileUsage } = props
  const fileStoreValue = get(formik?.values, name)
  const [valuePath, setValuePath] = React.useState(get(formik?.values, name))
  const params = useParams<ProjectPathProps>()

  const prepareFileStoreValue = (scopeType: string, path: string): string => {
    switch (scopeType) {
      case Scope.ACCOUNT:
      case Scope.ORG:
        return `${scopeType}:${path}`
      default:
        return `${path}`
    }
  }

  React.useEffect(() => {
    setValuePath(get(formik?.values, name))
  }, [formik?.values])

  const modalFileStore = useFileStoreModal({
    applySelected: value => {
      const { scope, path } = value
      const preparedValue = prepareFileStoreValue(scope, path)
      onChange?.(preparedValue)
      formik.setFieldValue(name, preparedValue)
    },
    fileUsage,
    defaultTab: fileStoreValue ? getScope(fileStoreValue)?.scope : '',
    pathValue: valuePath || '',
    scopeValue: getScope(fileStoreValue)?.scope || ''
  })
  const placeholder_ = defaultTo(placeholder, getString('select'))

  const { scope, path } = (fileStoreValue && getScope(fileStoreValue)) || {}
  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  const tooltipContext = useContext(FormikTooltipContext)
  const dataTooltipId =
    tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  return (
    <FormGroup
      helperText={errorCheck() ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
      style={{ width: '100%' }}
    >
      <Layout.Vertical data-testid="file-store-select">
        {label ? (
          <label className={'bp3-label'}>
            <HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} />
          </label>
        ) : null}
        <Container
          flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          className={css.container}
          data-testid="container-fs"
          onClick={() => {
            if (!readonly && !!fileStoreValue) {
              modalFileStore.openFileStoreModal(get(formik?.values, name), getScope(fileStoreValue)?.scope)
            } else {
              modalFileStore.openFileStoreModal(get(formik?.values, name), getScopeFromDTO(params))
            }
          }}
        >
          {fileStoreValue && path ? (
            <Container flex className={css.pathWrapper}>
              <Text lineClamp={1} color={Color.GREY_900} padding={{ left: 'xsmall' }}>
                {path}
              </Text>
            </Container>
          ) : (
            <Text color={Color.GREY_500} padding={{ left: 'xsmall' }}>
              - {placeholder_} -
            </Text>
          )}
          <Container padding={{ right: 'medium' }}>
            {fileStoreValue && scope ? <Tag>{scope.toUpperCase()}</Tag> : null}
            <Icon name="chevron-down" size={15} color="grey300" margin={{ left: 'small' }} />
          </Container>
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikFileStoreInput, 'formik'>>(FileStoreInput)
