/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { IconName, Layout, Formik, FormikForm, FormInput, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { parse } from 'yaml'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get } from 'lodash-es'
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
  loadBalancersPromise,
  tagsPromise,
  autoScalingGroupsPromise,
  vpcsPromise
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import { InfraDeploymentType } from '../PipelineStepsUtil'
import css from './SshWinRmAwsInfrastructureSpec.module.scss'

const logger = loggerFor(ModuleName.CD)

type SshWinRmAwsInfrastructureTemplate = { [key in keyof SshWinRmAwsInfrastructure]: string }

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
  allowableTypes: MultiTypeInputType[]
}

interface SshWinRmAwsInfrastructureUI extends SshWinRmAwsInfrastructure {
  sshKey: SecretReferenceInterface | void
}

const AutoScallingGroup = {
  TRUE: 'true',
  FALSE: 'false'
}

const SshWinRmAwsInfrastructureSpecEditable: React.FC<SshWinRmAwsInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { getString } = useStrings()
  const { showError } = useToaster()

  const [regions, setRegions] = useState<SelectOption[]>([])
  const [isRegionsLoading, setIsRegionsLoading] = useState(false)

  const [loadBalancers, setLoadBalancers] = useState<SelectOption[]>([])
  const [isLoadBalancersLoading, setIsLoadBalancersLoading] = useState(false)

  const [connectionAttributes, setConnectionAttributes] = useState<SelectOption[]>([])
  const [isConnectionAttributesLoading, setIsConnectionAttributesLoading] = useState(false)

  const [autoScallingGroups, setAutoScallingGroups] = useState<SelectOption[]>([])
  const [isAutoScallingGroupLoading, setIsAutoScallingGroupLoading] = useState(false)

  const [vcps, setVcps] = useState<SelectOption[]>([])
  const [isVcpsLoading, setIsVcpsLoading] = useState(false)

  const [isTagsLoading, setIsTagsLoading] = useState(false)
  const [tags, setTags] = useState([])

  const [isAutoScalingGroupSelected, setIsAutoScalingGroupSelected] = useState(AutoScallingGroup.TRUE)

  const formikRef = React.useRef<FormikProps<SshWinRmAwsInfrastructureUI> | null>(null)

  false && showError('test')

  const fetchRegions = async (connectorRef: string) => {
    setIsRegionsLoading(true)
    try {
      const response = await regionsForAwsPromise({})
      if (response.status === 'SUCCESS') {
        const regionOptions = Object.entries(response.data || {}).map(regEntry => ({
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
      showError(e.message || e.responseMessage[0])
    } finally {
      setIsRegionsLoading(false)
    }
  }

  const fetchLoadBalancers = async (region: string) => {
    setIsLoadBalancersLoading(true)
    try {
      const response = await loadBalancersPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          region,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.connector.identifier', '')
        }
      })
      if (response.status === 'SUCCESS') {
        const loadBalancerOptions = Object.entries(response.data || {}).map(balancerEntry => ({
          value: balancerEntry[0],
          label: balancerEntry[1]
        }))
        setLoadBalancers(loadBalancerOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.responseMessage[0])
    } finally {
      setIsLoadBalancersLoading(false)
    }
  }

  const fetchTags = async () => {
    setIsTagsLoading(true)
    try {
      const response = await tagsPromise({})
      if (response.status === 'SUCCESS') {
        const tagOptions = Object.entries(response.data || {}).map(tagEntry => ({
          value: tagEntry[0],
          label: tagEntry[1]
        }))
        setTags(tagOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.responseMessage[0])
    } finally {
      setIsTagsLoading(false)
    }
  }

  const fetchAutoScallingGroups = async (region: string) => {
    setIsAutoScallingGroupLoading(true)
    try {
      const response = await autoScalingGroupsPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          region,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.connector.identifier', '')
        }
      })
      if (response.status === 'SUCCESS') {
        const autoScallingGroupEntryOptions = Object.entries(response.data || {}).map(autoScallingGroupEntry => ({
          value: autoScallingGroupEntry[0],
          label: autoScallingGroupEntry[1]
        }))
        setAutoScallingGroups(autoScallingGroupEntryOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.responseMessage[0])
    } finally {
      setIsAutoScallingGroupLoading(false)
    }
  }

  const fetchVcps = async (region: string) => {
    setIsVcpsLoading(true)
    try {
      const response = await vpcsPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          region,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.connector.identifier', '')
        }
      })
      if (response.status === 'SUCCESS') {
        const vcpsOptions = get(response, 'data', []).map(vcpEntry => ({
          value: get(vcpEntry, 'id', ''),
          label: get(vcpEntry, 'name', '')
        }))
        setVcps(vcpsOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.responseMessage[0])
    } finally {
      setIsVcpsLoading(false)
    }
  }

  return (
    <Layout.Vertical spacing="medium">
      <>
        <Formik<Partial<SshWinRmAwsInfrastructureUI>>
          formName="sshWinRmAWSInfra"
          initialValues={{ ...initialValues }}
          validationSchema={getValidationSchema(getString) as Partial<SshWinRmAwsInfrastructureUI>}
          validate={value => {
            const data: Partial<SshWinRmAwsInfrastructure> = {
              allowSimultaneousDeployments: value.allowSimultaneousDeployments,
              delegateSelectors: value.delegateSelectors,
              sshKey: value.sshKey
            }
            delayedOnUpdate(data)
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
                    <SSHSecretInput name={'sshKey'} label={getString('cd.steps.common.specifyCredentials')} />
                  </div>
                  <Layout.Vertical>
                    <ConnectorReferenceField
                      error={get(formik, 'errors.connectorRef', undefined)}
                      name="connectorRef"
                      type={['Aws']}
                      selected={formik.values.connectorRef}
                      label={getString('connector')}
                      width={366}
                      placeholder={getString('connectors.selectConnector')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      onChange={
                        /* istanbul ignore next */ (value, scope) => {
                          /* istanbul ignore next */
                          const connectorValue = `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`
                          formik.setFieldValue('connectorRef', {
                            label: value.name || '',
                            value: connectorValue,
                            scope: scope,
                            live: value?.status?.status === 'SUCCESS',
                            connector: value
                          })
                          fetchRegions(connectorValue)
                        }
                      }
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
                <FormInput.Select
                  name="region"
                  className={`regionId-select ${css.inputWidth}`}
                  items={regions}
                  disabled={isRegionsLoading || !formik.values.connectorRef || readonly}
                  placeholder={isRegionsLoading ? getString('loading') : getString('pipeline.regionPlaceholder')}
                  label={getString('regionLabel')}
                  onChange={
                    /* istanbul ignore next */ optionItem => {
                      if (optionItem) {
                        formik.setFieldValue('region', optionItem.value)
                        fetchLoadBalancers(optionItem.value as string)
                        fetchVcps(optionItem.value as string)
                        fetchAutoScallingGroups(optionItem.value as string)
                      }
                    }
                  }
                />
                <FormInput.Select
                  name="loadBalancer"
                  className={`loadBalancer-select ${css.inputWidth}`}
                  items={loadBalancers}
                  disabled={isLoadBalancersLoading || !formik.values.region || readonly}
                  placeholder={
                    isLoadBalancersLoading
                      ? getString('loading')
                      : getString('cd.steps.awsInfraStep.placeholders.loadBalancer')
                  }
                  label={getString('ce.co.accessPoint.loadbalancer')}
                  onChange={
                    /* istanbul ignore next */ value => {
                      if (value) {
                        fetchTags()
                      }
                    }
                  }
                />
                <Layout.Horizontal>
                  <RadioGroup
                    selectedValue={isAutoScalingGroupSelected}
                    onChange={(e: any) => {
                      setIsAutoScalingGroupSelected(e.target.value)
                    }}
                  >
                    <Radio
                      value={AutoScallingGroup.TRUE}
                      label={getString('cd.steps.awsInfraStep.labels.useAutoScallingGroup')}
                    />
                    <Radio
                      value={AutoScallingGroup.FALSE}
                      label={getString('cd.steps.awsInfraStep.labels.useAwsInstanceFilter')}
                    />
                  </RadioGroup>
                </Layout.Horizontal>
                {AutoScallingGroup.TRUE === isAutoScalingGroupSelected ? (
                  <Layout.Horizontal>
                    <FormInput.Select
                      name="autoscallinggroup"
                      className={`autoscallinggroup-select ${css.inputWidth}`}
                      items={[]}
                      disabled={isAutoScallingGroupLoading || !formik.values.loadBalancer || readonly}
                      placeholder={
                        isAutoScallingGroupLoading
                          ? getString('loading')
                          : getString('cd.steps.awsInfraStep.placeholders.autoScallingGroup')
                      }
                      label={getString('cd.steps.awsInfraStep.labels.autoScallingGroup')}
                      onChange={
                        /* istanbul ignore next */ option => {
                          if (option) {
                            formik.setFieldValue('autoscallinggroup', option.value)
                          }
                        }
                      }
                    />
                  </Layout.Horizontal>
                ) : (
                  <>
                    <Layout.Horizontal>
                      <FormInput.Select
                        name="vcp"
                        className={`vcp-select ${css.inputWidth}`}
                        items={[]}
                        disabled={isConnectionAttributesLoading || !formik.values.loadBalancer || readonly}
                        placeholder={
                          isConnectionAttributesLoading
                            ? getString('loading')
                            : getString('cd.steps.awsInfraStep.placeholders.vcp')
                        }
                        label={getString('cd.steps.awsInfraStep.labels.vcp')}
                        onChange={
                          /* istanbul ignore next */ option => {
                            if (option) {
                              formik.setFieldValue('vcp', option.value)
                            }
                          }
                        }
                      />
                    </Layout.Horizontal>
                    <Layout.Horizontal>
                      <FormInput.MultiSelect
                        name="tags"
                        label={getString('tagLabel')}
                        items={tags}
                        disabled={isTagsLoading || !formik.values.subscriptionId || readonly}
                        className={css.inputWidth}
                      />
                    </Layout.Horizontal>
                  </>
                )}
              </FormikForm>
            )
          }}
        </Formik>
      </>
    </Layout.Vertical>
  )
}

interface SshWinRmAwsInfrastructureSpecStep extends SshWinRmAwsInfrastructure {
  name?: string
  identifier?: string
}

export const ConnectorRefRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
export const SshKeyRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.sshKeyRef$/
export class SshWinRmAwsInfrastructureSpec extends PipelineStep<SshWinRmAwsInfrastructureSpecStep> {
  /* istanbul ignore next */
  protected type = StepType.SshWinRmAws
  /* istanbul ignore next */
  protected defaultValues: Partial<SshWinRmAwsInfrastructure> = {
    connectorRef: '',
    credentialsRef: ''
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
    const errors: Partial<SshWinRmAwsInfrastructureTemplate> = {}
    /* istanbul ignore else */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (isEmpty(data.credentialsRef) && isRequired) {
      errors.credentialsRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    return errors
  }

  renderStep(props: StepProps<SshWinRmAwsInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, customStepProps, readonly, allowableTypes } = props
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
