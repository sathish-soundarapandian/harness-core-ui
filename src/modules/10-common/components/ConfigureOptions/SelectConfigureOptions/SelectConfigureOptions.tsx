/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import { FormInput, SelectOption } from '@harness/uicore'

import type { Failure } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '../ConfigureOptions'
import { ALLOWED_VALUES_TYPE } from '../constants'
import type { AllowedValuesCustomComponentProps } from '../ConfigureOptionsUtils'
import css from './SelectConfigureOptions.module.scss'

export interface SelectConfigureOptionsProps extends ConfigureOptionsProps {
  value: string
  options: SelectOption[]
  loading: boolean
  error?: GetDataError<Failure | Error> | null
}

export const SelectConfigureOptions = (props: SelectConfigureOptionsProps): React.ReactElement => {
  const {
    value,
    onChange,
    isReadonly,
    options,
    variableName,
    type,
    showAdvanced,
    showRequiredField,
    showDefaultField,
    loading,
    error
  } = props

  const { getString } = useStrings()

  const errorToShow = React.useMemo(() => {
    let errorMessage = ''
    if ((error?.data as Failure)?.status === 'ERROR') {
      errorMessage = defaultTo((error?.data as Failure)?.message as string, getString('somethingWentWrong'))
    } else if ((error?.data as Failure)?.status === 'FAILURE') {
      const erroObj = (error?.data as Failure)?.errors?.[0]
      errorMessage =
        erroObj?.fieldId && erroObj?.error ? `${erroObj?.fieldId} ${erroObj?.error}` : getString('somethingWentWrong')
    }
    return errorMessage
  }, [error])

  const multiSelectProps = {
    placeholder: loading ? getString('loading') : getString('common.configureOptions.selectAllowedValuesPlaceholder')
  }

  const getAllowedValuesMultiSelectComponent = (
    allowedValuesCustomComponentProps: AllowedValuesCustomComponentProps
  ): React.ReactElement => {
    return (
      <>
        <FormInput.MultiSelect
          items={options}
          name="allowedValues"
          disabled={isReadonly || loading}
          onChange={allowedValuesCustomComponentProps.onChange}
          usePortal={true}
          className={css.multiSelector}
          multiSelectProps={multiSelectProps}
          label={getString('allowedValues')}
        />
        {!isEmpty(errorToShow) ? <span>{errorToShow}</span> : null}
      </>
    )
  }

  return (
    <ConfigureOptions
      value={value}
      type={type}
      variableName={variableName}
      showRequiredField={showRequiredField}
      showDefaultField={showDefaultField}
      showAdvanced={showAdvanced}
      onChange={onChange}
      isReadonly={isReadonly}
      getAllowedValuesCustomComponent={getAllowedValuesMultiSelectComponent}
      allowedValuesType={ALLOWED_VALUES_TYPE.MULTI_SELECT}
    />
  )
}
