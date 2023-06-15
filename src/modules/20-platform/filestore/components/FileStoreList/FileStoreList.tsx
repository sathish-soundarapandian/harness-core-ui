/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Text, Card, Button, MultiTypeInputType, ExpressionInput, EXPRESSION_INPUT_PLACEHOLDER } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { get, isEmpty } from 'lodash-es'
import { connect, FormikContextType, FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import { SELECT_FILES_TYPE } from '@filestore/utils/constants'
import MultiTypeFileSelect from '@filestore/components/MultiTypeFileSelect/MultiTypeFileSelect'
import FileStoreSelect from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import EncryptedFileSelect from '@filestore/components/MultiTypeFileSelect/EncryptedSelect/EncryptedFileSelectField'
import type { FileUsage } from '@filestore/interfaces/FileStore'
import css from './FileStoreList.module.scss'

export type ListType = string[]
export type ListUIType = { id: string; value: string }[]

export interface ListProps {
  name: string
  label?: string | React.ReactElement
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
  formik?: FormikContextType<any>
  expressions?: string[]
  enableExpressions?: boolean
  isNameOfArrayType?: boolean
  labelClassName?: string
  allowOnlyOne?: boolean
  type: string
  fileUsage?: FileUsage
}

const generateNewValue: () => { id: string; value: string } = () => ({
  id: uuid('', nameSpace()),
  value: ''
})

const showAddTrashButtons = (disabled = false, allowOnlyOne = false): boolean => {
  return !disabled && !allowOnlyOne
}

export const FileSelectList = (props: ListProps): React.ReactElement => {
  const {
    name,
    label,
    placeholder,
    disabled,
    style,
    formik,
    expressions,
    fileUsage,
    labelClassName = '',
    allowOnlyOne = false,
    type = SELECT_FILES_TYPE.FILE_STORE
  } = props
  const { getString } = useStrings()
  const [value, setValue] = React.useState<ListUIType>(() => {
    const initialValueInCorrectFormat = [
      {
        id: uuid('', nameSpace()),
        value: ''
      }
    ]

    if (Array.isArray(initialValueInCorrectFormat) && !initialValueInCorrectFormat.length) {
      initialValueInCorrectFormat.push(generateNewValue())
    }

    return initialValueInCorrectFormat
  })

  const error = get(formik?.errors, name, '')
  const touched = get(formik?.touched, name)
  const hasSubmitted = get(formik, 'submitCount', 0) > 0

  const addValue: () => void = () => {
    setValue(currentValue => {
      if (expressions?.length) {
        const updatedValue = currentValue.map((listItem: { id: string; value: string }, listItemIndex: number) => {
          const currentItemFormikValue = get(formik?.values, `${name}[${listItemIndex}]`, '')
          return {
            ...listItem,
            value: currentItemFormikValue
          }
        })

        return [...updatedValue, generateNewValue()]
      }
      return currentValue.concat(generateNewValue())
    })
  }

  const removeValue: (id: string) => () => void = id => () => {
    setValue(currentValue => currentValue.filter(item => item.id !== id))
  }

  const changeValue: (id: string, newValue: string) => void = React.useCallback(
    (id, newValue) => {
      formik?.setFieldTouched(name, true)
      setValue(currentValue => {
        const updatedValue = currentValue.map(item => {
          if (item.id === id) {
            return {
              id,
              value: newValue
            }
          }
          return item
        })
        let valueInCorrectFormat: ListType = []
        if (Array.isArray(updatedValue)) {
          valueInCorrectFormat = updatedValue.filter(item => !!item.value).map(item => item.value)
        }

        if (isEmpty(valueInCorrectFormat)) {
          formik?.setFieldValue(name, undefined)
        } else {
          formik?.setFieldValue(name, valueInCorrectFormat)
        }
        return updatedValue
      })
    },
    [formik, name]
  )
  const initialValue = get(formik?.values, name, '') as ListType

  React.useEffect(() => {
    const valueWithoutEmptyItems = value.filter(item => !!item.value)
    if (isEmpty(valueWithoutEmptyItems) && initialValue) {
      const initialValueInCorrectFormat = (Array.isArray(initialValue) ? initialValue : []).map(item => ({
        id: uuid('', nameSpace()),
        value: item
      }))

      if (Array.isArray(initialValueInCorrectFormat) && !initialValueInCorrectFormat.length) {
        initialValueInCorrectFormat.push(generateNewValue())
      }

      setValue(initialValueInCorrectFormat)
    }
  }, [initialValue, name])

  const fieldArray = (): React.ReactElement => (
    <>
      <FieldArray
        name={name}
        render={() => {
          return value.map(({ id, value: valueValue }, index: number) => {
            return (
              <div className={css.group} key={id}>
                <div style={{ flexGrow: 1 }} className={css.selectFieldWrapper}>
                  <MultiTypeFileSelect
                    hideError={true}
                    name={`${name}[${index}]`}
                    label={''}
                    defaultValueToReset={''}
                    style={{ flexGrow: 1, marginBottom: 0, marginTop: 0 }}
                    disableTypeSelection={false}
                    supportListOfExpressions={true}
                    allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                    onTypeChange={() => {
                      changeValue(id, '')
                    }}
                    expressionRender={() => {
                      return (
                        <ExpressionInput
                          name={`${name}[${index}]`}
                          value={valueValue}
                          disabled={disabled}
                          inputProps={{ placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
                          items={expressions}
                          onChange={val => {
                            changeValue(id, (val as string)?.trim())
                          }}
                        />
                      )
                    }}
                  >
                    <div className={css.selectFieldWrapper}>
                      {type === SELECT_FILES_TYPE.FILE_STORE ? (
                        <FileStoreSelect
                          fileUsage={fileUsage}
                          name={`${name}[${index}]`}
                          readonly={disabled}
                          placeholder={placeholder}
                          onChange={val => {
                            changeValue(id, (val as string)?.trim())
                          }}
                        />
                      ) : (
                        <EncryptedFileSelect
                          name={`${name}[${index}]`}
                          value={valueValue}
                          placeholder={placeholder}
                          readonly={disabled}
                          onChange={val => {
                            changeValue(id, (val as string)?.trim())
                          }}
                        />
                      )}
                    </div>
                  </MultiTypeFileSelect>
                </div>
                {showAddTrashButtons(disabled, allowOnlyOne) && (
                  <Button
                    icon="main-trash"
                    iconProps={{ size: 20 }}
                    minimal
                    onClick={removeValue(id)}
                    data-testid={`remove-${name}-[${index}]`}
                    className={css.trashButton}
                  />
                )}
              </div>
            )
          })
        }}
      />

      {showAddTrashButtons(disabled, allowOnlyOne) && (
        <Button intent="primary" minimal text={getString('plusAdd')} data-testid={`add-${name}`} onClick={addValue} />
      )}
    </>
  )

  return (
    <div style={style}>
      <div className={cx(css.label, labelClassName)}>{label}</div>
      {allowOnlyOne ? fieldArray() : <Card style={{ width: '100%' }}>{fieldArray()}</Card>}

      {(touched || hasSubmitted) && error && typeof error === 'string' ? (
        <Text intent={Intent.DANGER} margin={{ top: 'xsmall' }}>
          {error}
        </Text>
      ) : null}
    </div>
  )
}

export default connect(FileSelectList)
