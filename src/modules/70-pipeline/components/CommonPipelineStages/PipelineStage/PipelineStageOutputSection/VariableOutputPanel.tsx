/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { cloneDeep, debounce, isEmpty, noop } from 'lodash-es'
import { Formik, FieldArray, FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'
import {
  Button,
  FormInput,
  MultiTypeInputType,
  getMultiTypeFromValue,
  ButtonSize,
  ButtonVariation,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import * as Yup from 'yup'

import produce from 'immer'
import { String, useStrings } from 'framework/strings'
import { TextInputWithCopyBtn } from '@common/components/TextInputWithCopyBtn/TextInputWithCopyBtn'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { PipelineStageConfig, PipelineStageOutputs, YamlProperties } from 'services/pipeline-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { PipelineStageTabs } from '../utils'
import { MAX_LENGTH } from './utils'
import css from './PipelineStageOutputSection.module.scss'

export function VariableOutputPanel(): React.ReactElement {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    isReadonly,
    allowableTypes,
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { metadataMap } = usePipelineVariables()
  const { getString } = useStrings()

  const tabName = PipelineStageTabs.OUTPUTS
  const { stage } = getStageFromPipeline<PipelineStageElementConfig>(selectedStageId || '')
  const cloneOriginalData = cloneDeep(stage)
  const uids = React.useRef<string[]>([])
  const outputTypeRef = React.useRef<MultiTypeInputType[]>([])
  const [pipelineOutputs, setPipelineOutputs] = useState<PipelineStageOutputs[]>(
    (cloneOriginalData?.stage as PipelineStageElementConfig)?.spec?.outputs || []
  )
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateStageDebounced = useCallback(
    debounce((values: PipelineStageElementConfig): void => {
      updateStage({ ...stage?.stage, ...values })
    }, 500),
    [stage?.stage, updateStage]
  )

  useEffect(() => {
    subscribeForm({ tab: tabName, form: formikRef })
    return () => {
      unSubscribeForm({ tab: tabName, form: formikRef })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    formikRef.current?.setValues({ outputs: pipelineOutputs })
  }, [pipelineOutputs])

  const getYamlPropertiesForOutputs = (): YamlProperties[] =>
    (cloneOriginalData?.stage as PipelineStageElementConfig)?.spec?.outputs?.map?.(
      output => metadataMap[(output as PipelineStageOutputs).value || '']?.yamlProperties || {}
    ) || []

  return (
    <Formik
      initialValues={{
        outputs: pipelineOutputs
      }}
      onSubmit={noop}
      validate={values => {
        if (cloneOriginalData)
          updateStageDebounced({
            ...(cloneOriginalData.stage as PipelineStageElementConfig),
            spec: {
              ...(cloneOriginalData.stage?.spec as PipelineStageConfig),
              outputs: values.outputs
            }
          })
      }}
      validationSchema={Yup.object().shape({
        outputs: Yup.array().of(
          Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('common.validation.nameIsRequired'))
              .max(
                MAX_LENGTH,
                getString('common.validation.fieldCannotbeLongerThanN', { name: getString('name'), n: MAX_LENGTH })
              )
              .matches(
                /^[a-zA-Z_][0-9a-zA-Z_$.]*$/,
                getString('common.validation.fieldMustBeAlphanumeric', { name: getString('name') })
              ),
            value: Yup.string().trim().required(getString('common.validation.valueIsRequired'))
          })
        )
      })}
    >
      {formik => {
        const { values, setFieldValue } = formik
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: tabName }))
        formikRef.current = formik as FormikProps<unknown> | null
        return (
          <FieldArray
            name="outputs"
            render={({ remove, push }) => {
              const handleAdd = (output: PipelineStageOutputs): void => {
                uids.current.push(uuid())
                outputTypeRef.current.push(MultiTypeInputType.EXPRESSION)
                push(output)
                if (values?.outputs) setPipelineOutputs([...values.outputs, output])
              }

              const handleRemove = (index: number): void => {
                uids.current.splice(index, 1)
                outputTypeRef.current.splice(index, 1)
                const updatedPipelineOutputs: PipelineStageOutputs[] = produce(values?.outputs, draft => {
                  draft.splice(index, 1)
                })
                remove(index)
                setPipelineOutputs(updatedPipelineOutputs)
              }

              return (
                <div className={css.outputVariablesContainer}>
                  {values.outputs?.length > 0 ? (
                    <div className={cx(css.tableRow, css.headerRow)}>
                      <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('name')}</Text>
                      <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('valueLabel')}</Text>
                    </div>
                  ) : null}
                  {values.outputs.map?.((output, index) => {
                    if (!uids.current[index]) {
                      uids.current[index] = uuid()
                    }
                    if (!outputTypeRef.current[index]) {
                      outputTypeRef.current[index] = isEmpty(output.value)
                        ? MultiTypeInputType.EXPRESSION
                        : getMultiTypeFromValue(output.value as string)
                    }
                    const key = uids.current[index]
                    const yamlData = getYamlPropertiesForOutputs()?.[index] || {}
                    if (!output) {
                      return null
                    }

                    return (
                      <div key={key} className={css.tableRow}>
                        <TextInputWithCopyBtn
                          name={`outputs[${index}].name`}
                          label=""
                          localName={yamlData.localName}
                          fullName={yamlData.fqn}
                        />
                        <div className={css.valueColumn} data-type={getMultiTypeFromValue(output.value as string)}>
                          <FormInput.MultiTextInput
                            className="variableOutput"
                            name={`outputs[${index}].value`}
                            label=""
                            disabled={isReadonly}
                            multiTextInputProps={{
                              defaultValueToReset: '',
                              textProps: {
                                disabled: isReadonly,
                                type: 'text'
                              },
                              allowableTypes,
                              multitypeInputValue: outputTypeRef.current[index]
                            }}
                            onChange={(_value, _valueType, multiType) => {
                              if (multiType !== outputTypeRef.current[index]) {
                                outputTypeRef.current[index] = multiType
                              }
                            }}
                          />
                          {getMultiTypeFromValue(output.value as string) === MultiTypeInputType.RUNTIME ? (
                            <ConfigureOptions
                              value={output.value as string}
                              type="String"
                              variableName={output.name || ''}
                              onChange={value => setFieldValue(`outputs[${index}].value`, value)}
                              isReadonly={isReadonly}
                            />
                          ) : null}
                        </div>
                        <div className={css.actionButton}>
                          {!isReadonly ? (
                            <Button
                              icon="main-trash"
                              data-testid={`delete-output-${index}`}
                              tooltip={
                                <String className={css.tooltip} stringID="pipeline.pipelineChaining.removeOutput" />
                              }
                              onClick={() => handleRemove(index)}
                              minimal
                            />
                          ) : null}
                        </div>
                      </div>
                    )
                  })}

                  <Button
                    icon="plus"
                    className={css.addOutput}
                    disabled={isReadonly}
                    size={ButtonSize.SMALL}
                    variation={ButtonVariation.LINK}
                    onClick={() => handleAdd({ name: '', value: '' })}
                    text={getString('pipeline.pipelineChaining.newOutput')}
                  />
                </div>
              )
            }}
          />
        )
      }}
    </Formik>
  )
}
