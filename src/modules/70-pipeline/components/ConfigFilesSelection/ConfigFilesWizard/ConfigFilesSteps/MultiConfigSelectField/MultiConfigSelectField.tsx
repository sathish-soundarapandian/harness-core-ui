/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import {
  AllowedTypes,
  Button,
  Container,
  EXPRESSION_INPUT_PLACEHOLDER,
  ExpressionInput,
  FormError,
  getMultiTypeFromValue,
  Icon,
  Layout,
  MultiTextInputProps,
  MultiTypeInputType,
  Text
} from '@harness/uicore'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { FormGroup, Intent } from '@blueprintjs/core'
import { connect, FieldArray, FormikContextType } from 'formik'
import { defaultTo, get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { MultiTypeFieldSelectorProps } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { errorCheck } from '@common/utils/formikHelpers'
import { isSshOrWinrmDeploymentType } from '@pipeline/utils/stageHelpers'

import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import type { FileUsage } from '@filestore/interfaces/FileStore'
import FileStoreSelectField from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import FileSelectField from '@filestore/components/MultiTypeFileSelect/EncryptedSelect/EncryptedFileSelectField'
import { isMultiTypeRuntime, isValueRuntimeInput } from '@common/utils/utils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeConfigFileSelect from './MultiTypeConfigFileSelect'
import css from './MultiConfigSelectField.module.scss'

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
  values?: string | string[]
  allowableTypes?: AllowedTypes
  fileUsage?: FileUsage
  addFileLabel?: string
  isAttachment?: boolean
  deploymentType?: string
  stepViewType?: StepViewType
}

export function MultiConfigSelectField(props: MultiTypeMapProps): React.ReactElement {
  const {
    name,
    multiTypeFieldSelectorProps,
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
    allowableTypes,
    fileUsage,
    addFileLabel,
    isAttachment = false,
    deploymentType,
    stepViewType,
    ...restProps
  } = props

  const { getString } = useStrings()
  const [changed, setChanged] = React.useState(false)
  const getDefaultResetValue = () => (name === 'paramsPaths' ? [] : [''])
  const isDeploymentForm = stepViewType === StepViewType.DeploymentForm
  const value = get(formik?.values, name, getDefaultResetValue())

  const allowableFileSelectTypes = (allowableTypes as MultiTypeInputType[])?.filter(
    item => !isMultiTypeRuntime(item)
  ) as AllowedTypes

  const expressionInputRenderer = (fieldName: string): JSX.Element => {
    return (
      <FormGroup
        helperText={
          errorCheck(fieldName, formik) ? (
            <FormError name={fieldName} errorMessage={get(formik?.errors, fieldName)} />
          ) : null
        }
        intent={errorCheck(fieldName, formik) ? Intent.DANGER : Intent.NONE}
        style={{ width: '100%' }}
      >
        <ExpressionInput
          name={fieldName}
          value={get(formik?.values, fieldName)}
          disabled={false}
          inputProps={{ placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
          items={expressions}
          onChange={val =>
            /* istanbul ignore next */
            formik?.setFieldValue(fieldName, val)
          }
        />
      </FormGroup>
    )
  }

  return (
    <DragDropContext
      onDragEnd={(result: DropResult) => {
        if (!result.destination) {
          return
        }
        const res = Array.from(value as [])
        const [removed] = res.splice(result.source.index, 1)
        res.splice(result.destination.index, 0, removed)
        formik?.setFieldValue(name, [...res])
        setChanged(!changed)
      }}
    >
      <Droppable droppableId="droppableSelect">
        {(provided, _snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cx(css.group, appearance === 'minimal' ? css.minimalCard : '')}
            {...restProps}
          >
            <MultiTypeConfigFileSelect
              isFieldInput={true}
              name={name}
              defaultValueToReset={getDefaultResetValue()}
              style={{ flexGrow: 1, marginBottom: 0 }}
              allowedTypes={
                (allowableTypes as MultiTypeInputType[])?.filter(
                  allowedType => allowedType !== MultiTypeInputType.EXPRESSION
                ) as AllowedTypes
              }
              {...multiTypeFieldSelectorProps}
              disableTypeSelection={multiTypeFieldSelectorProps.disableTypeSelection || disabled}
              hasParentValidation={true}
              useExecutionTimeInput={isDeploymentForm}
              onTypeChange={type => {
                if (!isMultiTypeRuntime(type)) {
                  formik?.setFieldValue(name, getDefaultResetValue())
                }
              }}
              expressionRender={() => expressionInputRenderer(name)}
            >
              <FieldArray
                name={name}
                render={({ push, remove, replace }) => {
                  return (
                    <>
                      <div className={css.listFieldsWrapper}>
                        {Array.isArray(value) &&
                          value.map((field: any, index: number) => {
                            const { ...restValue } = field
                            const error = get(formik?.errors, `${name}[${index}]`)
                            const hasError = errorCheck(`${name}[${index}]`, formik) && typeof error === 'string'
                            return (
                              <Draggable key={index} draggableId={`${index}`} index={index}>
                                {providedDrag => (
                                  <Layout.Horizontal
                                    flex={{ distribution: 'space-between', alignItems: 'center' }}
                                    margin={{ top: 'small', bottom: hasError && 'medium' }}
                                    key={index}
                                    ref={providedDrag.innerRef}
                                    data-testid={`${name}[${index}]`}
                                    {...providedDrag.draggableProps}
                                    {...providedDrag.dragHandleProps}
                                    className={css.draggable}
                                  >
                                    <Layout.Horizontal
                                      spacing="medium"
                                      flex={{ alignItems: 'center' }}
                                      margin={{ bottom: hasError && 'medium' }}
                                    >
                                      {!restrictToSingleEntry && (
                                        <>
                                          <Icon name="drag-handle-vertical" />
                                          <Text className={css.text}>{`${index + 1}.`}</Text>
                                        </>
                                      )}
                                      <div className={css.multiSelectField}>
                                        <div className={cx(css.group)}>
                                          <MultiTypeConfigFileSelect
                                            hasParentValidation={true}
                                            name={`${name}[${index}]`}
                                            label={''}
                                            defaultValueToReset={''}
                                            style={{ flexGrow: 1, marginBottom: 0, marginTop: 0 }}
                                            disableTypeSelection={
                                              multiTypeFieldSelectorProps.disableTypeSelection || false
                                            }
                                            changed={changed}
                                            supportListOfExpressions={true}
                                            defaultType={getMultiTypeFromValue(
                                              get(formik?.values, `${name}[${index}]`),
                                              [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                              true
                                            )}
                                            allowedTypes={defaultTo(allowableFileSelectTypes, [
                                              MultiTypeInputType.FIXED,
                                              MultiTypeInputType.EXPRESSION
                                            ])}
                                            expressionRender={() => {
                                              return (
                                                <Container className={css.fieldExpressionHelperWrapper}>
                                                  {expressionInputRenderer(`${name}[${index}]`)}
                                                </Container>
                                              )
                                            }}
                                          >
                                            <div className={css.fieldWrapper}>
                                              {fileType === FILE_TYPE_VALUES.ENCRYPTED ? (
                                                <FileSelectField
                                                  value={get(formik?.values, `${name}[${index}]`)}
                                                  name={`${name}[${index}]`}
                                                  isSshWinRm={isSshOrWinrmDeploymentType(defaultTo(deploymentType, ''))}
                                                  onChange={(newValue, i) => {
                                                    replace(i as number, {
                                                      ...restValue,
                                                      value: newValue
                                                    })
                                                    formik?.setFieldValue(`${name}[${index}]`, newValue)
                                                  }}
                                                />
                                              ) : (
                                                <FileStoreSelectField
                                                  name={`${name}[${index}]`}
                                                  fileUsage={fileUsage}
                                                  onChange={(newValue, i) => {
                                                    replace(i, {
                                                      ...restValue,
                                                      value: newValue
                                                    })
                                                    formik?.setFieldValue(`${name}[${index}]`, newValue)
                                                  }}
                                                />
                                              )}
                                            </div>
                                          </MultiTypeConfigFileSelect>
                                          <Button
                                            icon="main-trash"
                                            iconProps={{ size: 20 }}
                                            minimal
                                            data-testid={`remove-${name}-[${index}]`}
                                            onClick={() => remove(index)}
                                            disabled={disabled || value.length <= 1}
                                          />
                                        </div>
                                      </div>
                                    </Layout.Horizontal>
                                  </Layout.Horizontal>
                                )}
                              </Draggable>
                            )
                          })}
                      </div>
                      {restrictToSingleEntry && Array.isArray(value) && value?.length === 1 ? null : (
                        <Button
                          intent="primary"
                          minimal
                          text={defaultTo(addFileLabel, getString('plusAdd'))}
                          data-testid={`add-${name}`}
                          onClick={() => {
                            push('')
                          }}
                          disabled={disabled || isValueRuntimeInput(value)}
                          style={{ padding: 0 }}
                          margin={{ top: 'small', bottom: isAttachment ? 'xxxlarge' : 'medium' }}
                        />
                      )}
                    </>
                  )
                }}
              />
            </MultiTypeConfigFileSelect>
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
