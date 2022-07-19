/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  Formik,
  FormInput,
  Layout,
  SelectOption,
  StepProps,
  Text,
  useToaster,
  MultiTypeInputType,
  getMultiTypeFromValue,
  Icon,
  HarnessDocTooltip,
  AllowedTypes
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, map } from 'lodash-es'
import cx from 'classnames'
import { FieldArray, Form, FieldArrayRenderProps } from 'formik'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'
import {
  formatInitialValues,
  terraformArtifactorySchema,
  tfArtifactoryFormInputNames,
  getConnectorRef,
  formatOnSubmitData
} from './TerraformArtifactoryFormHelper'
import type { PathInterface } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

const onDragStart = (event: React.DragEvent<HTMLDivElement>, index: number): void => {
  event.dataTransfer.setData('data', index.toString())
  event.currentTarget.classList.add(css.dragging)
}

const onDragEnd = (event: React.DragEvent<HTMLDivElement>): void => {
  event.currentTarget.classList.remove(css.dragging)
}

const onDragLeave = (event: React.DragEvent<HTMLDivElement>): void => {
  event.currentTarget.classList.remove(css.dragOver)
}

const onDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
  if (event.preventDefault) {
    event.preventDefault()
  }
  event.currentTarget.classList.add(css.dragOver)
  event.dataTransfer.dropEffect = 'move'
}

const onDrop = (
  event: React.DragEvent<HTMLDivElement>,
  arrayHelpers: FieldArrayRenderProps,
  droppedIndex: number
): void => {
  if (event.preventDefault) {
    event.preventDefault()
  }
  const data = event.dataTransfer.getData('data')
  if (data) {
    const index = parseInt(data, 10)
    arrayHelpers.swap(index, droppedIndex)
  }
  event.currentTarget.classList.remove(css.dragOver)
}
interface TFArtifactoryProps {
  onSubmitCallBack: (data: any, prevStepData?: any) => void
  isConfig: boolean
  isTerraformPlan: boolean
  allowableTypes: AllowedTypes
}

export const TFArtifactoryForm: React.FC<StepProps<any> & TFArtifactoryProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isConfig,
  isTerraformPlan,
  allowableTypes
}) => {
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const initialValues = formatInitialValues(isConfig, prevStepData, isTerraformPlan)
  const connectorRef = getConnectorRef(isConfig, isTerraformPlan, prevStepData)
  const { expressions } = useVariablesExpression()
  const {
    data: ArtifactRepoData,
    loading: ArtifactRepoLoading,
    refetch: getArtifactRepos,
    error: ArtifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (ArtifactRepoError) {
      showError(getRBACErrorMessage(ArtifactRepoError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ArtifactRepoError])

  useEffect(() => {
    if (getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED && !ArtifactRepoData) {
      getArtifactRepos()
    }

    if (ArtifactRepoData) {
      setConnectorRepos(map(ArtifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ArtifactRepoData, connectorRef])

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Text font="large" color={Color.GREY_800}>
        {isConfig ? getString('cd.configFileDetails') : getString('cd.varFileDetails')}
      </Text>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={initialValues}
        enableReinitialize
        validationSchema={terraformArtifactorySchema(isConfig, getString)}
        onSubmit={(values: any) => {
          /* istanbul ignore next */
          if (isConfig) {
            onSubmitCallBack(values, prevStepData)
          } else {
            const varFiles = {
              varFile: {
                type: values.varFile?.type,
                identifier: values.varFile?.identifier,
                spec: {
                  store: {
                    type: values.varFile?.spec?.store?.type,
                    spec: {
                      repositoryName: values.varFile?.spec?.store?.spec.repositoryName.value,
                      ...values.varFile?.spec?.store?.spec
                    }
                  }
                }
              }
            }
            const data = formatOnSubmitData(varFiles, prevStepData, connectorRef)
            onSubmitCallBack(data)
          }
        }}
      >
        {formik => {
          let selectedArtifacts: any = []
          let repoName: string
          if (isConfig) {
            selectedArtifacts = defaultTo(
              formik?.values?.spec?.configuration?.configFiles?.store?.spec?.artifactPaths,
              [{ path: '' }]
            )
            repoName = formik?.values?.spec?.configuration?.configFiles?.store?.spec?.repositoryName
          } else {
            selectedArtifacts = defaultTo(formik.values?.varFile?.spec?.store?.spec?.artifactPaths, [{ path: '' }])
            repoName = formik.values?.varFile?.spec?.store?.spec?.repositoryName
          }
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                {!isConfig && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                  </div>
                )}
                <Text style={{ color: Color.GREY_900 }}>
                  {getString('pipelineSteps.repoName')}
                  <Button
                    style={{ padding: 0, margin: 0 }}
                    icon="tooltip-icon"
                    minimal
                    color={Color.PRIMARY_7}
                    tooltip={getString('cd.artifactRepoTooltip')}
                    tooltipProps={{
                      usePortal: false,
                      isDark: true,
                      className: css.tooltipProps
                    }}
                    iconProps={{
                      size: 12,
                      padding: { right: 'small', top: 'small', bottom: 'small' }
                    }}
                  />
                </Text>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED ? (
                    <FormInput.MultiTypeInput
                      selectItems={connectorRepos ? connectorRepos : []}
                      name={tfArtifactoryFormInputNames(isConfig).repositoryName}
                      label={''}
                      useValue
                      placeholder={getString(ArtifactRepoLoading ? 'common.loading' : 'cd.selectRepository')}
                      disabled={ArtifactRepoLoading}
                      multiTypeInputProps={{
                        expressions,
                        allowableTypes
                      }}
                    />
                  ) : (
                    <FormInput.MultiTextInput
                      name={tfArtifactoryFormInputNames(isConfig).repositoryName}
                      label={''}
                      placeholder={getString('cd.selectRepository')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                          item => item !== MultiTypeInputType.RUNTIME
                        ) as AllowedTypes
                      }}
                    />
                  )}
                  {getMultiTypeFromValue(repoName) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={repoName}
                      type="String"
                      variableName={tfArtifactoryFormInputNames(isConfig).repositoryName}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value =>
                        /* istanbul ignore next */
                        formik.setFieldValue(tfArtifactoryFormInputNames(isConfig).repositoryName, value)
                      }
                    />
                  )}
                </div>
                <div className={cx(stepCss.md)}>
                  <MultiTypeFieldSelector
                    name={tfArtifactoryFormInputNames(isConfig).artifactPaths}
                    style={{ width: 370 }}
                    allowedTypes={
                      (allowableTypes as MultiTypeInputType[]).filter(
                        item => item !== MultiTypeInputType.EXPRESSION
                      ) as AllowedTypes
                    }
                    label={
                      <Text flex={{ inline: true }}>
                        {getString(isConfig ? 'pipeline.artifactPathLabel' : 'cd.artifactPaths')}
                        <HarnessDocTooltip useStandAlone={true} tooltipId="artifactory_file_path" />
                      </Text>
                    }
                  >
                    {isConfig ? (
                      <FormInput.MultiTextInput
                        name={`${tfArtifactoryFormInputNames(isConfig).artifactPaths}[0].path`}
                        label=""
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                            item => item !== MultiTypeInputType.RUNTIME
                          ) as AllowedTypes
                        }}
                      />
                    ) : (
                      <FieldArray
                        name={tfArtifactoryFormInputNames(isConfig).artifactPaths}
                        render={arrayHelpers => {
                          return (
                            <div>
                              {map(selectedArtifacts, (path: PathInterface, index: number) => (
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
                                      name={`${tfArtifactoryFormInputNames(isConfig).artifactPaths}[${index}].path`}
                                      label=""
                                      multiTextInputProps={{
                                        expressions,
                                        allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                          item => item !== MultiTypeInputType.RUNTIME
                                        ) as AllowedTypes
                                      }}
                                      style={{ width: 320 }}
                                    />
                                    {!isConfig && (
                                      <Button
                                        minimal
                                        icon="main-trash"
                                        data-testid={`remove-header-${index}`}
                                        onClick={() => arrayHelpers.remove(index)}
                                      />
                                    )}
                                  </Layout.Horizontal>
                                </Layout.Horizontal>
                              ))}
                              {!isConfig && (
                                <Button
                                  icon="plus"
                                  variation={ButtonVariation.LINK}
                                  data-testid="add-header"
                                  onClick={() => arrayHelpers.push({ path: '' })}
                                >
                                  {getString('cd.addTFVarFileLabel')}
                                </Button>
                              )}
                            </div>
                          )
                        }}
                      />
                    )}
                  </MultiTypeFieldSelector>
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
