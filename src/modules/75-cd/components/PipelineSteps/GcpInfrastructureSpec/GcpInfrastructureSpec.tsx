/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  IconName,
  Layout,
  Formik,
  FormikForm,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  AllowedTypes
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get, set, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import {
  getConnectorListV2Promise,
  K8sGcpInfrastructure,
  useGetClusterNamesForGcp,
  getClusterNamesForGcpPromise,
  useGetClusterNamesForGcpInfra,
  ExecutionElementConfig
} from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { Connectors } from '@connectors/constants'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { getNameSpaceSchema, getReleaseNameSchema } from '../PipelineStepsUtil'
import {
  CommonKuberetesInfraSpecEditable,
  getValidationSchema,
  getClusterValue,
  K8sGcpInfrastructureUI
} from '../Common/CommonKuberetesInfraSpec/CommonKuberetesInfraSpecEditable'
import {
  CommonKuberetesInfraInputForm,
  K8sGcpInfrastructureTemplate
} from '../Common/CommonKuberetesInfraSpec/CommonKuberetesInfraInputForm'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

const logger = loggerFor(ModuleName.CD)

interface GcpInfrastructureSpecEditableProps {
  initialValues: K8sGcpInfrastructure
  allValues?: K8sGcpInfrastructure
  onUpdate?: (data: K8sGcpInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: K8sGcpInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sGcpInfrastructure
  allowableTypes: AllowedTypes
  provisioner?: ExecutionElementConfig['steps']
}

const GcpInfrastructureSpecEditable: React.FC<GcpInfrastructureSpecEditableProps> = ({
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
  const [clusterOptions, setClusterOptions] = useState<SelectOption[]>([])
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { getString } = useStrings()

  const {
    data: clusterNamesData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames,
    error: clusterError
  } = useGetClusterNamesForGcp({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options =
      clusterNamesData?.data?.clusterNames?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setClusterOptions(options)
  }, [clusterNamesData])

  useEffect(() => {
    if (
      initialValues.connectorRef &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(initialValues.cluster) === MultiTypeInputType.FIXED
    ) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef])

  const getInitialValues = (): K8sGcpInfrastructureUI => {
    const values: K8sGcpInfrastructureUI = {
      ...initialValues
    }

    if (getMultiTypeFromValue(initialValues.cluster) === MultiTypeInputType.FIXED) {
      values.cluster = { label: initialValues.cluster, value: initialValues.cluster }
    }

    return values
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<K8sGcpInfrastructureUI>
        formName="gcpInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<K8sGcpInfrastructure> = {
            namespace: value.namespace === '' ? undefined : value.namespace,
            releaseName: value.releaseName === '' ? undefined : value.releaseName,
            connectorRef: undefined,
            cluster: getClusterValue(value.cluster) === '' ? undefined : getClusterValue(value.cluster),
            allowSimultaneousDeployments: value.allowSimultaneousDeployments,
            provisioner: value?.provisioner || undefined
          }
          /* istanbul ignore else */ if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || /* istanbul ignore next */ value.connectorRef
          }
          delayedOnUpdate(data)
        }}
        validationSchema={getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          return (
            <FormikForm>
              <CommonKuberetesInfraSpecEditable
                readonly={readonly}
                allowableTypes={allowableTypes}
                connectorType={Connectors.GCP as any}
                clusterError={clusterError}
                clusterLoading={loadingClusterNames}
                clusterOptions={clusterOptions}
                setClusterOptions={setClusterOptions}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

const GcpInfrastructureSpecInputForm: React.FC<GcpInfrastructureSpecEditableProps & { path: string }> = ({
  template,
  initialValues,
  readonly = false,
  path,
  onUpdate,
  allowableTypes,
  allValues,
  stepViewType,
  provisioner
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const [clusterOptions, setClusterOptions] = useState<SelectOption[]>([])

  const connectorRef = useMemo(
    () => defaultTo(initialValues.connectorRef, allValues?.connectorRef),
    [initialValues.connectorRef, allValues?.connectorRef]
  )

  const environmentRef = useMemo(
    () => defaultTo(initialValues.environmentRef, allValues?.environmentRef),
    [initialValues.environmentRef, allValues?.environmentRef]
  )

  const infrastructureRef = useMemo(
    () => defaultTo(initialValues.infrastructureRef, allValues?.infrastructureRef),
    [initialValues.infrastructureRef, allValues?.infrastructureRef]
  )

  const {
    data: clusterNamesData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames,
    error: clusterError
  } = useGetClusterNamesForGcp({
    lazy: true,
    debounce: 300
  })

  const {
    data: clusterNamesForInfraData,
    refetch: refetchClusterNamesForInfra,
    loading: loadingClusterNamesForInfra,
    error: clustersForInfraError
  } = useGetClusterNamesForGcpInfra({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options = defaultTo(
      clusterNamesData,
      (!connectorRef && clusterNamesForInfraData) || {}
    )?.data?.clusterNames?.map(name => ({
      label: name,
      value: name
    }))
    setClusterOptions(defaultTo(options, []))
  }, [clusterNamesData, clusterNamesForInfraData, connectorRef])

  useEffect(() => {
    if (connectorRef && getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef
        }
      })

      // reset cluster on connectorRef change
      if (
        getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME &&
        getMultiTypeFromValue(initialValues?.cluster) !== MultiTypeInputType.RUNTIME
      ) {
        set(initialValues, 'cluster', '')
        onUpdate?.(initialValues)
      }
    } else if (
      getMultiTypeFromValue(connectorRef) !== MultiTypeInputType.RUNTIME &&
      environmentRef &&
      getMultiTypeFromValue(environmentRef) === MultiTypeInputType.FIXED &&
      infrastructureRef &&
      getMultiTypeFromValue(infrastructureRef) === MultiTypeInputType.FIXED
    ) {
      refetchClusterNamesForInfra({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef
        }
      })

      // reset cluster on connectorRef change
      if (
        getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME &&
        getMultiTypeFromValue(initialValues?.cluster) !== MultiTypeInputType.RUNTIME
      ) {
        set(initialValues, 'cluster', '')
        onUpdate?.(initialValues)
      }
    } else {
      setClusterOptions([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorRef, environmentRef, infrastructureRef])

  const fetchClusterNames = (connectorRefValue = ''): void => {
    if (connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: connectorRefValue
        }
      })
    }
  }

  return (
    <CommonKuberetesInfraInputForm
      template={template}
      allowableTypes={allowableTypes}
      clusterError={clusterError || clustersForInfraError}
      clusterLoading={loadingClusterNames || loadingClusterNamesForInfra}
      clusterOptions={clusterOptions}
      setClusterOptions={setClusterOptions}
      path={path}
      readonly={readonly}
      stepViewType={stepViewType}
      fetchClusters={fetchClusterNames}
      connectorType={'Gcp'}
      provisioner={provisioner}
    />
  )
}

const GcpInfrastructureSpecVariablesForm: React.FC<GcpInfrastructureSpecEditableProps> = ({
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

interface GcpInfrastructureSpecStep extends K8sGcpInfrastructure {
  name?: string
  identifier?: string
}

const KubernetesGcpConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const KubernetesGcpClusterRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.cluster$/
const KubernetesGcpType = 'KubernetesGcp'
export class GcpInfrastructureSpec extends PipelineStep<GcpInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.KubernetesGcp
  protected defaultValues: K8sGcpInfrastructure = { cluster: '', connectorRef: '', namespace: '', releaseName: '' }

  protected stepIcon: IconName = 'service-gcp'
  protected stepName = 'Specify your GCP Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(KubernetesGcpConnectorRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(KubernetesGcpClusterRegex, this.getClusterListForYaml.bind(this))

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
      /* istanbul ignore next */ logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj?.type === KubernetesGcpType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Gcp'], filterType: 'Connector' }
        }).then(response => {
          const data =
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  protected getClusterListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      /* istanbul ignore next */ logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.cluster', ''))
      if (
        obj?.type === KubernetesGcpType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED
      ) {
        return getClusterNamesForGcpPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          }
        }).then(response => {
          const data =
            response?.data?.clusterNames?.map(clusterName => ({
              label: clusterName,
              insertText: clusterName,
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
          return data
        })
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
  }: ValidateInputSetProps<K8sGcpInfrastructure>): FormikErrors<K8sGcpInfrastructure> {
    const errors: Partial<K8sGcpInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (
      isEmpty(data.cluster) &&
      isRequired &&
      getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME
    ) {
      errors.cluster = getString?.('fieldRequired', { field: getString('common.cluster') })
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME
    ) {
      const namespace = Yup.object().shape({
        namespace: getNameSpaceSchema(getString, isRequired)
      })

      try {
        namespace.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME
    ) {
      const releaseName = Yup.object().shape({
        releaseName: getReleaseNameSchema(getString, isRequired)
      })

      try {
        releaseName.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    return errors
  }

  renderStep(props: StepProps<K8sGcpInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <GcpInfrastructureSpecInputForm
          {...(customStepProps as GcpInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <GcpInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as GcpInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <GcpInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as GcpInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
