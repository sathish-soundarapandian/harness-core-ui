/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import cx from 'classnames'
import {
  Text,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTextInputProps,
  ExpressionInput,
  EXPRESSION_INPUT_PLACEHOLDER,
  Layout,
  Icon
} from '@harness/uicore'
import { FormGroup, Intent } from '@blueprintjs/core'
import { FieldArray, connect, FormikContextType } from 'formik'
import { get, isPlainObject } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ExpressionsListInput } from '@common/components/ExpressionsListInput/ExpressionsListInput'

import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector, {
  MultiTypeFieldSelectorProps
} from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import FileStoreSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/FileStoreSelect/FileStoreSelectField'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import FileSelectField from './EncryptedSelect/FileSelectField'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import MultiTypeConfigFileSelect from './MultiTypeConfigFileSelect'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'

import css from './MultiConfigSelectField.module.scss'

export type MapValue = { id: string; key: string; value: string }[]
export type MultiTypeMapValue = MapValue | string

interface MultiTypeMapConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeMapProps {
  name: string
  multiTypeFieldSelectorProps: Omit<MultiTypeFieldSelectorProps, 'name' | 'defaultValueToReset' | 'children'>
  valueMultiTextInputProps?: Omit<MultiTextInputProps, 'name'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeMapConfigureOptionsProps
  formik?: FormikContextType<any>
  style?: React.CSSProperties
  cardStyle?: React.CSSProperties
  disabled?: boolean
  appearance?: 'default' | 'minimal'
  keyLabel?: string
  valueLabel?: string
  restrictToSingleEntry?: boolean
  fileType: string
  expressions: string[]
  values: string | string[]
}

export function MultiConfigSelectField(props: MultiTypeMapProps): React.ReactElement {
  const {
    name,
    multiTypeFieldSelectorProps,
    // valueMultiTextInputProps = {},
    enableConfigureOptions = true,
    configureOptionsProps,
    cardStyle,
    formik,
    disabled,
    appearance = 'default',
    keyLabel,
    valueLabel,
    restrictToSingleEntry,
    fileType,
    expressions,
    values,
    ...restProps
  } = props

  const getDefaultResetValue = () => {
    return ['']
  }

  const [changed, setChanged] = React.useState(false)

  const value = get(formik?.values, name, getDefaultResetValue()) as MultiTypeMapValue

  const isRunTime = React.useMemo(() => {
    return getMultiTypeFromValue(get(formik?.values, name, getDefaultResetValue())) === MultiTypeInputType.RUNTIME
  }, [value])

  const { getString } = useStrings()

  const errorCheck = (index: number): boolean =>
    (formik?.submitCount &&
      formik?.submitCount > 0 &&
      get(formik?.errors, `${name}[${index}]`) &&
      isPlainObject(get(formik?.errors, `${name}[${index}]`))) as boolean

  React.useEffect(() => {
    console.log('err', get(formik?.errors, `${name}[0]`))
  }, [formik?.errors])

  React.useEffect(() => {
    console.log('xxxx', {
      values: formik?.values.files,
      isArray: Array.isArray(formik?.values.files)
    })
  }, [formik?.values.files])

  return (
    <DragDropContext
      onDragEnd={(result: DropResult) => {
        if (!result.destination) {
          return
        }
        const res = Array.from(value)
        const [removed] = res.splice(result.source.index, 1)
        res.splice(result.destination.index, 0, removed)
        formik.setFieldValue(name, [...res])
        setChanged(!changed)
      }}
    >
      <Droppable droppableId="droppableSelect">
        {(provided, _snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cx(css.group, css.withoutSpacing, appearance === 'minimal' ? css.minimalCard : '')}
            {...restProps}
          >
            <MultiTypeFieldSelector
              name={name}
              isInputField={false}
              defaultValueToReset={getDefaultResetValue()}
              style={{ flexGrow: 1, marginBottom: 0 }}
              allowedTypes={[MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED]}
              {...multiTypeFieldSelectorProps}
              disableTypeSelection={multiTypeFieldSelectorProps.disableTypeSelection || disabled}
              onTypeChange={e => {
                if (e !== MultiTypeInputType.RUNTIME) {
                  formik?.setFieldValue(name, [''])
                }
              }}
            >
              <FieldArray
                name={name}
                render={({ push, remove, replace }) => {
                  return (
                    <>
                      {Array.isArray(values) &&
                        values.map((field: any, index: number) => {
                          const { ...restValue } = field
                          return (
                            <Draggable key={index} draggableId={`${index}`} index={index}>
                              {providedDrag => (
                                <Layout.Horizontal
                                  flex={{ distribution: 'space-between', alignItems: 'center' }}
                                  margin={{ top: 'small' }}
                                  key={index}
                                  ref={providedDrag.innerRef}
                                  {...providedDrag.draggableProps}
                                  {...providedDrag.dragHandleProps}
                                >
                                  <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                    <>
                                      <Icon name="drag-handle-vertical" className={css.drag} />
                                      <Text className={css.text}>{`${index + 1}.`}</Text>
                                    </>

                                    <div className={css.multiSelectField}>
                                      <div className={cx(css.group, css.withoutAligning, css.withoutSpacing)}>
                                        {fileType === FILE_TYPE_VALUES.ENCRYPTED ? (
                                          <FileSelectField
                                            index={index}
                                            name={`${name}[${index}]`}
                                            formik={formik}
                                            onChange={(newValue, i) => {
                                              replace(i, {
                                                ...restValue,
                                                value: newValue
                                              })
                                            }}
                                            field={field}
                                          />
                                        ) : (
                                          <MultiTypeConfigFileSelect
                                            name={`${name}[${index}]`}
                                            label={''}
                                            defaultValueToReset={''}
                                            style={{ flexGrow: 1, marginBottom: 0, marginTop: 0 }}
                                            disableTypeSelection={false}
                                            changed={changed}
                                            supportListOfExpressions={true}
                                            defaultType={getMultiTypeFromValue(
                                              get(formik?.values, `${name}[${index}]`),
                                              [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                              true
                                            )}
                                            allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                                            expressionRender={() => {
                                              return (
                                                <ExpressionInput
                                                  name={`${name}[${index}]`}
                                                  value={get(formik?.values, `${name}[${index}]`)}
                                                  disabled={false}
                                                  inputProps={{ placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
                                                  items={expressions}
                                                  onChange={val =>
                                                    /* istanbul ignore next */
                                                    formik?.setFieldValue(`${name}[${index}]`, val)
                                                  }
                                                />
                                              )
                                            }}
                                            onTypeChange={e => {
                                              console.log('e', e)
                                            }}
                                          >
                                            <div className={css.fieldWrapper}>
                                              <FileStoreSelectField name={`${name}[${index}]`} />
                                            </div>
                                          </MultiTypeConfigFileSelect>
                                        )}
                                        <Button
                                          icon="main-trash"
                                          iconProps={{ size: 20 }}
                                          minimal
                                          data-testid={`remove-${name}-[${index}]`}
                                          onClick={() => remove(index)}
                                          disabled={disabled}
                                        />
                                      </div>
                                    </div>
                                  </Layout.Horizontal>
                                </Layout.Horizontal>
                              )}
                            </Draggable>
                          )
                        })}

                      {restrictToSingleEntry && Array.isArray(value) && value?.length === 1 ? null : (
                        <Button
                          intent="primary"
                          minimal
                          text={getString('plusAdd')}
                          data-testid={`add-${name}`}
                          onClick={() => {
                            push('')
                          }}
                          disabled={disabled || isRunTime}
                          style={{ padding: 0, marginTop: 24 }}
                        />
                      )}
                    </>
                  )
                }}
              />
            </MultiTypeFieldSelector>
            {provided.placeholder}
            {enableConfigureOptions &&
              typeof value === 'string' &&
              getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ marginTop: 11 }}
                  value={value}
                  type={getString('map')}
                  variableName={name}
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={val => formik?.setFieldValue(name, val)}
                  {...configureOptionsProps}
                  isReadonly={props.disabled}
                />
              )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default connect(MultiConfigSelectField)
