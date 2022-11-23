/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, FormEventHandler, useRef } from 'react'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import { get } from 'lodash-es'
import {
  DataTooltipInterface,
  errorCheck,
  FormError,
  FormikTooltipContext,
  HarnessDocTooltip,
  Icon
} from '@harness/uicore'
import classNames from 'classnames'
import { connect, FormikContextType } from 'formik'
import { ImagePreview } from '../ImagePreview/ImagePreview'
import css from './LogoInput.module.scss'

export interface LogoInputProps extends Omit<IFormGroupProps, 'label'> {
  label: string
  name: string
  disabled?: boolean
  tooltipProps?: DataTooltipInterface
  accept?: string
  /** URL of the selected logo */
  logo?: string
  onChange?: FormEventHandler<HTMLInputElement>
  onRemove?: () => void
}

const LogoInput: FC<LogoInputProps & { formik: FormikContextType<any> }> = props => {
  const {
    label,
    disabled,
    name,
    formik,
    helperText,
    intent,
    logo,
    tooltipProps,
    className,
    accept,
    onChange,
    onRemove
  } = props
  const error = get(formik?.errors, name)
  const hasError = errorCheck(name, formik) && typeof error === 'string'
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    tooltipProps?.dataTooltipId ?? (tooltipContext?.formName ? `${tooltipContext.formName}_${name}` : '')
  const inputRef = useRef<HTMLInputElement>(null)

  const onLogoInputClick = (): void => {
    if (disabled) return
    if (logo) return onRemove?.()

    inputRef.current?.click()
  }

  const onInputChange: FormEventHandler<HTMLInputElement> = e => {
    const file = e.currentTarget?.files?.[0]
    formik?.setFieldValue(name, file, true)
    formik?.setFieldTouched(name)
    onChange?.(e)
    e.currentTarget.value = ''
  }

  return (
    <FormGroup
      label={<HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} />}
      labelFor={name}
      disabled={disabled}
      intent={intent ?? (hasError ? Intent.DANGER : Intent.NONE)}
      helperText={hasError ? <FormError name={name} errorMessage={error} /> : helperText}
      className={classNames(css.logoInputGroup, className)}
    >
      <div
        className={classNames(css.logoInput, { [css.disabled]: disabled, [css.hasLogo]: !!logo })}
        onClick={onLogoInputClick}
      >
        <input
          ref={inputRef}
          name={name}
          type="file"
          style={{ display: 'none' }}
          accept={accept}
          onChange={onInputChange}
          disabled={disabled}
        />
        {logo ? (
          <>
            <Icon name="main-trash" size={24} className={classNames(css.icon, css.trashIcon)} />
            <ImagePreview src={logo} size={32} className={css.logo} />
          </>
        ) : (
          <Icon name="upload-box" size={32} className={css.icon} />
        )}
      </div>
    </FormGroup>
  )
}

export default connect<LogoInputProps>(LogoInput)
