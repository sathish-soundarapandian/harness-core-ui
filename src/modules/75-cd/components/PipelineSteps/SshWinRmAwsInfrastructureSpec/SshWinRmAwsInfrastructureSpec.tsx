/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  IconName,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  Text
} from '@harness/uicore'
import type { AllowedTypes } from '@harness/uicore'
import { parse } from 'yaml'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { noop, isEmpty, get, debounce, set } from 'lodash-es'
import type { FormikErrors, FormikProps } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings, UseStringsReturn } from 'framework/strings'
import {
  getConnectorListV2Promise,
  listSecretsV2Promise,
  ConnectorResponse,
  SecretResponseWrapper,
  SshWinRmAwsInfrastructure,
  useRegionsForAws,
  useTags
} from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { InfraDeploymentType } from '../PipelineStepsUtil'
import { SshWimRmAwsInfrastructureSpecInputForm } from './SshWimRmAwsInfrastructureSpecInputForm'
import { getValue } from '../SshWinRmAzureInfrastructureSpec/SshWinRmAzureInfrastructureInterface'
import css from './SshWinRmAwsInfrastructureSpec.module.scss'

const logger = loggerFor(ModuleName.CD)

const errorMessage = 'data.message'

export type SshWinRmAwsInfrastructureTemplate = { [key in keyof SshWinRmAwsInfrastructure]: string }

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    sshKey: Yup.object().required(getString('validation.password')),
    connectorRef: Yup.object().required(getString('validation.password')),
    region: Yup.object().required()
  })
}
interface SshWinRmAwsInfrastructureSpecEditableProps {
  initialValues: SshWinRmAwsInfrastructure
  allValues?: SshWinRmAwsInfrastructure
  onUpdate?: (data: SshWinRmAwsInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: SshWinRmAwsInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SshWinRmAwsInfrastructure
  allowableTypes: AllowedTypes
}

interface SshWinRmAwsInfrastructureUI extends SshWinRmAwsInfrastructure {
  sshKey: SecretReferenceInterface
}

const SshWinRmAwsInfrastructureSpecEditable: React.FC<SshWinRmAwsInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const formikRef = useRef<FormikProps<SshWinRmAwsInfrastructureUI> | null>(null)
  const delayedOnUpdate = useRef(debounce(onUpdate || noop, 300)).current

  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const [regions, setRegions] = useState<SelectOption[]>([])

  const [tags, setTags] = useState<SelectOption[]>([])
  const [canTagsHaveFixedValue, setCanTagsHaveFixedValue] = useState(
    getMultiTypeFromValue(initialValues.region) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED
  )

  const parsedInitialValues = useMemo(() => {
    const initials = {
      ...initialValues
    }
    if (initialValues.credentialsRef) {
      set(initials, 'sshKey', get(initialValues, 'credentialsRef', ''))
    }
    if (initialValues.region) {
      if (getMultiTypeFromValue(initialValues.region) === MultiTypeInputType.FIXED) {
        set(initials, 'region', { label: initialValues.region, value: initialValues.region })
      } else {
        set(initials, 'region', initialValues.region)
      }
    }
    const initialTags = get(initialValues, 'awsInstanceFilter.tags', false)
    if (canTagsHaveFixedValue && initialTags) {
      if (getMultiTypeFromValue(initialTags) === MultiTypeInputType.FIXED) {
        set(
          initials,
          'tags',
          Object.entries(initialTags).map(entry => ({
            value: entry[0],
            label: entry[1]
          }))
        )
      } else {
        set(initials, 'tags', initialTags)
      }
    } else {
      set(initials, 'tags', '<+input>')
    }
    return initials
  }, [
    initialValues.credentialsRef,
    initialValues.connectorRef,
    initialValues.region,
    initialValues.awsInstanceFilter.tags
  ])

  const { data: regionsData, loading: isRegionsLoading, error: regionsError } = useRegionsForAws({})

  useEffect(() => {
    const regionOptions = Object.entries(get(regionsData, 'data', {})).map(regEntry => ({
      value: regEntry[0],
      label: regEntry[1]
    }))
    setRegions(regionOptions)
  }, [regionsData])

  const {
    data: tagsData,
    refetch: refetchTags,
    loading: isTagsLoading
  } = useTags({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: get(initialValues, 'region', ''),
      awsConnectorRef: get(initialValues, 'connectorRef', '')
    },
    lazy: true
  })

  useEffect(() => {
    const tagOptions = get(tagsData, 'data', []).map((tagItem: string) => ({
      value: tagItem,
      label: tagItem
    }))
    setTags(tagOptions)
  }, [tagsData])

  const refetchTagsValues = (values: SshWinRmAwsInfrastructure) => {
    if (
      values.region &&
      getMultiTypeFromValue(values.region) === MultiTypeInputType.FIXED &&
      values.connectorRef &&
      getMultiTypeFromValue(getValue(values.connectorRef)) === MultiTypeInputType.FIXED
    ) {
      if (getMultiTypeFromValue(values.tags) === MultiTypeInputType.FIXED)
        formikRef.current?.setFieldValue('tags', [], false)
      refetchTags({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          region: getValue(get(values, 'region', '')),
          awsConnectorRef: getValue(values.connectorRef)
        }
      })
    }
  }

  useEffect(() => {
    refetchTagsValues(initialValues)
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <>
        <Formik<SshWinRmAwsInfrastructureUI>
          formName="sshWinRmAWSInfra"
          initialValues={parsedInitialValues as SshWinRmAwsInfrastructureUI}
          validationSchema={getValidationSchema(getString) as Partial<SshWinRmAwsInfrastructureUI>}
          validate={value => {
            const data: Partial<SshWinRmAwsInfrastructure> = {
              connectorRef:
                typeof value.connectorRef === 'string' ? value.connectorRef : get(value, 'connectorRef.value', ''),
              credentialsRef:
                typeof get(value, 'sshKey', '') === 'string'
                  ? get(value, 'sshKey', '')
                  : get(value, 'sshKey.referenceString', ''),
              region: typeof value.region === 'string' ? value.region : get(value, 'region.value', ''),
              tags: value.tags
            }
            if (value.tags && getMultiTypeFromValue(value.tags) === MultiTypeInputType.FIXED) {
              const awsTags = (value.tags || value.awsInstanceFilter.tags).reduce(
                (prevValue: object, tag: { label: string; value: string }) => {
                  return {
                    ...prevValue,
                    [tag.value]: tag.label
                  }
                },
                {}
              )
              set(data, 'awsInstanceFilter.tags', awsTags)
            } else if (getMultiTypeFromValue(value.tags) === MultiTypeInputType.RUNTIME) {
              set(data, 'awsInstanceFilter.tags', value.tags)
            }

            delayedOnUpdate(data as SshWinRmAwsInfrastructure)
          }}
          onSubmit={noop}
        >
          {formik => {
            window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
            formikRef.current = formik
            return (
              <FormikForm>
                <Layout.Vertical className={css.formRow} spacing="medium" margin={{ bottom: 'large' }}>
                  <div className={css.inputWidth}>
                    <MultiTypeSecretInput
                      name="sshKey"
                      type="SSHKey"
                      label={getString('cd.steps.common.specifyCredentials')}
                      onSuccess={secret => {
                        if (secret) {
                          /* istanbul ignore next */
                          formikRef.current?.setFieldValue('credentialsRef', secret.referenceString)
                        }
                      }}
                    />
                  </div>
                  <Layout.Vertical>
                    <FormMultiTypeConnectorField
                      error={get(formik, 'errors.connectorRef', undefined)}
                      name="connectorRef"
                      type={Connectors.AWS}
                      label={getString('connector')}
                      width={490}
                      placeholder={getString('connectors.selectConnector')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      multiTypeProps={{ allowableTypes, expressions }}
                      onChange={
                        /* istanbul ignore next */ (selected, _typeValue, type) => {
                          const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                          if (type === MultiTypeInputType.FIXED) {
                            const connectorRef =
                              item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                                ? `${item.scope}.${get(item, 'record.identifier', '')}`
                                : get(item, 'record.identifier', '')
                            /* istanbul ignore next */
                            formik.setFieldValue('connectorRef', connectorRef)
                            refetchTagsValues(formik.values)
                          }
                          setCanTagsHaveFixedValue(
                            getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.FIXED &&
                              getMultiTypeFromValue(item.record?.identifier) === MultiTypeInputType.FIXED
                          )
                        }
                      }
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
                <Layout.Vertical>
                  <FormInput.MultiTypeInput
                    name="region"
                    className={`${css.inputWidth}`}
                    selectItems={regions}
                    placeholder={isRegionsLoading ? getString('loading') : getString('pipeline.regionPlaceholder')}
                    label={getString('regionLabel')}
                    multiTypeInputProps={{
                      allowableTypes,
                      expressions,
                      className: 'regionId-select',
                      onChange: /* istanbul ignore next */ option => {
                        const { value } = option as SelectOption
                        if (value) {
                          formik.setFieldValue('region', option)
                          refetchTagsValues(formik.values)
                        }
                        setCanTagsHaveFixedValue(
                          getMultiTypeFromValue(value as string) === MultiTypeInputType.FIXED &&
                            getMultiTypeFromValue(getValue(formik.values.connectorRef)) === MultiTypeInputType.FIXED
                        )
                      },
                      selectProps: {
                        items: regions,
                        noResults: (
                          <Text padding={'small'}>
                            {isRegionsLoading
                              ? getString('loading')
                              : get(regionsError, errorMessage, null) || getString('pipeline.ACR.subscriptionError')}
                          </Text>
                        )
                      }
                    }}
                  />
                </Layout.Vertical>
                <>
                  <Layout.Horizontal>
                    <FormInput.MultiSelectTypeInput
                      name="tags"
                      label={getString('tagLabel')}
                      selectItems={tags}
                      className={`tags-select ${css.inputWidth}`}
                      placeholder={isTagsLoading ? getString('loading') : getString('tagsLabel')}
                      multiSelectTypeInputProps={{
                        placeholder: isTagsLoading ? getString('loading') : getString('tagsLabel'),
                        onFocus: () => {
                          if (
                            getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.FIXED &&
                            getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.FIXED
                          ) {
                            const queryParams = {
                              accountIdentifier: accountId,
                              projectIdentifier,
                              orgIdentifier,
                              region: getValue(formik.values.region),
                              awsConnectorRef: getValue(formik.values.connectorRef)
                            }
                            refetchTags({ queryParams })
                          }
                        },
                        allowableTypes: canTagsHaveFixedValue
                          ? [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                          : [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
                        expressions,
                        onChange: /* istanbul ignore next */ selectedOptions => {
                          formik.setFieldValue('tags', selectedOptions)
                        }
                      }}
                    />
                  </Layout.Horizontal>
                </>
              </FormikForm>
            )
          }}
        </Formik>
      </>
    </Layout.Vertical>
  )
}

const SshWinRmAwsInfraSpecVariablesForm: React.FC<SshWinRmAwsInfrastructure> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = get(variablesData, 'infrastructureDefinition.spec', null)
  return infraVariables ? (
    <VariablesListTable
      data={infraVariables}
      originalData={get(initialValues, 'infrastructureDefinition.spec', initialValues)}
      metadataMap={metadataMap}
    />
  ) : null
}

interface SshWinRmAwsInfrastructureStep extends SshWinRmAwsInfrastructure {
  name?: string
  identifier?: string
}

export const ConnectorRefRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
export const SshKeyRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.sshKeyRef$/
export class SshWinRmAwsInfrastructureSpec extends PipelineStep<SshWinRmAwsInfrastructureStep> {
  /* istanbul ignore next */
  protected type = StepType.SshWinRmAws
  /* istanbul ignore next */
  protected defaultValues: SshWinRmAwsInfrastructure = {
    awsInstanceFilter: { tags: {}, vpcs: [] },
    connectorRef: '',
    credentialsRef: '',
    region: ''
  }

  /* istanbul ignore next */
  protected stepIcon: IconName = 'service-aws'
  /* istanbul ignore next */
  protected stepName = 'Specify your AWS Infrastructure'
  /* istanbul ignore next */
  protected stepPaletteVisible = false
  /* istanbul ignore next */
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ConnectorRefRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(SshKeyRegex, this.getSshKeyListForYaml.bind(this))

    this._hasStepVariables = true
  }

  protected getConnectorsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err as any)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const connectorRef = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (connectorRef) {
        /* istanbul ignore next */
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Pdc'], filterType: 'Connector' }
        }).then(response =>
          get(response, 'data.content', []).map((connector: ConnectorResponse) => ({
            label: getConnectorName(connector),
            insertText: getConnectorValue(connector),
            kind: CompletionItemKind.Field
          }))
        )
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  protected getSshKeyListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err as any)
    }
    const { accountId } = params as {
      accountId: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.sshKey', ''))
      if (obj.type === InfraDeploymentType.SshWinRmAws) {
        /* istanbul ignore next */
        return listSecretsV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            includeSecretsFromEverySubScope: true,
            types: ['SSHKey'],
            pageIndex: 0,
            pageSize: 100
          }
        }).then(response =>
          get(response, 'data.content', []).map((secret: SecretResponseWrapper) => ({
            label: secret.secret.name,
            insertText: secret.secret.identifier,
            kind: CompletionItemKind.Field
          }))
        )
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  validateInputSet({
    data,
    getString,
    viewType
  }: ValidateInputSetProps<SshWinRmAwsInfrastructure>): FormikErrors<SshWinRmAwsInfrastructure> {
    const errors: FormikErrors<SshWinRmAwsInfrastructure> = {}
    /* istanbul ignore else */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (isEmpty(data.credentialsRef) && isRequired) {
      /* istanbul ignore next */
      errors.credentialsRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    return errors
  }

  renderStep(props: StepProps<SshWinRmAwsInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, customStepProps, readonly, allowableTypes, inputSetData } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <SshWimRmAwsInfrastructureSpecInputForm
          {...(customStepProps as SshWinRmAwsInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={get(inputSetData, 'readonly', undefined)}
          template={get(inputSetData, 'template', undefined) as SshWinRmAwsInfrastructureTemplate}
          allValues={get(inputSetData, 'allValues', undefined)}
          path={get(inputSetData, 'path', '')}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <SshWinRmAwsInfraSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={get(inputSetData, 'template', undefined)}
          {...(customStepProps as SshWinRmAwsInfrastructure)}
          initialValues={initialValues}
        />
      )
    }
    return (
      <SshWinRmAwsInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as SshWinRmAwsInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
