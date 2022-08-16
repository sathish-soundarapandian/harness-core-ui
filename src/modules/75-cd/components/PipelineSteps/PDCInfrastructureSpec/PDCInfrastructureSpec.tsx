/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  IconName,
  Layout,
  Label,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Button,
  ButtonSize,
  ButtonVariation,
  Table,
  Text,
  AllowedTypes
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { Column } from 'react-table'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { parse } from 'yaml'
import { useParams } from 'react-router-dom'
import { debounce, noop, set, get, isEmpty } from 'lodash-es'
import type { FormikErrors, FormikProps } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import {
  PdcInfrastructure,
  getConnectorListV2Promise,
  listSecretsV2Promise,
  useFilterHostsByConnector,
  useValidateHosts,
  HostValidationDTO,
  HostDTO,
  ConnectorResponse,
  SecretResponseWrapper
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { DelegateSelectors } from '@common/components/DelegateSelectors/DelegateSelectors'
import { FormMultiTypeTextAreaField } from '@common/components'
import MultiTypeSecretInput, {
  getMultiTypeSecretInputType
} from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { isMultiTypeRuntime } from '@common/utils/utils'
import ConnectivityStatus from './connectivityStatus/ConnectivityStatus'
import { getAttributeFilters, PDCInfrastructureSpecInputForm } from './PDCInfrastructureSpecInputForm'
import {
  getValidationSchema,
  HostScope,
  parseAttributes,
  parseHosts,
  PdcInfrastructureTemplate,
  PDCInfrastructureUI,
  PDCInfrastructureYAML,
  PreconfiguredHosts
} from './PDCInfrastructureInterface'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from './PDCInfrastructureSpec.module.scss'

const logger = loggerFor(ModuleName.CD)

const PdcType = 'Pdc'
interface PDCInfrastructureSpecEditableProps {
  initialValues: PdcInfrastructure
  allValues?: PdcInfrastructure
  onUpdate?: (data: PdcInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: PdcInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: PdcInfrastructure
  allowableTypes: AllowedTypes
}

const PDCInfrastructureSpecEditable: React.FC<PDCInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [showPreviewHostBtn, setShowPreviewHostBtn] = useState(true)
  const [formikInitialValues, setFormikInitialValues] = useState<PDCInfrastructureUI>()
  const [isPreconfiguredHosts, setIsPreconfiguredHosts] = useState(
    initialValues.connectorRef ? PreconfiguredHosts.TRUE : PreconfiguredHosts.FALSE
  )
  const [hostsScope, setHostsScope] = useState(
    initialValues.attributeFilters
      ? HostScope.HOST_ATTRIBUTES
      : initialValues.hostFilters
      ? HostScope.HOST_NAME
      : HostScope.ALL
  )

  //table states
  const [detailHosts, setDetailHosts] = useState<HostValidationDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const { mutate: getFilteredHosts } = useFilterHostsByConnector({
    queryParams: {
      pageIndex: 0,
      pageSize: 100,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: validateHosts } = useValidateHosts({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      identifier: ''
    }
  })

  useEffect(() => {
    const setInitial = async () => {
      const values = {
        ...initialValues,
        hosts: initialValues.hosts ? initialValues.hosts.join('\n') : '',
        hostFilters: initialValues.hostFilters ? initialValues.hostFilters.join('\n') : '',
        attributeFilters: getAttributeFilters(initialValues)
      }
      if (initialValues.connectorRef) {
        const multiValueType = getMultiTypeFromValue(initialValues.connectorRef)
        if (multiValueType === MultiTypeInputType.FIXED) {
          try {
            const splitedRef = initialValues.connectorRef.split('.')
            let scope = ''
            let identifier = ''
            if (splitedRef.length > 1) {
              scope = splitedRef[0]
              identifier = splitedRef[1]
            } else {
              identifier = splitedRef[0]
            }
            const queryParams = {
              accountIdentifier: accountId,
              includeAllConnectorsAvailableAtScope: true
            }
            if (!scope) {
              set(queryParams, 'orgIdentifier', orgIdentifier)
              set(queryParams, 'projectIdentifier', projectIdentifier)
            } else if (scope === 'org') {
              set(queryParams, 'orgIdentifier', orgIdentifier)
            }
            const response = await getConnectorListV2Promise({
              queryParams,
              body: { types: ['Pdc'], filterType: 'Connector' }
            })
            const connResponse = get(response, 'data.content', []).find(
              (conn: any) => conn.connector.identifier === identifier
            )
            const connectorData = {
              label: initialValues.connectorRef,
              value: `${scope ? `${scope}.` : ''}${identifier}`,
              scope: scope,
              live: connResponse?.status?.status === 'SUCCESS',
              connector: connResponse.connector
            }
            set(values, 'connectorRef', connectorData)
          } catch (e) {
            /* istanbul ignore next */
            showError(e.data?.message || e.message)
          }
        }
      }
      set(values, 'sshKey', initialValues.credentialsRef)
      setFormikInitialValues(values as PDCInfrastructureUI)
    }
    setInitial()
  }, [])

  const formikRef = React.useRef<FormikProps<PDCInfrastructureUI> | null>(null)

  const fetchHosts = async () => {
    const formikValues = get(formikRef.current, 'values', {}) as PDCInfrastructureUI
    if (isPreconfiguredHosts === PreconfiguredHosts.FALSE) {
      /* istanbul ignore next */
      return new Promise(resolve => resolve(parseHosts(formikValues.hosts)))
    }
    let filterData = {}
    if (hostsScope === HostScope.HOST_NAME) {
      filterData = { type: 'HOST_NAMES', filter: formikValues.hostFilters }
    } else if (hostsScope === HostScope.HOST_ATTRIBUTES) {
      /* istanbul ignore next */
      filterData = { type: 'HOST_ATTRIBUTES', filter: formikValues.attributeFilters }
    }
    const identifier =
      typeof formikValues.connectorRef === 'string'
        ? formikValues.connectorRef
        : get(formikValues, 'connectorRef.connector.identifier', '')
    const hostsResponse = await getFilteredHosts(filterData, { queryParams: { identifier } })
    return get(hostsResponse, 'data.content', []).map((item: HostDTO) => item.hostname)
  }

  const getHosts = () => {
    setIsLoading(true)
    setErrors([])
    const getData = async () => {
      try {
        const hosts = (await fetchHosts()) as []
        setDetailHosts(
          hosts?.map((host: string) => ({
            host,
            error: undefined
          }))
        )
      } catch (e) {
        /* istanbul ignore next */
        showError(e.data?.message || e.message)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }

  const columns: Column<HostValidationDTO>[] = [
    {
      Header: getString('cd.steps.pdcStep.no').toUpperCase(),
      accessor: 'host',
      id: 'no',
      width: '6',
      Cell: ({ row }) => row.index + 1
    },
    {
      Header: getString('pipelineSteps.hostLabel').toUpperCase(),
      accessor: 'host',
      id: 'host',
      width: '20%',
      Cell: ({ row }) => row.original.host
    },
    {
      Header: '',
      accessor: 'status',
      id: 'status',
      width: '12%',
      Cell: ({ row }) => (
        <ConnectivityStatus
          identifier={get(formikRef.current, 'values.credentialsRef', '')}
          tags={get(formikRef.current, 'values.delegateSelectors', [])}
          host={get(row.original, 'host', '')}
          status={row.original.status}
        />
      )
    },
    {
      Header: '',
      accessor: 'status',
      id: 'action',
      width: '22%',
      Cell: ({ row }) => {
        /* istanbul ignore next */
        return row.original.status === 'FAILED' ? (
          <Button
            onClick={() => testConnection(get(row.original, 'host', ''))}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.SECONDARY}
          >
            {getString('retry')}
          </Button>
        ) : null
      }
    },
    {
      Header: '',
      accessor: 'error',
      id: 'error',
      width: '40%',
      Cell: ({ row }) => (
        <Text font={{ size: 'small' }} color={Color.RED_400}>
          {get(row.original, 'error.message', '')}
        </Text>
      )
    }
  ]

  const testConnection = async (testHost?: string) => {
    setErrors([])
    try {
      const validationHosts = testHost ? [testHost] : detailHosts.map(host => get(host, 'host', ''))
      const hostResults = await validateHosts(
        {
          hosts: validationHosts,
          tags: get(formikRef, 'current.values.delegateSelectors', [])
        },
        {
          queryParams: {
            accountIdentifier: accountId,
            projectIdentifier,
            orgIdentifier,
            identifier: get(formikRef.current, 'values.credentialsRef', '')
          }
        }
      )
      if (hostResults.status === 'SUCCESS') {
        const tempMap: any = {}
        detailHosts.forEach(hostItem => {
          tempMap[get(hostItem, 'host', '')] = hostItem
        }, {})
        get(hostResults, 'data', []).forEach((hostRes: HostValidationDTO) => {
          tempMap[get(hostRes, 'host', '')] = hostRes
        })
        setDetailHosts(Object.values(tempMap) as [])
      } else {
        /* istanbul ignore next */
        setErrors(get(hostResults, 'responseMessages', []))
      }
    } catch (e: any) {
      /* istanbul ignore next */
      if (e.data?.responseMessages) {
        setErrors(e.data?.responseMessages)
      } else {
        showError(e.data?.message || e.message)
      }
    }
  }

  return (
    <Layout.Vertical spacing="medium">
      {formikInitialValues && (
        <>
          <RadioGroup
            className={css.specifyHostsRadioGroup}
            selectedValue={isPreconfiguredHosts}
            onChange={(e: any) => {
              setIsPreconfiguredHosts(e.target.value)
            }}
          >
            <Radio value={PreconfiguredHosts.FALSE} label={getString('cd.steps.pdcStep.specifyHostsOption')} />
            <Radio value={PreconfiguredHosts.TRUE} label={getString('cd.steps.pdcStep.preconfiguredHostsOption')} />
          </RadioGroup>

          <Formik<PDCInfrastructureUI>
            formName="pdcInfra"
            initialValues={formikInitialValues}
            validationSchema={getValidationSchema(getString) as Partial<PDCInfrastructureUI>}
            validate={value => {
              const data: Partial<PDCInfrastructureYAML> = {
                allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                delegateSelectors: value.delegateSelectors,
                sshKey: value.sshKey,
                credentialsRef: (value.credentialsRef || value.sshKey) as string
              }
              if (isPreconfiguredHosts === PreconfiguredHosts.FALSE) {
                data.hosts =
                  getMultiTypeFromValue(value.hosts) === MultiTypeInputType.RUNTIME
                    ? value.hosts
                    : parseHosts(value.hosts)
              } else {
                data.connectorRef = value.connectorRef
                if (hostsScope === HostScope.HOST_NAME) {
                  data.hostFilters =
                    getMultiTypeFromValue(value.hostFilters) === MultiTypeInputType.RUNTIME
                      ? value.hostFilters
                      : parseHosts(value.hostFilters || '')
                } else if (hostsScope === HostScope.HOST_ATTRIBUTES) {
                  /* istanbul ignore next */
                  data.attributeFilters =
                    getMultiTypeFromValue(value.attributeFilters) === MultiTypeInputType.RUNTIME
                      ? value.attributeFilters
                      : parseAttributes(value.attributeFilters || '')
                }
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
                    {isPreconfiguredHosts === PreconfiguredHosts.FALSE ? (
                      <FormMultiTypeTextAreaField
                        key="hosts"
                        name="hosts"
                        className={`${css.hostsTextArea} ${css.inputWidth}`}
                        label={getString('connectors.pdc.hosts')}
                        multiTypeTextArea={{
                          expressions,
                          allowableTypes
                        }}
                      />
                    ) : (
                      <Layout.Vertical>
                        <FormMultiTypeConnectorField
                          error={get(formik, 'errors.connectorRef', undefined)}
                          name="connectorRef"
                          label={getString('connector')}
                          placeholder={getString('connectors.selectConnector')}
                          disabled={readonly}
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          type={Connectors.PDC}
                          width={433}
                          selected={formik.values.connectorRef}
                          multiTypeProps={{ allowableTypes, expressions }}
                          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                          onChange={(value, _valueType, connectorRefType) => {
                            if (isMultiTypeRuntime(connectorRefType)) {
                              formikRef.current?.setFieldValue('connectorRef', value)
                            }
                          }}
                        />
                        <Layout.Vertical spacing="small">
                          <RadioGroup
                            className={css.specifyHostsRadioGroup}
                            selectedValue={hostsScope}
                            onChange={(e: any) => {
                              setHostsScope(e.target.value)
                              if (e.target.value === HostScope.ALL) {
                                formik.setFieldValue('attributeFilters', '')
                                formik.setFieldValue('hostFilters', '')
                              }
                            }}
                          >
                            <Radio value={HostScope.ALL} label={getString('cd.steps.pdcStep.includeAllHosts')} />
                            <Radio value={HostScope.HOST_NAME} label={getString('cd.steps.pdcStep.filterHostName')} />
                            <Radio
                              value={HostScope.HOST_ATTRIBUTES}
                              label={getString('cd.steps.pdcStep.filterHostAttributes')}
                            />
                          </RadioGroup>
                        </Layout.Vertical>
                        <Layout.Vertical spacing="medium">
                          {hostsScope === HostScope.HOST_NAME ? (
                            <FormMultiTypeTextAreaField
                              key="hostFilters"
                              name="hostFilters"
                              label={getString('cd.steps.pdcStep.specificHosts')}
                              placeholder={getString('cd.steps.pdcStep.specificHostsPlaceholder')}
                              className={`${css.hostsTextArea} ${css.inputWidth}`}
                              tooltipProps={{
                                dataTooltipId: 'pdcSpecificHosts'
                              }}
                              multiTypeTextArea={{
                                expressions,
                                allowableTypes
                              }}
                            />
                          ) : hostsScope === HostScope.HOST_ATTRIBUTES ? (
                            <FormMultiTypeTextAreaField
                              key="attributeFilters"
                              name="attributeFilters"
                              label={getString('cd.steps.pdcStep.specificAttributes')}
                              placeholder={getString('cd.steps.pdcStep.attributesPlaceholder')}
                              className={`${css.hostsTextArea} ${css.inputWidth}`}
                              tooltipProps={{
                                dataTooltipId: 'pdcSpecificAttributes'
                              }}
                              multiTypeTextArea={{
                                expressions,
                                allowableTypes
                              }}
                            />
                          ) : null}
                        </Layout.Vertical>
                      </Layout.Vertical>
                    )}
                    <div className={css.credRefWidth}>
                      <MultiTypeSecretInput
                        name="credentialsRef"
                        type={getMultiTypeSecretInputType(formikInitialValues.serviceType)}
                        expressions={expressions}
                        allowableTypes={allowableTypes}
                        label={getString('cd.steps.common.specifyCredentials')}
                        onSuccess={secret => {
                          if (secret) {
                            formikRef.current?.setFieldValue('credentialsRef', secret.referenceString)
                          }
                        }}
                      />
                    </div>
                    {showPreviewHostBtn ? (
                      <Button
                        onClick={() => {
                          setShowPreviewHostBtn(false)
                          getHosts()
                        }}
                        size={ButtonSize.SMALL}
                        variation={ButtonVariation.SECONDARY}
                        width={140}
                        style={{ marginTop: 0 }}
                      >
                        {getString('cd.steps.pdcStep.previewHosts')}
                      </Button>
                    ) : (
                      <Layout.Vertical>
                        <Layout.Horizontal
                          flex={{ alignItems: 'center' }}
                          margin={{ bottom: 'small' }}
                          spacing="small"
                          className={css.hostsControls}
                        >
                          <Label className={'bp3-label ' + css.previewHostsLabel}>Preview Hosts</Label>
                          <Button
                            intent="primary"
                            icon="refresh"
                            iconProps={{ size: 12, margin: { right: 8 } }}
                            onClick={() => getHosts()}
                            size={ButtonSize.SMALL}
                            variation={ButtonVariation.LINK}
                          >
                            {getString('common.refresh')}
                          </Button>
                          <Button
                            intent="none"
                            icon="main-close"
                            iconProps={{ size: 12, margin: { right: 8 } }}
                            onClick={() => setShowPreviewHostBtn(true)}
                            size={ButtonSize.SMALL}
                            variation={ButtonVariation.LINK}
                          >
                            Close preview
                          </Button>
                        </Layout.Horizontal>
                        <Layout.Horizontal
                          flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                          spacing="medium"
                          margin={{ bottom: 'small', top: 'small' }}
                        >
                          {isPreconfiguredHosts === PreconfiguredHosts.FALSE ? (
                            <div className={css.inputWidth}>
                              <Label className={'bp3-label'} style={{ marginBottom: 'small' }}>
                                {getString('delegate.DelegateSelector')}
                              </Label>
                              <DelegateSelectors
                                accountId={accountId}
                                projectIdentifier={projectIdentifier}
                                orgIdentifier={orgIdentifier}
                                onTagInputChange={delegateSelectors => {
                                  formikRef.current?.setFieldValue('delegateSelectors', delegateSelectors)
                                }}
                              />
                            </div>
                          ) : null}
                          <Button
                            onClick={() => testConnection()}
                            size={ButtonSize.SMALL}
                            variation={ButtonVariation.SECONDARY}
                            style={{ marginTop: 10 }}
                            disabled={detailHosts.length === 0 || !get(formikRef.current, 'values.credentialsRef', '')}
                          >
                            {getString('common.smtp.testConnection')}
                          </Button>
                        </Layout.Horizontal>
                        {/* istanbul ignore next */}
                        {errors.length > 0 && <ErrorHandler responseMessages={errors} />}
                        {isLoading ? (
                          <Label className={'bp3-label'} style={{ margin: 'auto' }}>
                            Loading...
                          </Label>
                        ) : detailHosts.length > 0 ? (
                          <Table columns={columns} data={detailHosts} bpTableProps={{}} />
                        ) : (
                          <Label className={'bp3-label'} style={{ margin: 'auto' }}>
                            {getString('cd.steps.pdcStep.noHosts')}
                          </Label>
                        )}
                      </Layout.Vertical>
                    )}
                  </Layout.Vertical>
                  <Layout.Vertical spacing="medium">
                    <hr />
                  </Layout.Vertical>
                  <Layout.Vertical className={css.simultaneousDeployment}>
                    <FormInput.CheckBox
                      tooltipProps={{
                        dataTooltipId: 'pdcInfraAllowSimultaneousDeployments'
                      }}
                      name={'allowSimultaneousDeployments'}
                      label={getString('cd.allowSimultaneousDeployments')}
                      disabled={readonly}
                    />
                  </Layout.Vertical>
                </FormikForm>
              )
            }}
          </Formik>
        </>
      )}
    </Layout.Vertical>
  )
}

interface PDCInfrastructureSpecEditableProps {
  initialValues: PdcInfrastructure
  allValues?: PdcInfrastructure
  onUpdate?: (data: PdcInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: PdcInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: PdcInfrastructure
  allowableTypes: AllowedTypes
}

const PDCInfrastructureSpecVariablesForm: React.FC<PDCInfrastructureSpecEditableProps> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    /* istanbul ignore next */ <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
      className={pipelineVariableCss.variablePaddingL1}
    />
  ) : null
}

interface PDCInfrastructureSpecStep extends PdcInfrastructure {
  name?: string
  identifier?: string
}

export const PdcRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
export const SshKeyRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.sshKeyRef$/
export class PDCInfrastructureSpec extends PipelineStep<PDCInfrastructureSpecStep> {
  /* istanbul ignore next */
  protected type = StepType.PDC
  /* istanbul ignore next */
  protected defaultValues: PdcInfrastructure = {
    credentialsRef: ''
  }

  /* istanbul ignore next */
  protected stepIcon: IconName = 'pdc'
  /* istanbul ignore next */
  protected stepName = 'Specify your PDC Connector'
  /* istanbul ignore next */
  protected stepPaletteVisible = false
  /* istanbul ignore next */
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(PdcRegex, this.getConnectorsListForYaml.bind(this))
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
      if (obj.type === PdcType) {
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
    template,
    getString,
    viewType
  }: ValidateInputSetProps<PdcInfrastructure>): FormikErrors<PdcInfrastructure> {
    const errors: Partial<PdcInfrastructureTemplate> = {}
    /* istanbul ignore else */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      !data.credentialsRef &&
      isRequired &&
      getMultiTypeFromValue(get(template, 'credentialsRef', undefined)) === MultiTypeInputType.RUNTIME
    ) {
      errors.credentialsRef = getString?.('fieldRequired', { field: getString('cd.credentialsRef') })
    }
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('common.validation.fieldIsRequired', { name: getString('connector') })
    }
    return errors
  }

  renderStep(props: StepProps<PdcInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, customStepProps, readonly, allowableTypes, inputSetData } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <PDCInfrastructureSpecInputForm
          {...(customStepProps as PDCInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={readonly}
          template={inputSetData?.template as PdcInfrastructureTemplate}
          allValues={inputSetData?.allValues}
          allowableTypes={allowableTypes}
          path={inputSetData?.path || ''}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <PDCInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template as PdcInfrastructureTemplate}
          {...(customStepProps as PDCInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <PDCInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as PDCInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
