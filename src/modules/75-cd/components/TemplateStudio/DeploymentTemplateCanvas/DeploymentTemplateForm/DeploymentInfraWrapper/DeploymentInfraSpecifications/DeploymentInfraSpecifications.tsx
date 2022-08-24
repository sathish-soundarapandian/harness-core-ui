/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { FormikProps, FieldArray } from 'formik'
import {
  Button,
  ButtonVariation,
  FormikForm,
  FormInput,
  Label,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Select
} from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'

import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { JsonNode } from 'services/pipeline-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import CardWithOuterTitle from '@pipeline/components/CardWithOuterTitle/CardWithOuterTitle'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import css from './DeploymentInfraSpecifications.module.scss'

enum VariableType {
  String = 'String',
  Secret = 'Secret',
  Number = 'Number',
  Connector = 'Connector'
}
export enum InstanceScriptTypes {
  Inline = 'Inline',
  FileStore = 'Harness'
}

const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Secret', value: 'Secret' },
  { label: 'Number', value: 'Number' },
  { label: 'Connector', value: 'Connector' }
]

export default function DeploymentInfraSpecifications(props: { formik: FormikProps<JsonNode> }): React.ReactElement {
  const { formik } = props
  const { allowableTypes, isReadOnly } = useDeploymentContext()
  const { values: formValues, setFieldValue } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const scriptType: ScriptType = 'Bash'
  const instanceScriptTypes = React.useMemo(
    () => [
      { label: getString('inline'), value: InstanceScriptTypes.Inline },
      { label: getString('resourcePage.fileStore'), value: InstanceScriptTypes.FileStore }
    ],
    [getString]
  )
  const fetchInstanceScriptType = formValues?.fetchInstancesScript?.store?.type
  const onSelectChange = (item: SelectOption): void => {
    const fieldName = 'fetchInstancesScript.store'
    setFieldValue(fieldName, {
      type: item.value,
      spec: item.value === InstanceScriptTypes.Inline ? {} : { files: [''] }
    })
  }
  const getVariableValueComponent = (variable: AllNGVariables, index: number): JSX.Element => {
    return (
      <>
        {variable.type === VariableType.Secret ? (
          <MultiTypeSecretInput name={`variables[${index}].value`} label="" disabled={isReadOnly} />
        ) : (
          <FormInput.MultiTextInput
            className="variableInput"
            name={`variables[${index}].value`}
            label=""
            disabled={isReadOnly}
            multiTextInputProps={{
              disabled: isReadOnly,
              defaultValueToReset: '',
              expressions,
              textProps: {
                disabled: isReadOnly,
                type: variable.type === VariableType.Number ? 'number' : 'text'
              },
              allowableTypes
            }}
          />
        )}
        {getMultiTypeFromValue(variable.value as string) === MultiTypeInputType.RUNTIME ? (
          <ConfigureOptions
            className={css.configureOptions}
            value={variable.value as string}
            defaultValue={variable.default}
            type={variable.type || /* istanbul ignore next */ 'String'}
            variableName={variable.name || /* istanbul ignore next */ ''}
            onChange={(value, defaultValue) => {
              setFieldValue(`variables[${index}].value`, value)
              setFieldValue(`variables[${index}].default`, defaultValue)
            }}
            isReadonly={isReadOnly}
          />
        ) : null}
      </>
    )
  }

  const fetchScriptWidgetTitle = useMemo(
    (): JSX.Element => (
      <Layout.Vertical>
        <Label className={css.configLabel}>{getString('pipeline.customDeployment.fetchInstanceScriptHeader')}</Label>
      </Layout.Vertical>
    ),
    []
  )

  return (
    <FormikForm>
      <CardWithOuterTitle
        title={getString('common.variables')}
        className={css.infraSections}
        headerClassName={css.headerText}
      >
        <Layout.Horizontal spacing="large">
          <MultiTypeFieldSelector
            name="variables"
            label={getString('pipeline.customDeployment.infraVariablesTitle')}
            defaultValueToReset={[]}
            disableTypeSelection
            className={css.infraVariableSection}
          >
            <FieldArray
              name="variables"
              render={({ push, remove }) => {
                return (
                  <div className={css.panel}>
                    <div className={css.infraVarHeader}>
                      <span className={css.label}>{getString('name')}</span>
                      <span className={css.label}>{getString('typeLabel')}</span>
                      <span className={css.label}>{getString('common.configureOptions.defaultValue')}</span>
                      <span className={css.label}>
                        {getString('description')}
                        {getString('common.optionalLabel')}
                      </span>
                    </div>
                    {formValues?.variables?.map((variable: any, index: number) => {
                      return (
                        <div className={css.infraVarHeader} key={variable.id}>
                          <FormInput.Text
                            name={`variables[${index}].name`}
                            placeholder={getString('name')}
                            disabled={isReadOnly}
                            className={css.label}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`variables[${index}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={isReadOnly}
                            onChange={() => {
                              setFieldValue(`variables[${index}].value`, '')
                            }}
                            className={css.label}
                          />

                          {variable?.type === VariableType.Connector ? (
                            <FormMultiTypeConnectorField
                              name={`variables[${index}].value`}
                              label=""
                              placeholder={getString('connectors.selectConnector')}
                              disabled={isReadOnly}
                              accountIdentifier={accountId}
                              multiTypeProps={{ expressions, disabled: isReadOnly, allowableTypes }}
                              projectIdentifier={projectIdentifier}
                              orgIdentifier={orgIdentifier}
                              width={250}
                              connectorLabelClass={css.connectorRef}
                              gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                              setRefValue
                            />
                          ) : (
                            <div
                              className={css.valueColumn}
                              data-type={getMultiTypeFromValue(variable.value as string)}
                            >
                              {getVariableValueComponent(variable, index)}
                            </div>
                          )}

                          <FormInput.Text
                            name={`variables[${index}].description`}
                            placeholder={getString('common.descriptionPlaceholder')}
                            disabled={isReadOnly}
                          />
                          <Button
                            variation={ButtonVariation.ICON}
                            icon="main-trash"
                            data-testid={`remove-deploymentInfraVar-${index}`}
                            onClick={() => remove(index)}
                            disabled={isReadOnly}
                          />
                        </div>
                      )
                    })}
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      data-testid="add-deploymentInfraVar"
                      disabled={isReadOnly}
                      onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                      className={css.addButton}
                    >
                      {getString('variables.newVariable')}
                    </Button>
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </Layout.Horizontal>
      </CardWithOuterTitle>

      <CardWithOuterTitle
        title={getString('pipeline.customDeployment.fetchInstancesScript')}
        className={css.infraSections}
        headerClassName={css.headerText}
      >
        <div>
          <Layout.Horizontal flex={{ alignItems: 'flex-start' }} margin={{ bottom: 'medium' }}>
            {fetchInstanceScriptType === InstanceScriptTypes.Inline && (
              <div className={css.halfWidth}>
                <MultiTypeFieldSelector
                  name="fetchInstancesScript.store.spec.content"
                  label={fetchScriptWidgetTitle}
                  defaultValueToReset=""
                  disabled={isReadOnly}
                  allowedTypes={allowableTypes}
                  disableTypeSelection={isReadOnly}
                  skipRenderValueInExpressionLabel
                  expressionRender={() => {
                    return (
                      <ShellScriptMonacoField
                        name="fetchInstancesScript.store.spec.content"
                        scriptType={scriptType}
                        disabled={isReadOnly}
                        expressions={expressions}
                      />
                    )
                  }}
                >
                  <ShellScriptMonacoField
                    name="fetchInstancesScript.store.spec.content"
                    scriptType={scriptType}
                    disabled={isReadOnly}
                    expressions={expressions}
                  />
                </MultiTypeFieldSelector>
                {getMultiTypeFromValue(formValues.fetchInstancesScript?.store?.spec?.content) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.fetchInstancesScript?.store?.spec?.content as string}
                    type="String"
                    variableName="fetchInstancesScript.store.spec.content"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value =>
                        setFieldValue('fetchInstancesScript.store.spec.content', value)
                    }
                    isReadonly={isReadOnly}
                  />
                )}
              </div>
            )}
            {fetchInstanceScriptType === InstanceScriptTypes.FileStore && (
              <MultiConfigSelectField
                name="fetchInstancesScript.store.spec.files"
                allowableTypes={allowableTypes}
                fileType={FILE_TYPE_VALUES.FILE_STORE}
                formik={formik}
                expressions={expressions}
                fileUsage={FileUsage.MANIFEST_FILE}
                values={formValues?.fetchInstancesScript?.store?.spec?.files || ['']}
                multiTypeFieldSelectorProps={{
                  disableTypeSelection: false,
                  label: fetchScriptWidgetTitle
                }}
              />
            )}
          </Layout.Horizontal>

          <Select
            name="fetchInstancesScript.store.type"
            items={instanceScriptTypes}
            className={css.templateDropdown}
            defaultSelectedItem={instanceScriptTypes.find(
              type => type.value === get(formValues, 'fetchInstancesScript.store.type')
            )}
            onChange={onSelectChange}
          />
        </div>
      </CardWithOuterTitle>

      <CardWithOuterTitle
        title={getString('pipeline.customDeployment.hostObjectArrayPath')}
        className={css.infraSections}
        headerClassName={css.headerText}
      >
        <Layout.Vertical width={'50%'}>
          <FormInput.MultiTextInput
            name="instancesListPath"
            className={css.halfWidth}
            placeholder={getString('cd.specifyTargetHost')}
            label=""
            multiTextInputProps={{ expressions, disabled: isReadOnly, allowableTypes }}
            disabled={isReadOnly}
          />
        </Layout.Vertical>
      </CardWithOuterTitle>

      <CardWithOuterTitle
        title={getString('pipeline.customDeployment.hostAttributes')}
        className={css.infraSections}
        headerClassName={css.headerText}
      >
        <MultiTypeFieldSelector
          name="instanceAttributes"
          label=""
          defaultValueToReset={[{ fieldName: 'hostName', jsonPath: '', description: '', id: uuid() }]}
          disableTypeSelection
        >
          <FieldArray
            name="instanceAttributes"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.headerRow}>
                    <span className={css.label}>{getString('pipeline.customDeployment.fieldNameLabel')}</span>
                    <span className={css.label}>{getString('pipeline.customDeployment.jsonPathRelativeLabel')}</span>
                    <span className={css.label}>
                      {getString('description')}
                      {getString('common.optionalLabel')}
                    </span>
                  </div>
                  {formValues.instanceAttributes?.map(({ id }: { id: string }, i: number) => (
                    <div className={css.headerRow} key={id}>
                      <FormInput.Text
                        name={`instanceAttributes[${i}].fieldName`}
                        placeholder={getString('pipeline.customDeployment.fieldNamePlaceholder')}
                        disabled={isReadOnly || i === 0}
                      />
                      <FormInput.MultiTextInput
                        name={`instanceAttributes[${i}].jsonPath`}
                        placeholder={getString('common.valuePlaceholder')}
                        disabled={isReadOnly}
                        multiTextInputProps={{
                          allowableTypes: allowableTypes,
                          expressions,
                          disabled: isReadOnly
                        }}
                        label=""
                      />
                      <FormInput.Text
                        name={`instanceAttributes[${i}].description`}
                        placeholder={getString('common.descriptionPlaceholder')}
                        disabled={isReadOnly}
                      />
                      {i > 0 && (
                        <Button
                          variation={ButtonVariation.ICON}
                          icon="main-trash"
                          data-testid={`remove-instanceAttriburteVar-${i}`}
                          onClick={() => remove(i)}
                          disabled={isReadOnly}
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-instanceAttriburteVar"
                    onClick={() => push({ fieldName: '', jsonPath: '', description: '', id: uuid() })}
                    disabled={isReadOnly}
                    className={css.addButton}
                  >
                    {getString('pipeline.customDeployment.newAttribute')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </CardWithOuterTitle>
    </FormikForm>
  )
}
