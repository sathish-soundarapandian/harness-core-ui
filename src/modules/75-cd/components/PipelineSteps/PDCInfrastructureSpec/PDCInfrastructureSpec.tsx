/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, FormEvent, useMemo } from 'react'
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
  AllowedTypes,
  Checkbox
} from '@harness/uicore'
import type { ObjectSchema } from 'yup'
import type { Column } from 'react-table'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { parse } from 'yaml'
import { useParams } from 'react-router-dom'
import { debounce, noop, set, get, isEmpty, defaultTo, isString, isArray } from 'lodash-es'
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
  SecretResponseWrapper,
  HostAttributesFilter,
  HostNamesFilter,
  ErrorDetail
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
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import ConnectivityStatus from './connectivityStatus/ConnectivityStatus'
import { getAttributeFilters, getHostNames, PDCInfrastructureSpecInputForm } from './PDCInfrastructureSpecInputForm'
import {
  getValidationSchemaAll,
  getValidationSchemaNoPreconfiguredHosts,
  getValidationSchemaHostFilters,
  getValidationSchemaAttributeFilters,
  HostScope,
  parseAttributes,
  parseHosts,
  PDCInfrastructureUI,
  PDCInfrastructureYAML,
  PreconfiguredHosts,
  PdcInfraTemplate
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
  template?: PdcInfraTemplate
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
    initialValues.hosts ? PreconfiguredHosts.FALSE : PreconfiguredHosts.TRUE
  )
  const [hostsScope, setHostsScope] = useState(defaultTo(initialValues.hostFilter?.type, 'All'))

  //table states
  const [detailHosts, setDetailHosts] = useState<HostValidationDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [hostsToTest, setHostsToTest] = useState<any[]>([])

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
        hosts: isArray(initialValues.hosts) ? initialValues.hosts.join(', ') : defaultTo(initialValues.hosts, ''),
        hostFilters: getHostNames(initialValues),
        attributeFilters: getAttributeFilters(initialValues)
      }
      set(values, 'sshKey', initialValues.credentialsRef)
      setFormikInitialValues(values as PDCInfrastructureUI)
    }
    setInitial()
  }, [])

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [subscribeForm, unSubscribeForm])

  useEffect(() => {
    const data: Partial<PDCInfrastructureYAML> = {}
    if (isPreconfiguredHosts === PreconfiguredHosts.TRUE) {
      data.hosts = undefined
      data.connectorRef = get(initialValues, 'connectorRef', '')
    } else {
      data.hosts = get(initialValues, 'hosts', '')
      data.connectorRef = undefined
    }
    data.hostFilter = {
      type: 'All',
      spec: {} //todoremoveempty
    }
    formikRef.current?.setValues({ ...initialValues, ...data })
  }, [isPreconfiguredHosts])

  useEffect(() => {
    const data: Partial<PDCInfrastructureYAML> = {}
    if (hostsScope === HostScope.ALL) {
      data.hostFilter = {
        type: hostsScope,
        spec: {} //todoremoveempty
      }
    } else if (hostsScope === HostScope.HOST_ATTRIBUTES) {
      data.hostFilter = {
        type: hostsScope,
        spec: {
          value:
            getMultiTypeFromValue(getAttributeFilters(initialValues)) === MultiTypeInputType.FIXED
              ? parseAttributes(getAttributeFilters(initialValues))
              : getAttributeFilters(initialValues)
        } as HostAttributesFilter
      }
    } else {
      data.hostFilter = {
        type: hostsScope,
        spec: {
          value:
            getMultiTypeFromValue(getHostNames(initialValues)) === MultiTypeInputType.FIXED
              ? parseHosts(getHostNames(initialValues))
              : getHostNames(initialValues)
        } as HostNamesFilter
      }
    }
    formikRef.current?.setValues({ ...initialValues, ...data })
  }, [hostsScope])

  const fetchHosts = async () => {
    const formikValues = get(formikRef.current, 'values', {}) as PDCInfrastructureUI
    if (isPreconfiguredHosts === PreconfiguredHosts.FALSE) {
      /* istanbul ignore next */
      return new Promise(resolve => resolve(parseHosts(formikValues.hosts)))
    }
    let filterData = {}
    if (hostsScope === HostScope.HOST_NAME) {
      filterData = { type: HostScope.HOST_NAME, filter: formikValues.hostFilters }
    } else if (hostsScope === HostScope.HOST_ATTRIBUTES) {
      /* istanbul ignore next */
      filterData = { type: HostScope.HOST_ATTRIBUTES, filter: formikValues.attributeFilters }
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
    setHostsToTest([])
    const getData = async () => {
      try {
        const hosts = (await fetchHosts()) as []
        setDetailHosts(
          hosts?.map((host: string) => ({
            host,
            parsedHost: host.split(':')[0],
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

  const onCheckboxSelect = (event: FormEvent<HTMLInputElement>, item: HostValidationDTO) => {
    const identifier = item.host
    if ((event.target as any).checked && identifier) {
      setHostsToTest([...defaultTo(hostsToTest, []), item])
    } else {
      setHostsToTest([...hostsToTest.filter((selectedHost: HostValidationDTO) => selectedHost.host !== identifier)])
    }
  }

  const columns: Column<HostValidationDTO>[] = useMemo(
    () => [
      {
        Header: getString('cd.steps.pdcStep.no').toUpperCase(),
        accessor: 'host',
        id: 'no',
        width: '6',
        Cell: ({ row }) => row.index + 1
      },
      {
        Header: getString('common.hostLabel').toUpperCase(),
        accessor: 'host',
        id: 'host',
        width: '40%',
        Cell: ({ row }) => row.original.host
      },
      {
        Header: '',
        accessor: 'status',
        id: 'status',
        width: '20%',
        Cell: ({ row }) => (
          <ConnectivityStatus
            identifier={get(formikRef.current, 'values.credentialsRef', '')}
            tags={get(formikRef.current, 'values.delegateSelectors', [])}
            error={row.original.error as ErrorDetail}
            host={get(row.original, 'host', '')}
            status={row.original.status}
            resetError={(status: string) => {
              set(row.original, 'status', defaultTo(status, 'UNKNOWN'))
              if (!isEmpty(errors)) {
                setErrors([])
              }
            }}
          />
        )
      },
      {
        Header: (
          <Checkbox
            data-testid={'selectAll'}
            onClick={(event: FormEvent<HTMLInputElement>) => {
              if ((event.target as any).checked) {
                setHostsToTest(detailHosts)
              } else {
                setHostsToTest([])
              }
            }}
          />
        ),
        id: 'selectHosts',
        width: '20%',
        Cell: ({ row, column }: any) => (
          <Checkbox
            data-testid={`select-host-${get(row, 'original.host', '')}`}
            onClick={event => column.onCheckboxSelect(event, get(row, 'original', ''))}
            checked={column.hostsToTest.some(
              (selectedHost: HostValidationDTO) => selectedHost?.host === get(row, 'original.host', '')
            )}
          />
        ),
        onCheckboxSelect,
        hostsToTest
      },
      {
        Header: (
          <Button
            onClick={() => testConnection()}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.SECONDARY}
            disabled={hostsToTest.length === 0 || !get(formikRef, 'current.values.credentialsRef', '')}
          >
            {getString('common.smtp.testConnection')}
          </Button>
        ),
        id: 'testConnection',
        width: '20%'
      }
    ],
    [getString]
  )

  const testConnection = async () => {
    setErrors([])
    try {
      const hostResults = await validateHosts(
        {
          hosts: hostsToTest.map(host => get(host, 'host', '')),
          tags: get(formikRef, 'current.values.delegateSelectors', [])
        },
        {
          queryParams: {
            accountIdentifier: accountId,
            projectIdentifier,
            orgIdentifier,
            identifier: get(formikRef, 'current.values.credentialsRef', '')
          }
        }
      )
      if (hostResults.status === 'SUCCESS') {
        const tempMap: any = {}
        detailHosts.forEach(hostItem => {
          tempMap[get(hostItem, 'parsedHost', '')] = hostItem
        }, {})

        get(hostResults, 'data', []).forEach((hostRes: HostValidationDTO) => {
          tempMap[get(hostRes, 'host', '')] = {
            ...hostRes,
            host: tempMap[get(hostRes, 'host', '')].host
          }
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

  const isPreviewDisable = (value: PDCInfrastructureUI): boolean => {
    if (isEmpty(value)) return false
    if (getMultiTypeFromValue(value.credentialsRef) !== MultiTypeInputType.FIXED) return true
    if (isPreconfiguredHosts === PreconfiguredHosts.FALSE) {
      return isString(value.hosts) && getMultiTypeFromValue(value.hosts) !== MultiTypeInputType.FIXED
    } else {
      let returnBool = getMultiTypeFromValue(value.connectorRef) !== MultiTypeInputType.FIXED
      if (hostsScope === HostScope.HOST_NAME) {
        returnBool =
          returnBool ||
          (isString(value.hostFilters) && getMultiTypeFromValue(value.hostFilters) !== MultiTypeInputType.FIXED)
      } else if (hostsScope === HostScope.HOST_ATTRIBUTES) {
        returnBool =
          returnBool ||
          (isString(value.attributeFilters) &&
            getMultiTypeFromValue(value.attributeFilters) !== MultiTypeInputType.FIXED)
      }
      return returnBool
    }
  }

  const getValidations = (isPreconfigured: string, hostScope: string): ObjectSchema<object | undefined> => {
    let validationSchema = getValidationSchemaNoPreconfiguredHosts(getString)
    if (isPreconfigured === PreconfiguredHosts.TRUE) {
      if (hostScope === HostScope.HOST_NAME) {
        validationSchema = getValidationSchemaHostFilters(getString)
      } else if (hostScope === HostScope.HOST_ATTRIBUTES) {
        validationSchema = getValidationSchemaAttributeFilters(getString)
      } else {
        validationSchema = getValidationSchemaAll(getString)
      }
    }
    return validationSchema
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
              setShowPreviewHostBtn(true)
            }}
          >
            <Radio value={PreconfiguredHosts.FALSE} label={getString('cd.steps.pdcStep.specifyHostsOption')} />
            <Radio value={PreconfiguredHosts.TRUE} label={getString('cd.steps.pdcStep.preconfiguredHostsOption')} />
          </RadioGroup>

          <Formik<PDCInfrastructureUI>
            formName="pdcInfra"
            initialValues={formikInitialValues}
            validationSchema={getValidations(isPreconfiguredHosts, hostsScope)}
            validate={value => {
              const data: Partial<PDCInfrastructureYAML> = {
                allowSimultaneousDeployments: value.allowSimultaneousDeployments,
                delegateSelectors: value.delegateSelectors,
                sshKey: value.sshKey,
                credentialsRef: (value.credentialsRef || value.sshKey) as string
              }
              if (isPreconfiguredHosts === PreconfiguredHosts.FALSE) {
                data.hosts =
                  getMultiTypeFromValue(value.hosts) === MultiTypeInputType.FIXED
                    ? parseHosts(value.hosts)
                    : value.hosts
                data.hostFilter = {
                  type: 'All',
                  spec: {} //todoremoveempty
                }
              } else {
                data.connectorRef = value.connectorRef
                data.hostFilter = {
                  type: hostsScope as 'All' | 'HostNames' | 'HostAttributes',
                  spec:
                    hostsScope !== HostScope.ALL
                      ? ({
                          value:
                            hostsScope === HostScope.HOST_NAME
                              ? getMultiTypeFromValue(value.hostFilters) === MultiTypeInputType.FIXED
                                ? parseHosts(value.hostFilters || '')
                                : value.hostFilters
                              : getMultiTypeFromValue(value.attributeFilters) === MultiTypeInputType.FIXED
                              ? parseAttributes(value.attributeFilters || '')
                              : value.attributeFilters
                        } as HostNamesFilter | HostAttributesFilter)
                      : {} //todoremoveempty
                }
              }
              delayedOnUpdate(data)
            }}
            onSubmit={noop}
          >
            {formik => {
              window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
              formikRef.current = formik as FormikProps<unknown> | null
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
                          setRefValue
                          multiTypeProps={{ allowableTypes, expressions }}
                          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                          onChange={(value, _valueType, connectorRefType) => {
                            if (isMultiTypeRuntime(connectorRefType)) {
                              formikRef.current?.setFieldValue('connectorRef', value)
                            }
                            setShowPreviewHostBtn(true)
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
                        type={getMultiTypeSecretInputType(defaultTo(formikInitialValues.serviceType, 'SSHKey'))}
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
                        disabled={isPreviewDisable(formik.values)}
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
  template?: PdcInfraTemplate
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
    credentialsRef: '',
    hostFilter: {
      type: 'All',
      spec: {} //todoremoveempty
    }
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
    const errors: Partial<PdcInfraTemplate> = {}
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
    if (isEmpty(data.hosts) && isRequired && getMultiTypeFromValue(template?.hosts) === MultiTypeInputType.RUNTIME) {
      errors.hosts = getString?.('common.validation.fieldIsRequired', { name: getString('cd.hosts') })
    }
    if (
      data.hostFilter?.type === HostScope.HOST_NAME &&
      isEmpty((data.hostFilter.spec as HostNamesFilter)?.value) &&
      isRequired &&
      getMultiTypeFromValue((template?.hostFilter?.spec as HostNamesFilter)?.value) === MultiTypeInputType.RUNTIME
    ) {
      errors.hostFilters = getString?.('common.validation.fieldIsRequired', { name: getString('cd.hostFilters') })
    }
    if (
      data.hostFilter?.type === HostScope.HOST_ATTRIBUTES &&
      isEmpty((data.hostFilter.spec as HostAttributesFilter)?.value) &&
      isRequired &&
      getMultiTypeFromValue((template?.hostFilter?.spec as HostAttributesFilter)?.value as any) ===
        MultiTypeInputType.RUNTIME
    ) {
      errors.attributeFilters = getString?.('common.validation.fieldIsRequired', {
        name: getString('cd.attributeFilters')
      })
    }
    return errors as any
  }

  renderStep(props: StepProps<PdcInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, customStepProps, readonly, allowableTypes, inputSetData } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <PDCInfrastructureSpecInputForm
          {...(customStepProps as PDCInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={readonly}
          template={inputSetData?.template as PdcInfraTemplate}
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
          template={inputSetData?.template as PdcInfraTemplate}
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
