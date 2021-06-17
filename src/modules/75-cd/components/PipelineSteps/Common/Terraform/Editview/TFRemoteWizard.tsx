import {
  Button,
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
import cx from 'classnames'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'
import { FieldArray, FieldArrayRenderProps, Form } from 'formik'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { PathInterface, RemoteVar, TerraformStoreTypes } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

interface TFRemoteProps {
  onSubmitCallBack: (data: RemoteVar) => void
  isEditMode: boolean
  isReadonly?: boolean
}
export const TFRemoteWizard: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isEditMode,
  isReadonly = false
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
                gitFetchType: '',
                branch: '',
                commitId: '',
                paths: []
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
  /* istanbul ignore next */
  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore next */
    event.currentTarget.classList.remove(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    /* istanbul ignore next */
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        /* istanbul ignore next */
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )

  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )

  return (
    <Layout.Vertical padding={'huge'} className={css.tfVarStore}>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={initialValues}
        onSubmit={values => {
          /* istanbul ignore else */
          const payload = {
            ...values,
            connectorRef: prevStepData?.varFile?.spec?.store?.spec?.connectorRef
          }
          /* istanbul ignore else */
          const data = {
            varFile: {
              type: payload.varFile.type,
              identifier: payload.varFile.identifier,
              spec: {
                store: {
                  /* istanbul ignore else */
                  type: payload.connectorRef?.connector?.type,
                  spec: {
                    ...payload.varFile.spec?.store?.spec,
                    connectorRef: payload.connectorRef
                      ? getMultiTypeFromValue(payload?.connectorRef) === MultiTypeInputType.RUNTIME
                        ? payload?.connectorRef
                        : payload.connectorRef?.value
                      : ''
                  }
                }
              }
            }
          }
          /* istanbul ignore else */
          if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value) {
            delete data?.varFile?.spec?.store?.spec?.commitId
          } else if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value) {
            delete data?.varFile?.spec?.store?.spec?.branch
          }
          /* istanbul ignore else */
          if (
            getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.FIXED &&
            payload.varFile.spec?.store?.spec?.paths?.length
          ) {
            data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths?.map(
              (item: PathInterface) => item.path
            ) as any
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
                  paths: Yup.string().required(getString('cd.pathCannotBeEmpty'))
                })
              })
            })
          })
        })}
      >
        {formik => {
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                </div>
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
                      multiTextInputProps={{ expressions }}
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
                      multiTextInputProps={{ expressions }}
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
                  <MultiTypeFieldSelector
                    name="varFile.spec.store.spec.paths"
                    label={getString('filePaths')}
                    style={{ width: 370 }}
                  >
                    <FieldArray
                      name="varFile.spec.store.spec.paths"
                      render={arrayHelpers => {
                        return (
                          <div>
                            {(formik.values?.varFile?.spec?.store?.spec?.paths || []).map(
                              (path: PathInterface, index: number) => (
                                <Layout.Horizontal
                                  key={`${path}-${index}`}
                                  flex={{ distribution: 'space-between' }}
                                  style={{ alignItems: 'end' }}
                                >
                                  <Layout.Horizontal
                                    spacing="medium"
                                    style={{ alignItems: 'baseline' }}
                                    className={css.tfContainer}
                                    key={`${path}-${index}`}
                                    draggable={true}
                                    onDragEnd={onDragEnd}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDragStart={event => {
                                      onDragStart(event, index)
                                    }}
                                    onDrop={event => onDrop(event, arrayHelpers, index)}
                                  >
                                    <Icon name="drag-handle-vertical" className={css.drag} />
                                    <Text width={12}>{`${index + 1}.`}</Text>
                                    <FormInput.MultiTextInput
                                      name={`varFile.spec.store.spec.paths[${index}].path`}
                                      label=""
                                      multiTextInputProps={{
                                        expressions,
                                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                                      }}
                                      style={{ width: 320 }}
                                    />
                                    <Button
                                      minimal
                                      icon="trash"
                                      data-testid={`remove-header-${index}`}
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  </Layout.Horizontal>
                                </Layout.Horizontal>
                              )
                            )}
                            <Button
                              icon="plus"
                              minimal
                              intent="primary"
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
              </div>

              <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="tf-remote-back-btn"
                />
                <Button type="submit" intent="primary" text={getString('submit')} rightIcon="chevron-right" />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
