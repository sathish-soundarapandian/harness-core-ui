/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo } from 'lodash-es'
import { FieldArray, Select, TextInput } from '@wings-software/uicore'
import { Formik } from 'formik'
import type { Field } from '@wings-software/uicore/dist/components/FieldArray/FieldArray'
import type { HealthCheck } from 'services/lw'
import css from './COGatewayConfig.module.scss'

interface SelectItem {
  label: string
  value: string
}

const protocols: SelectItem[] = [
  {
    label: 'http',
    value: 'http'
  },
  {
    label: 'https',
    value: 'https'
  }
]

const statusRegEx = new RegExp(/^\d{3}-\d{3}$/)

interface StatusRangeInputProps {
  status_code_from: number
  status_code_to: number
  onChange: (val: string) => void
}

const StatusRangeInput: React.FC<StatusRangeInputProps> = props => {
  const { status_code_from, status_code_to } = props
  const [errorFlag, setErrorFlag] = useState(false)

  const getStatusStringFromRange = (from: number | null = null, to: number | null = null) => {
    return `${from}-${to}`
  }

  return (
    <TextInput
      defaultValue={getStatusStringFromRange(status_code_from as number, status_code_to)}
      onChange={e => props.onChange((e.target as HTMLInputElement).value)}
      onBlur={e => {
        setErrorFlag(!statusRegEx.test((e.target as HTMLInputElement).value))
      }}
      errorText={'Please enter from & to values'}
      intent={errorFlag ? 'danger' : 'none'}
    />
  )
}

interface COHealthCheckTableProps {
  pattern: HealthCheck | null
  updatePattern: (pattern: HealthCheck) => void
}
const COHealthCheckTable: React.FC<COHealthCheckTableProps> = props => {
  const [healthCheckPattern, setHealthCheckPattern] = useState<HealthCheck[]>(props.pattern ? [props.pattern] : [])

  useEffect(() => {
    props.updatePattern(healthCheckPattern[0])
  }, [healthCheckPattern])

  function getItembyValue(items: SelectItem[], value: string): SelectItem {
    return items.filter(x => x.value == value)[0]
  }

  const getTextInputEl: Field['renderer'] = (value, _rowIndex, handleChange) => (
    <TextInput
      defaultValue={value}
      style={{ border: 'none' }}
      onChange={e => handleChange((e.currentTarget as HTMLInputElement).value)}
    />
  )

  const getNumericInput: Field['renderer'] = (value, _rowIndex, handleChange) => (
    <TextInput
      defaultValue={value}
      style={{ border: 'none' }}
      onChange={e => handleChange(Number((e.currentTarget as HTMLInputElement).value))}
    />
  )

  const fields: Field[] = [
    {
      name: 'protocol',
      label: 'PROTOCOL',
      renderer: (value, _rowIndex, handleChange) => (
        <Select
          className={css.selectCell}
          value={getItembyValue(protocols, value)}
          items={protocols}
          onChange={item => handleChange(item.value)}
        />
      )
    },
    {
      name: 'path',
      label: 'PATH',
      renderer: getTextInputEl
    },
    {
      name: 'port',
      label: 'PORT',
      renderer: getNumericInput
    },
    {
      name: 'timeout',
      label: 'TIMEOUT',
      renderer: getNumericInput
    },
    {
      name: 'status',
      label: 'STATUS (from-to)',
      renderer: (value, _rowIndex, handleChange) => (
        <StatusRangeInput
          status_code_from={
            value?.split('-').map(Number)?.[0] || defaultTo(healthCheckPattern[0]?.status_code_from, 200)
          }
          status_code_to={value?.split('-').map(Number)?.[1] || defaultTo(healthCheckPattern[0]?.status_code_to, 299)}
          onChange={
            val => handleChange(val)
            // value => {
            // if (statusRegEx.test(value)) {
            //   const [from, to] = value.split('-').map(Number)
            //   setHealthCheckPattern([{ ...healthCheckPattern[0], status_code_from: from, status_code_to: to }])
            // }
            // }
          }
        />
      )
    }
  ]

  return (
    <div className={css.healthCheckTable}>
      <Formik
        initialValues={{ healthCheckData: healthCheckPattern }}
        onSubmit={values => {
          console.log(values) // eslint-disable-line
        }}
      >
        {_formikProps => (
          <FieldArray
            label={''}
            name={'healthCheckData'}
            fields={fields}
            isDeleteOfRowAllowed={() => false}
            onChange={data => {
              const _healthCheckData = (data.modifiedRows as any[])[0]
              setHealthCheckPattern([
                {
                  ..._healthCheckData,
                  status_code_from: _healthCheckData.status?.split('-').map(Number)?.[0] || 200,
                  status_code_to: _healthCheckData.status?.split('-').map(Number)?.[1] || 299
                }
              ])
            }}
          />
        )}
      </Formik>
    </div>
  )
}

export default COHealthCheckTable
