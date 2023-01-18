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
import { FormikForm, Text, MultiSelectOption, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
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
import { useGetIamRolesForAws } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { DeleteStackData, DeleteStackProps } from '../CloudFormationInterfaces.types'
import { isRuntime } from '../CloudFormationHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export function DeleteStackInputStepRef<T extends DeleteStackData = DeleteStackData>(
  props: DeleteStackProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, allValues, formik, initialValues, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [regions, setRegions] = useState<MultiSelectOption[]>([])
  const [awsRoles, setAwsRoles] = useState<MultiSelectOption[]>([])
  const [awsRef, setAwsRef] = useState<string>(
    defaultTo(
      get(initialValues, 'spec.configuration.spec.connectorRef'),
      get(allValues, 'spec.configuration.spec.connectorRef')
    )
  )
  const [regionsRef, setRegionsRef] = useState(
    defaultTo(get(initialValues, 'spec.configuration.spec.region'), get(allValues, 'spec.configuration.spec.region'))
  )

  const {
    data: regionData,
    loading: regionsLoading,
    refetch: getRegions
  } = useListAwsRegions({
    lazy: true,
    queryParams: {
      accountId
    }
  })
  const regionRequired = isRuntime(inputSetData?.template?.spec?.configuration?.spec?.region as string)
  useEffect(() => {
    if (regionData) {
      const regionValues = map(regionData?.resource, reg => ({ label: reg.name, value: reg.value }))
      setRegions(regionValues as MultiSelectOption[])
    }

    if (!regionData && regionRequired) {
      getRegions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionData, regionRequired])

  const connectorRef = get(allValues, 'spec.configuration.spec.connectorRef')
  const {
    data: roleData,
    refetch: getRoles,
    loading
  } = useGetIamRolesForAws({
    lazy: true,
    debounce: 500,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      awsConnectorRef: awsRef || connectorRef,
      region: regionsRef as string
    }
  })

  const roleRequired = isRuntime(inputSetData?.template?.spec?.configuration?.spec?.roleArn as string)
  useEffect(() => {
    if (roleData) {
      const roles = []
      for (const key in roleData?.data) {
        roles.push({ label: roleData?.data[key], value: key })
      }
      setAwsRoles(roles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            template={inputSetData?.template}
            fieldPath={'timeout'}
            className={cx(stepCss.formGroup, stepCss.md)}
          />
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.spec?.provisionerIdentifier as string) && (
          <TextFieldInputSetView
            name={`${path}.spec.configuration.spec.provisionerIdentifier`}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            template={inputSetData?.template}
            fieldPath={'spec.configuration.spec.provisionerIdentifier'}
            className={cx(stepCss.formGroup, stepCss.md)}
          />
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.spec?.connectorRef as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormMultiTypeConnectorField
              label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
              type={Connectors.AWS}
              name={`${path}.spec.configuration.spec.connectorRef`}
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              style={{ marginBottom: 10 }}
              multiTypeProps={{ expressions, allowableTypes }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              disabled={readonly}
              width={300}
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
                get(formik?.values, `${path}.spec.configuration.spec.roleArn`) &&
                  getMultiTypeFromValue(get(formik?.values, `${path}.spec.configuration.spec.roleArn`)) ===
                    MultiTypeInputType.FIXED &&
                  formik?.setFieldValue(`${path}.spec.configuration.spec.roleArn`, '')
                setAwsRoles([])
              }}
              setRefValue
              templateProps={{
                isTemplatizedView: true,
                templateValue: inputSetData?.template?.spec?.configuration?.spec?.connectorRef
              }}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.spec?.region as string) && (
          <SelectInputSetView
            className={cx(stepCss.formGroup, stepCss.md)}
            label={getString('regionLabel')}
            name={`${path}.spec.configuration.spec.region`}
            placeholder={getString(regionsLoading ? 'common.loading' : 'pipeline.regionPlaceholder')}
            disabled={readonly}
            useValue
            template={inputSetData?.template}
            fieldPath={'spec.configuration.spec.region'}
            multiTypeInputProps={{
              onChange: value => {
                setRegionsRef((value as any).value as string)
                get(formik?.values, `${path}.spec.configuration.spec.roleArn`) &&
                  getMultiTypeFromValue(get(formik?.values, `${path}.spec.configuration.spec.roleArn`)) ===
                    MultiTypeInputType.FIXED &&
                  formik?.setFieldValue(`${path}.spec.configuration.spec.roleArn`, '')
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
          />
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.spec?.roleArn as string) && (
          <SelectInputSetView
            className={cx(stepCss.formGroup, stepCss.md)}
            label={getString('connectors.awsKms.roleArnLabel')}
            name={`${path}.spec.configuration.spec.roleArn`}
            disabled={readonly || loading}
            placeholder={getString(loading ? 'common.loading' : 'select')}
            useValue
            template={inputSetData?.template}
            fieldPath={'spec.configuration.spec.roleArn'}
            multiTypeInputProps={{
              selectProps: {
                allowCreatingNewItems: false,
                items: awsRoles ? awsRoles : []
              },
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            selectItems={awsRoles ? awsRoles : []}
          />
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.spec?.stackName as string) && (
          <TextFieldInputSetView
            name={`${path}.spec.configuration.spec.stackName`}
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
            fieldPath={'spec.configuration.spec.stackName'}
            className={cx(stepCss.formGroup, stepCss.md)}
          />
        )
      }
    </FormikForm>
  )
}

const DeleteStackInputStep = connect(DeleteStackInputStepRef)
export default DeleteStackInputStep
