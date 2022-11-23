/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect, FormikContextType } from 'formik'
import cx from 'classnames'
import {
  Button,
  FixedTypeComponentProps,
  ExpressionAndRuntimeType,
  ButtonProps,
  ExpressionAndRuntimeTypeProps,
  Text,
  AllowedTypes,
  HarnessDocTooltip,
  FormikTooltipContext,
  DataTooltipInterface,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Layout
} from '@harness/uicore'
import { defaultTo, get, pick } from 'lodash-es'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import useCreateOrSelectSecretModal from '@secrets/modals/CreateOrSelectSecretModal/useCreateOrSelectSecretModal'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { errorCheck } from '@common/utils/formikHelpers'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { getReference } from '@common/utils/utils'
import { useCreateWinRmCredModal } from '@secrets/modals/CreateWinRmCredModal/useCreateWinRmCredModal'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import css from './MultiTypeSecretInput.module.scss'

export function getMultiTypeSecretInputType(serviceType: string): SecretResponseWrapper['secret']['type'] {
  switch (serviceType) {
    case 'WinRm':
      return 'WinRmCredentials'
    default:
      return 'SSHKey'
  }
}

export interface MultiTypeSecretInputFixedTypeComponentProps
  extends FixedTypeComponentProps,
    Omit<ButtonProps, 'onChange'> {}

export function MultiTypeSecretInputFixedTypeComponent(
  props: MultiTypeSecretInputFixedTypeComponentProps
): React.ReactElement {
  const { value, onChange, disabled, ...rest } = props
  const { getString } = useStrings()
  return (
    <Button
      {...rest}
      withoutBoxShadow
      className={css.value}
      icon="key-main"
      iconProps={{ size: 24, height: 12 }}
      data-testid={'create-or-select-secret'}
      disabled={disabled}
    >
      <Text lineClamp={1}>{value || getString('createOrSelectSecret')}</Text>
    </Button>
  )
}

export interface MultiTypeSecretInputProps extends IFormGroupProps {
  name: string
  label?: string
  expressions?: string[]
  allowableTypes?: AllowedTypes
  type?: SecretResponseWrapper['secret']['type']
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  isMultiType?: boolean
  small?: boolean
  defaultValue?: string
  tooltipProps?: DataTooltipInterface
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'>
}

export interface ConnectedMultiTypeSecretInputProps extends MultiTypeSecretInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContextType<any>
}

export function MultiTypeSecretInput(props: ConnectedMultiTypeSecretInputProps): React.ReactElement {
  const {
    formik,
    label,
    name,
    allowableTypes,
    expressions = [],
    onSuccess,
    type,
    secretsListMockData,
    isMultiType = true,
    defaultValue,
    enableConfigureOptions = false,
    configureOptionsProps,
    ...restProps
  } = props

  const { openCreateSSHCredModal } = useCreateSSHCredModal({
    onSuccess: data => {
      const secret = {
        ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'type']),
        referenceString: getReference(getScopeFromDTO(data), data.identifier) as string
      }
      formik.setFieldValue(name, secret.referenceString)
      /* istanbul ignore next */
      onSuccess?.(secret)
    }
  })

  const { openCreateWinRmCredModal } = useCreateWinRmCredModal({
    onSuccess: data => {
      const secret = {
        ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'type']),
        referenceString: getReference(getScopeFromDTO(data), data.identifier) as string
      }
      formik.setFieldValue(name, secret.referenceString)
      /* istanbul ignore next */
      onSuccess?.(secret)
    }
  })

  const { openCreateOrSelectSecretModal } = useCreateOrSelectSecretModal(
    {
      type,
      onSuccess: secret => {
        formik.setFieldValue(name, secret.referenceString)
        /* istanbul ignore next */
        onSuccess?.(secret)
      },
      secretsListMockData,
      handleInlineSSHSecretCreation: () => openCreateSSHCredModal(),
      handleInlineWinRmSecretCreation: () => openCreateWinRmCredModal()
    },
    [name, onSuccess]
  )
  const value = get(formik.values, name, defaultValue)
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik.errors, name) : null,
    disabled,
    small,
    ...rest
  } = restProps

  const handleChange: ExpressionAndRuntimeTypeProps['onChange'] = val => {
    formik.setFieldValue(name, val)
  }

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId = defaultTo(
    props.tooltipProps?.dataTooltipId,
    tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : ''
  )

  return (
    <FormGroup
      {...rest}
      className={cx({ [css.smallForm]: small })}
      labelFor={name}
      label={label ? <HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} /> : label}
      intent={intent}
      helperText={helperText}
      style={{ flexGrow: 1 }}
    >
      <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {isMultiType ? (
          <ExpressionAndRuntimeType
            name={name}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            expressions={expressions}
            allowableTypes={allowableTypes}
            fixedTypeComponentProps={{ onClick: openCreateOrSelectSecretModal }}
            fixedTypeComponent={MultiTypeSecretInputFixedTypeComponent}
            defaultValueToReset=""
            style={{ flexGrow: 1 }}
          />
        ) : (
          <MultiTypeSecretInputFixedTypeComponent
            value={value}
            onChange={handleChange}
            onClick={openCreateOrSelectSecretModal}
            disabled={disabled}
            data-testid={name}
          />
        )}
        {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={value}
            type={'String'}
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue(name, val)}
            {...configureOptionsProps}
            isReadonly={disabled}
          />
        )}
      </Layout.Horizontal>
    </FormGroup>
  )
}

export default connect<MultiTypeSecretInputProps>(MultiTypeSecretInput)
