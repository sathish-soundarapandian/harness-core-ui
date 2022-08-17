/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useRef } from 'react'
import {
  IconName,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue
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
  regionsForAwsPromise,
  tagsPromise
} from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
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

export type SshWinRmAwsInfrastructureTemplate = { [key in keyof SshWinRmAwsInfrastructure]: string }

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    sshKey: Yup.object().required(getString('validation.password'))
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
  const { showError } = useToaster()

  const [regions, setRegions] = useState<SelectOption[]>([])
  const [isRegionsLoading, setIsRegionsLoading] = useState(false)

  const [tags, setTags] = useState<SelectOption[]>([])
  const [isTagsLoading, setIsTagsLoading] = useState(false)

  const parsedInitialValues = useMemo(() => {
    const initials = {
      ...initialValues
    }
    if (initialValues.credentialsRef) {
      set(initials, 'sshKey', initialValues?.credentialsRef)
    }
    if (initialValues.region) {
      set(initials, 'region', { label: initialValues.region, value: initialValues.region })
    }
    if (initialValues?.awsInstanceFilter?.tags) {
      set(
        initials,
        'tags',
        Object.entries(initialValues?.awsInstanceFilter?.tags).map(entry => ({
          value: entry[0],
          label: entry[1]
        }))
      )
    }
    return initials
  }, [
    initialValues.credentialsRef,
    initialValues.connectorRef,
    initialValues.region,
    initialValues.awsInstanceFilter?.tags
  ])

  const fetchRegions = async () => {
    setIsRegionsLoading(true)
    try {
      const response = await regionsForAwsPromise({})
      if (response.status === 'SUCCESS') {
        const regionOptions = Object.entries(get(response, 'data', {})).map(regEntry => ({
          value: regEntry[0],
          label: regEntry[1]
        }))
        setRegions(regionOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(get(e, 'message', '') || get(e, 'responseMessage[0]', ''))
    } finally {
      setIsRegionsLoading(false)
    }
  }

  const fetchTags = async (region: string) => {
    try {
      setIsTagsLoading(true)
      const response = await tagsPromise({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.value', ''),
          region
        }
      })
      if (response.status === 'SUCCESS') {
        const tagOptions = get(response, 'data', []).map(tagItem => ({
          value: tagItem,
          label: tagItem
        }))
        setTags(tagOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(get(e, 'message', '') || get(e, 'responseMessage[0]', ''))
    } finally {
      setIsTagsLoading(false)
    }
  }

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
                typeof value?.sshKey === 'string' ? value?.sshKey : get(value, 'sshKey.referenceString', ''),
              region: typeof value.region === 'string' ? value.region : get(value, 'region.value', ''),
              tags: value.tags
            }
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
                                ? `${item.scope}.${item?.record?.identifier}`
                                : item.record?.identifier
                            /* istanbul ignore next */
                            const connectorValue = `${
                              item.scope !== Scope.PROJECT ? `${item.scope}.` : ''
                            }${connectorRef}`
                            formik.setFieldValue('connectorRef', {
                              label: item?.record?.name || '',
                              value: connectorValue,
                              scope: item.scope,
                              live: get(item.record, 'status.status', '') === 'SUCCESS',
                              connector: item.record
                            })
                            /* istanbul ignore next */
                            formikRef.current?.setFieldValue('region', undefined)
                          }
                        }
                      }
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
                <FormInput.MultiTypeInput
                  name="region"
                  className={`regionId-select ${css.inputWidth}`}
                  selectItems={regions}
                  placeholder={isRegionsLoading ? getString('loading') : getString('pipeline.regionPlaceholder')}
                  label={getString('regionLabel')}
                  multiTypeInputProps={{
                    allowableTypes,
                    expressions,
                    onFocus: () => fetchRegions(),
                    onChange: /* istanbul ignore next */ option => {
                      const { value } = option as SelectOption
                      if (value) {
                        formik.setFieldValue('tags', [])
                        formik.setFieldValue('region', option)
                      }
                    }
                  }}
                />
                <>
                  <Layout.Horizontal>
                    <FormInput.MultiSelectTypeInput
                      name="tags"
                      label={getString('tagLabel')}
                      selectItems={tags}
                      className={css.inputWidth}
                      placeholder={isTagsLoading ? getString('loading') : undefined}
                      multiSelectTypeInputProps={{
                        onFocus: () => {
                          if (
                            getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.FIXED &&
                            getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.FIXED
                          ) {
                            fetchTags(getValue(formik.values.region))
                          }
                        },
                        allowableTypes,
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
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
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
          readonly={inputSetData?.readonly}
          template={inputSetData?.template as SshWinRmAwsInfrastructureTemplate}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <SshWinRmAwsInfraSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
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
