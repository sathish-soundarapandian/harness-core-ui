/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, map, get, defaultTo } from 'lodash-es'
import cx from 'classnames'
import {
  FormikForm,
  Text,
  MultiSelectOption,
  MultiSelectTypeInput,
  Label,
  Layout,
  useToaster,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useListAwsRegions } from 'services/portal'
import { useCFCapabilitiesForAws, useCFStatesForAws, useGetIamRolesForAws } from 'services/cd-ng'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { Scope } from '@common/interfaces/SecretsInterface'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { TFMonaco } from '../../../Common/Terraform/Editview/TFMonacoEditor'
import TemplateFileInputs from './TemplateFile'
import ParameterFileInputs from './ParameterInputs'
import OverrideParameterFileInputs from './OverrideParameterFileInputs'
import TagsInputs from './TagsInputs'
import type { CreateStackData, CreateStackProps, Tags } from '../../CloudFormationInterfaces.types'
import { isRuntime } from '../../CloudFormationHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function CreateStackInputStepRef<T extends CreateStackData = CreateStackData>(
  props: CreateStackProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, formik, allValues, initialValues, stepViewType } = props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [regions, setRegions] = useState<MultiSelectOption[]>([])
  const [awsRoles, setAwsRoles] = useState<MultiSelectOption[]>([])
  const [awsStatuses, setAwsStates] = useState<MultiSelectOption[]>([])
  const [capabilities, setCapabilities] = useState<MultiSelectOption[]>([])
  const [selectedCapabilities, setSelectedCapabilities] = useState<MultiSelectOption[]>([])
  const [selectedStackStatus, setSelectedStackStatus] = useState<MultiSelectOption[]>([])
  const [awsRef, setAwsRef] = useState(
    defaultTo(get(initialValues, 'spec.configuration.connectorRef'), get(allValues, 'spec.configuration.connectorRef'))
  )
  const [regionsRef, setRegionsRef] = useState(
    defaultTo(get(initialValues, 'spec.configuration.region'), get(allValues, 'spec.configuration.region'))
  )

  useEffect(() => {
    /* istanbul ignore next */
    if (selectedCapabilities.length > 0) {
      formik?.setFieldValue(
        `${path}.spec.configuration.capabilities`,
        map(selectedCapabilities, cap => cap.value)
      )
    }
  }, [selectedCapabilities])

  useEffect(() => {
    /* istanbul ignore next */
    if (selectedStackStatus.length > 0) {
      formik?.setFieldValue(
        `${path}.spec.configuration.skipOnStackStatuses`,
        map(selectedStackStatus, status => status.value)
      )
    }
  }, [selectedStackStatus])

  const capabilitiesRequired = isRuntime(inputSetData?.template?.spec?.configuration?.capabilities as string)
  const { data: capabilitiesData, refetch: getAwsCapabilities } = useCFCapabilitiesForAws({ lazy: true })

  useEffect(() => {
    if (capabilitiesData) {
      const capabilitiesValues = map(capabilitiesData?.data, cap => ({ label: cap, value: cap }))
      setCapabilities(capabilitiesValues as MultiSelectOption[])
    }

    /* istanbul ignore next */
    if (!capabilitiesData && capabilitiesRequired) {
      getAwsCapabilities()
    }
  }, [capabilitiesData, capabilitiesRequired])

  const awsStatusRequired = isRuntime(inputSetData?.template?.spec?.configuration?.skipOnStackStatuses as string)
  const { data: awsStatusData, refetch: getAwsStatuses } = useCFStatesForAws({ lazy: true })

  useEffect(() => {
    if (awsStatusData) {
      const awsStatesValues = map(awsStatusData?.data, cap => ({ label: cap, value: cap }))
      setAwsStates(awsStatesValues as MultiSelectOption[])
    }

    /* istanbul ignore next */
    if (!awsStatusData && awsStatusRequired) {
      getAwsStatuses()
    }
  }, [awsStatusData, awsStatusRequired])

  const {
    data: regionData,
    loading: regionsLoading,
    refetch: getRegions,
    error
  } = useListAwsRegions({
    lazy: true,
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    if (error) {
      /* istanbul ignore next */
      showError(error?.message)
    }
  }, [error])

  const regionRequired = isRuntime(inputSetData?.template?.spec?.configuration?.region as string)
  useEffect(() => {
    if (regionData) {
      const regionValues = map(regionData?.resource, reg => ({ label: reg.name, value: reg.value }))
      setRegions(regionValues as MultiSelectOption[])
    }

    if (!regionData && regionRequired) {
      /* istanbul ignore next */
      getRegions()
    }
  }, [regionData, regionRequired])

  const {
    data: roleData,
    refetch: getRoles,
    loading: rolesLoading
  } = useGetIamRolesForAws({
    lazy: true,
    debounce: 500,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      awsConnectorRef: awsRef as string,
      region: regionsRef as string
    }
  })

  const roleRequired = isRuntime(inputSetData?.template?.spec?.configuration?.roleArn as string)
  useEffect(() => {
    if (roleData) {
      const roles = []
      for (const key in roleData?.data) {
        roles.push({ label: roleData?.data[key], value: key })
      }
      setAwsRoles(roles)
    }
    /* istanbul ignore next */
  }, [roleData, roleRequired])

  useEffect(() => {
    if (
      !isEmpty(awsRef) &&
      getMultiTypeFromValue(awsRef) === MultiTypeInputType.FIXED &&
      !isEmpty(regionsRef) &&
      getMultiTypeFromValue(regionsRef) === MultiTypeInputType.FIXED
    ) {
      getRoles()
    }
  }, [awsRef, getRoles, regionsRef])

  return (
    <FormikForm>
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.timeout as string) && (
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            fieldPath={'timeout'}
            template={inputSetData?.template}
            className={cx(stepCss.formGroup, stepCss.sm)}
          />
        )
      }
      {isRuntime(inputSetData?.template?.spec?.provisionerIdentifier as string) && (
        <TextFieldInputSetView
          name={`${path}.spec.provisionerIdentifier`}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          data-testid={`${path}.spec.provisionerIdentifier`}
          template={inputSetData?.template}
          fieldPath={'spec.provisionerIdentifier'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {isRuntime(inputSetData?.template?.spec?.configuration?.connectorRef as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
            type={Connectors.AWS}
            name={`${path}.spec.configuration.connectorRef`}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            style={{ marginBottom: 10 }}
            multiTypeProps={{ expressions, allowableTypes }}
            disabled={readonly}
            width={300}
            setRefValue
            onChange={(selected: any, _typeValue, type) => {
              const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
              /* istanbul ignore next */
              if (type === MultiTypeInputType.FIXED) {
                const connectorRefValue =
                  item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                    ? `${item.scope}.${item?.record?.identifier}`
                    : item.record?.identifier
                setAwsRef(connectorRefValue as string)
              } else setAwsRef(selected as string)
              get(formik?.values, `${path}.spec.configuration.roleArn`) &&
                getMultiTypeFromValue(get(formik?.values, `${path}.spec.configuration.roleArn`)) ===
                  MultiTypeInputType.FIXED &&
                formik?.setFieldValue(`${path}.spec.configuration.roleArn`, '')
              setAwsRoles([])
            }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: inputSetData?.template?.spec?.configuration?.connectorRef
            }}
          />
        </div>
      )}
      {isRuntime(inputSetData?.template?.spec?.configuration?.region as string) && (
        <SelectInputSetView
          label={getString('regionLabel')}
          className={cx(stepCss.formGroup, stepCss.sm)}
          name={`${path}.spec.configuration.region`}
          placeholder={getString(regionsLoading ? 'common.loading' : 'pipeline.regionPlaceholder')}
          disabled={readonly}
          useValue
          multiTypeInputProps={{
            onChange: value => {
              setRegionsRef((value as any).value as string)
              get(formik?.values, `${path}.spec.configuration.roleArn`) &&
                getMultiTypeFromValue(get(formik?.values, `${path}.spec.configuration.roleArn`)) ===
                  MultiTypeInputType.FIXED &&
                formik?.setFieldValue(`${path}.spec.configuration.roleArn`, '')
              setAwsRoles([])
            },
            selectProps: {
              allowCreatingNewItems: true,
              items: regions ? regions : []
            },
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          selectItems={regions ? regions : []}
          template={inputSetData?.template}
          fieldPath={'spec.configuration.region'}
        />
      )}
      {inputSetData?.template?.spec?.configuration?.templateFile && <TemplateFileInputs {...props} />}
      {inputSetData?.template?.spec?.configuration?.parameters && <ParameterFileInputs {...props} />}
      {inputSetData?.template?.spec?.configuration?.parameterOverrides && <OverrideParameterFileInputs {...props} />}
      {isRuntime(inputSetData?.template?.spec?.configuration?.stackName as string) && (
        <TextFieldInputSetView
          name={`${path}.spec.configuration.stackName`}
          label={getString('cd.cloudFormation.stackName')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={inputSetData?.template}
          fieldPath={'spec.configuration.stackName'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {isRuntime(inputSetData?.template?.spec?.configuration?.roleArn as string) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.sm)}
          label={getString('connectors.awsKms.roleArnLabel')}
          name={`${path}.spec.configuration.roleArn`}
          disabled={readonly || rolesLoading}
          useValue
          placeholder={getString(rolesLoading ? 'common.loading' : 'select')}
          multiTypeInputProps={{
            selectProps: {
              allowCreatingNewItems: false,
              items: awsRoles
            },
            expressions,
            allowableTypes
          }}
          enableConfigureOptions={true}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          selectItems={awsRoles}
          template={inputSetData?.template}
          fieldPath={'spec.configuration.roleArn'}
        />
      )}
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.capabilities as string) && (
          <Layout.Vertical>
            <Label style={{ color: Color.GREY_900 }}>{getString('cd.cloudFormation.specifyCapabilities')}</Label>
            <MultiSelectTypeInput
              name={`${path}.spec.configuration.capabilities`}
              disabled={readonly}
              multiSelectProps={{
                items: capabilities,
                allowCreatingNewItems: false
              }}
              width={500}
              value={selectedCapabilities}
              onChange={values => {
                /* istanbul ignore next */
                setSelectedCapabilities(values as MultiSelectOption[])
              }}
              data-testid={`${path}.spec.configuration.capabilities`}
            />
          </Layout.Vertical>
        )
      }
      {inputSetData?.template?.spec?.configuration?.tags?.type === 'Remote' && <TagsInputs {...props} />}
      {
        /* istanbul ignore next */
        isRuntime((inputSetData?.template?.spec?.configuration?.tags as Tags)?.spec?.content) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <MultiTypeFieldSelector
              name={`${path}.spec.configuration.tags.spec.content`}
              label={getString('tagsLabel')}
              defaultValueToReset=""
              allowedTypes={allowableTypes}
              skipRenderValueInExpressionLabel
              disabled={readonly}
              expressionRender={() => {
                /* istanbul ignore next */
                return (
                  <TFMonaco
                    name={`${path}.spec.configuration.tags.spec.content`}
                    formik={formik!}
                    expressions={expressions}
                    title={getString('tagsLabel')}
                  />
                )
              }}
            >
              <TFMonaco
                name={`${path}.spec.configuration.tags.spec.content`}
                formik={formik!}
                expressions={expressions}
                title={getString('tagsLabel')}
              />
            </MultiTypeFieldSelector>
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.skipOnStackStatuses as string) && (
          <Layout.Vertical>
            <Label style={{ color: Color.GREY_900 }}>{getString('cd.cloudFormation.continueStatus')}</Label>
            <MultiSelectTypeInput
              name={`${path}.spec.configuration.skipOnStackStatuses`}
              disabled={readonly}
              multiSelectProps={{
                items: awsStatuses,
                allowCreatingNewItems: false
              }}
              width={500}
              value={selectedStackStatus}
              onChange={values => {
                /* istanbul ignore next */
                setSelectedStackStatus(values as MultiSelectOption[])
              }}
              data-testid={`${path}.spec.configuration.skipOnStackStatuses`}
            />
          </Layout.Vertical>
        )
      }
    </FormikForm>
  )
}

const CreateStackInputStep = connect(CreateStackInputStepRef)
export default CreateStackInputStep
