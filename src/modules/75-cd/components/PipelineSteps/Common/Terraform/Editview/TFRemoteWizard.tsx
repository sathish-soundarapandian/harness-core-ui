/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Icon,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps,
  Text
} from '@wings-software/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import { unset, map, defaultTo, get } from 'lodash-es'
import cx from 'classnames'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'
import { FieldArray, Form } from 'formik'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { isMultiTypeRuntime } from '@common/utils/utils'
import { Connector, PathInterface, RemoteVar, TerraformStoreTypes } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

interface TFRemoteProps {
  onSubmitCallBack: (data: RemoteVar) => void
  isEditMode: boolean
  isReadonly?: boolean
  allowableTypes: AllowedTypes
}
export const TFRemoteWizard: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isEditMode,
  isReadonly = false,
  allowableTypes
}) => {
  const { getString } = useStrings()
  const initialValues = isEditMode
    ? {
        varFile: {
          identifier: prevStepData?.varFile?.identifier,
          type: TerraformStoreTypes.Remote,
          spec: {
            store: {
              spec: {
                gitFetchType: prevStepData?.varFile?.spec?.store?.spec?.gitFetchType,
                repoName: prevStepData?.varFile?.spec?.store?.spec?.repoName,
                branch: prevStepData?.varFile?.spec?.store?.spec?.branch,
                commitId: prevStepData?.varFile?.spec?.store?.spec?.commitId,
                paths:
                  getMultiTypeFromValue(prevStepData?.varFile?.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME
                    ? prevStepData?.varFile?.spec?.store?.spec?.paths
                    : (prevStepData?.varFile?.spec?.store?.spec?.paths || []).map((item: string) => ({
                        path: item,
                        id: uuid()
                      }))
              }
            }
          }
        }
      }
    : {
        varFile: {
          type: TerraformStoreTypes.Remote,
          spec: {
            store: {
              spec: {
                gitFetchType: 'Branch',
                repoName: '',
                branch: '',
                commitId: '',
                paths: [{ id: uuid(), path: '' }]
              }
            }
          }
        }
      }

  const { expressions } = useVariablesExpression()

  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Text font="large" color={Color.GREY_800}>
        {getString('cd.varFileDetails')}
      </Text>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={initialValues}
        onSubmit={values => {
          /* istanbul ignore next */
          const payload = {
            ...values,
            connectorRef: prevStepData?.varFile?.spec?.store?.spec?.connectorRef
          }
          /* istanbul ignore next */
          const data = {
            varFile: {
              type: payload.varFile.type,
              identifier: payload.varFile.identifier,
              spec: {
                store: {
                  /* istanbul ignore next */
                  type: prevStepData?.selectedType,
                  spec: {
                    ...payload.varFile.spec?.store?.spec,
                    connectorRef: payload.connectorRef
                      ? getMultiTypeFromValue(payload?.connectorRef) === MultiTypeInputType.RUNTIME
                        ? payload?.connectorRef
                        : payload.connectorRef?.value
                      : prevStepData.identifier || ''
                  }
                }
              }
            }
          }
          /* istanbul ignore else */
          if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value) {
            unset(data?.varFile?.spec?.store?.spec, 'commitId')
          } else if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value) {
            unset(data?.varFile?.spec?.store?.spec, 'branch')
          }
          /* istanbul ignore else */
          if (
            getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.FIXED &&
            payload.varFile.spec?.store?.spec?.paths?.length
          ) {
            data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths?.map(
              (item: PathInterface) => item.path
            )
          } else if (getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME) {
            data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths
          }
          /* istanbul ignore else */
          onSubmitCallBack(data)
        }}
        validationSchema={Yup.object().shape({
          varFile: Yup.object().shape({
            identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
            spec: Yup.object().shape({
              store: Yup.object().shape({
                spec: Yup.object().shape({
                  gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
                  branch: Yup.string().when('gitFetchType', {
                    is: 'Branch',
                    then: Yup.string().trim().required(getString('validation.branchName'))
                  }),
                  commitId: Yup.string().when('gitFetchType', {
                    is: 'Commit',
                    then: Yup.string().trim().required(getString('validation.commitId'))
                  }),
                  paths: Yup.lazy((value): Yup.Schema<unknown> => {
                    if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                      return Yup.array().of(
                        Yup.object().shape({
                          path: Yup.string().min(1).required(getString('cd.pathCannotBeEmpty'))
                        })
                      )
                    }
                    return Yup.string().required(getString('cd.pathCannotBeEmpty'))
                  })
                })
              })
            })
          })
        })}
      >
        {formik => {
          const connectorValue = prevStepData?.varFile?.spec?.store?.spec?.connectorRef as Connector
          const connectionType =
            connectorValue?.connector?.spec?.connectionType === 'Account' ||
            connectorValue?.connector?.spec?.type === 'Account' ||
            prevStepData?.urlType === 'Account'
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                </div>

                {connectionType && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.repoName')}
                      name="varFile.spec.store.spec.repoName"
                      placeholder={getString('pipelineSteps.repoName')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.varFile?.spec?.store?.spec?.repoName) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.varFile?.spec?.store?.spec?.repoName as string}
                        type="String"
                        variableName="varFile.spec.store.spec.repoName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value =>
                          /* istanbul ignore next */
                          formik.setFieldValue('varFile.spec.store.spec.repoName', value)
                        }
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={gitFetchTypes}
                    name="varFile.spec.store.spec.gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  />
                </div>
                {formik.values?.varFile?.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="varFile.spec.store.spec.branch"
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.varFile?.spec?.store?.spec?.branch) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.varFile?.spec?.store?.spec?.branch as string}
                        type="String"
                        variableName="varFile.spec.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.spec.store.spec.branch', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                {formik.values?.varFile?.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name="varFile.spec.store.spec.commitId"
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.varFile?.spec?.store?.spec?.commitId) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.varFile?.spec?.store?.spec?.commitId as string}
                        type="String"
                        variableName="varFile.spec.store.spec.commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.spec.store.spec.commitId', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup)}>
                  <DragDropContext
                    onDragEnd={(result: DropResult) => {
                      if (!result.destination) {
                        return
                      }
                      const res = Array.from(get(formik.values, 'varFile.spec.store.spec.paths'))
                      const [removed] = res.splice(result.source.index, 1)
                      res.splice(result.destination.index, 0, removed)
                      formik.setFieldValue('varFile.spec.store.spec.paths', res)
                    }}
                  >
                    <Droppable droppableId="droppable">
                      {(provided, _snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          <MultiTypeFieldSelector
                            name="varFile.spec.store.spec.paths"
                            label={getString('filePaths')}
                            style={{ width: 370 }}
                            defaultValueToReset={[{ path: '', uuid: '' }]}
                            allowedTypes={
                              (allowableTypes as MultiTypeInputType[]).filter(
                                item => item !== MultiTypeInputType.EXPRESSION
                              ) as AllowedTypes
                            }
                          >
                            <FieldArray
                              name="varFile.spec.store.spec.paths"
                              render={arrayHelpers => {
                                const paths = defaultTo(formik.values?.varFile?.spec?.store?.spec?.paths, [
                                  { path: '', uuid: uuid() }
                                ])
                                return (
                                  <div>
                                    {map(paths, (_, index: number) => (
                                      <Draggable key={index} draggableId={`${index}`} index={index}>
                                        {(providedDrag, snapshot) => (
                                          <Layout.Horizontal
                                            flex={{ distribution: 'space-between', alignItems: 'flex-start' }}
                                            key={index}
                                            ref={providedDrag.innerRef}
                                            {...providedDrag.draggableProps}
                                            {...providedDrag.dragHandleProps}
                                          >
                                            <Layout.Horizontal
                                              spacing="medium"
                                              style={{ alignItems: 'baseline' }}
                                              className={cx({ [css.dragging]: snapshot.isDragging })}
                                            >
                                              <Icon name="drag-handle-vertical" className={css.drag} />
                                              <Text width={12}>{`${index + 1}.`}</Text>
                                              <FormInput.MultiTextInput
                                                name={`varFile.spec.store.spec.paths[${index}].path`}
                                                label=""
                                                multiTextInputProps={{
                                                  expressions,
                                                  allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                                    item => !isMultiTypeRuntime(item)
                                                  ) as AllowedTypes
                                                }}
                                                style={{ width: 320 }}
                                              />
                                              <Button
                                                minimal
                                                icon="main-trash"
                                                data-testid={`remove-header-${index}`}
                                                onClick={() => arrayHelpers.remove(index)}
                                              />
                                            </Layout.Horizontal>
                                          </Layout.Horizontal>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    <Button
                                      icon="plus"
                                      variation={ButtonVariation.LINK}
                                      data-testid="add-header"
                                      onClick={() => arrayHelpers.push({ path: '' })}
                                    >
                                      {getString('cd.addTFVarFileLabel')}
                                    </Button>
                                  </div>
                                )
                              }}
                            />
                          </MultiTypeFieldSelector>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {getMultiTypeFromValue(formik.values?.varFile?.spec?.store?.spec?.paths) ===
                    MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: 6 }}
                      value={formik.values?.varFile?.spec?.store?.spec?.paths}
                      type={getString('list')}
                      variableName={'varFile.spec.store.spec.paths'}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={val => formik?.setFieldValue('varFile.spec.store.spec.paths', val)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
              </div>

              <Layout.Horizontal spacing="xxlarge">
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="tf-remote-back-btn"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
