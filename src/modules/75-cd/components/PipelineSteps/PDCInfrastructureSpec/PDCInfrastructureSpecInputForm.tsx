/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, get, isEmpty, isString } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { AllowedTypes, FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, Text } from '@harness/uicore'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import ProvisionerSelectField from '@pipeline/components/Provisioner/ProvisionerSelect'
import type { HostAttributesFilter, HostFilter, HostNamesFilter, PdcInfrastructure } from 'services/cd-ng'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeTextAreaField } from '@common/components'
import MultiTypeSecretInput, {
  getMultiTypeSecretInputType
} from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { isMultiTypeRuntime, isValueRuntimeInput } from '@common/utils/utils'
import { MultiTypeMap } from '@common/components/MultiTypeMap/MultiTypeMap'
import { HostScope, parseAttributes, parseHosts, PdcInfraTemplate } from './PDCInfrastructureInterface'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PDCInfrastructureSpec.module.scss'

interface PDCInfrastructureSpecInputProps {
  initialValues: PdcInfrastructure
  allValues?: PdcInfrastructure
  onUpdate?: (data: PdcInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: PdcInfraTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: PdcInfrastructure
  allowableTypes: AllowedTypes
  path: string
  provisioner?: any[]
}

const FILTER_TYPE = {
  HostNames: 'HostNames',
  HostAttributes: 'HostAttributes'
}

export const formFilterValue = (value: string, type: string) => {
  const filters =
    getMultiTypeFromValue(value) === MultiTypeInputType.EXPRESSION
      ? value
      : type === FILTER_TYPE.HostNames
      ? parseHosts(value as string)
      : parseAttributes(value as string)
  return {
    type,
    spec: {
      value: filters
    }
  } as HostFilter
}

export const getAttributeFilters = (value: PdcInfrastructure): string => {
  const attributeValue = (value.hostFilter?.spec as HostAttributesFilter)?.value
  if (isString(attributeValue)) {
    return attributeValue
  }
  if (Object.keys(defaultTo(attributeValue, {})).length === 0) {
    return ''
  }
  return Object.entries(defaultTo(attributeValue, {}))
    .map(group => `${group[0]}:${group[1]}`)
    .join('\n')
}

export const getHostAttributes = (value: PdcInfrastructure) => {
  const attributes = value.hostAttributes || {}

  if (typeof attributes === 'string' && isValueRuntimeInput(attributes)) {
    return attributes
  }

  const hostAttributesKeyValue = Object.keys(attributes).map(key => ({
    id: uuid('', nameSpace()),
    key: key,
    value: attributes[key]
  }))

  return isEmpty(attributes) ? [{ id: uuid('', nameSpace()), value: '', key: '' }] : hostAttributesKeyValue
}

export const getHostNames = (value: PdcInfrastructure): string => {
  if (value.hostFilter?.type === 'HostAttributes') {
    return ''
  }
  const hostNameValue = defaultTo((value.hostFilter?.spec as HostNamesFilter)?.value, '')
  return isString(hostNameValue) ? hostNameValue : hostNameValue?.join('\n')
}

export const PDCInfrastructureSpecInputForm: React.FC<PDCInfrastructureSpecInputProps> = ({
  template,
  readonly,
  allowableTypes,
  initialValues,
  onUpdate,
  path,
  stepViewType,
  provisioner
}): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const formik = useFormikContext()

  const updateData = (newData: Partial<PdcInfrastructure>) => {
    const prevData = get(formik.values, path, {})
    onUpdate?.({ ...prevData, ...newData })
  }

  return (
    <Layout.Vertical
      spacing="small"
      onKeyDown={e => {
        e.key === 'Enter' && e.stopPropagation()
      }}
    >
      <>
        {getMultiTypeFromValue(template?.provisioner) === MultiTypeInputType.RUNTIME && provisioner && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <ProvisionerSelectField name={`${path}.provisioner`} path={path} provisioners={provisioner} />
          </div>
        )}
        {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.connectorRuntime)}>
            <FormMultiTypeConnectorField
              error={get(formik, 'errors.connectorRef', undefined)}
              name={`${path}.${getString('cd.connectorRefText')}`}
              label={getString('connector')}
              placeholder={getString('common.entityPlaceholderText')}
              disabled={readonly}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              type={Connectors.PDC}
              multiTypeProps={{ allowableTypes, expressions }}
              gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
              setRefValue
              className={css.runtimeWidth}
              onChange={(connector: any) => {
                const connectorRef =
                  connector?.scope && connector?.scope !== 'project'
                    ? `${connector.scope}.${connector?.record?.identifier}`
                    : connector?.record?.identifier || connector
                updateData({ connectorRef })
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.hosts) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormMultiTypeTextAreaField
              key={getString('cd.hosts')}
              name={`${path}.hosts`}
              className={css.hostsTextArea}
              label={getString('connectors.pdc.hosts')}
              multiTypeTextArea={{
                expressions,
                allowableTypes,
                configureOptionsProps: {
                  isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
                },
                customValueGetter: () => {
                  const hostsValue = get(formik.values, `${path}.hosts`, '')
                  return isString(hostsValue) ? hostsValue : hostsValue?.join('\n')
                },
                onBlur: () => {
                  const hosts = get(formik.values, `${path}.hosts`, '')
                  const parsedHosts =
                    getMultiTypeFromValue(hosts) === MultiTypeInputType.EXPRESSION ? hosts : parseHosts(hosts)
                  updateData({ hosts: parsedHosts })
                }
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.hostArrayPath) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <FormInput.MultiTextInput
              name={`${path}.hostArrayPath`}
              placeholder={getString('cd.steps.pdcStep.hostObjectPathPlaceholder')}
              multiTextInputProps={{
                allowableTypes: [MultiTypeInputType.EXPRESSION],
                expressions,
                multitypeInputValue: MultiTypeInputType.EXPRESSION
              }}
              label={getString('cd.steps.pdcStep.hostArrayPath')}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.hostAttributes) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <MultiTypeMap
              formik={formik}
              name={`${path}.hostAttributes`}
              enableConfigureOptions={false}
              valueMultiTextInputProps={{
                expressions,
                allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                  item => !isMultiTypeRuntime(item)
                ) as AllowedTypes
              }}
              multiTypeFieldSelectorProps={{
                label: <Text style={{ color: 'rgb(11, 11, 13)' }}>{getString('cd.steps.pdcStep.hostDataMapping')}</Text>
              }}
              disableValueTypeSelection
              disabled={readonly}
            />
          </div>
        )}
        {template?.hostFilter?.type === HostScope.HOST_NAME &&
          getMultiTypeFromValue(template?.hostFilter?.spec?.value) === MultiTypeInputType.RUNTIME && (
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormMultiTypeTextAreaField
                key={getString('cd.hostFilters')}
                name={`${path}.hostFilter.spec.value`}
                label={getString('cd.steps.pdcStep.specificHosts')}
                placeholder={getString('cd.steps.pdcStep.specificHostsPlaceholder')}
                className={cx(css.hostsTextArea, css.runtimeWidth)}
                tooltipProps={{
                  dataTooltipId: 'pdcSpecificHosts'
                }}
                multiTypeTextArea={{
                  expressions,
                  allowableTypes,
                  configureOptionsProps: {
                    isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
                  },
                  customValueGetter: () => getHostNames(get(formik.values, path, {})),
                  onBlur: () => {
                    const prevValues = get(formik.values, path, {})
                    const hostFilter: HostFilter = formFilterValue(
                      get(prevValues, 'hostFilter.spec.value', ''),
                      FILTER_TYPE.HostNames
                    )
                    updateData({ hostFilter })
                  }
                }}
              />
            </div>
          )}
        {template?.hostFilter?.type === HostScope.HOST_ATTRIBUTES &&
          getMultiTypeFromValue(template?.hostFilter?.spec?.value) === MultiTypeInputType.RUNTIME && (
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormMultiTypeTextAreaField
                key={getString('cd.attributeFilters')}
                name={`${path}.hostFilter.spec.value`}
                label={getString('cd.steps.pdcStep.specificAttributes')}
                placeholder={getString('cd.steps.pdcStep.attributesPlaceholder')}
                className={cx(css.hostsTextArea, css.runtimeWidth)}
                tooltipProps={{
                  dataTooltipId: 'pdcSpecificAttributes'
                }}
                multiTypeTextArea={{
                  expressions,
                  allowableTypes,
                  configureOptionsProps: {
                    isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
                  },
                  customValueGetter: () => getAttributeFilters(get(formik.values, path, {})),
                  onBlur: () => {
                    const prevValues = get(formik.values, path, {})
                    const hostFilter = formFilterValue(
                      get(prevValues, 'hostFilter.spec.value', ''),
                      FILTER_TYPE.HostAttributes
                    )
                    updateData({ hostFilter })
                  }
                }}
              />
            </div>
          )}
        {getMultiTypeFromValue(template?.credentialsRef) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <MultiTypeSecretInput
              name={`${path}.credentialsRef`}
              type={getMultiTypeSecretInputType(defaultTo(initialValues.serviceType, 'SSHKey'))}
              expressions={expressions}
              allowableTypes={allowableTypes}
              label={getString('cd.steps.common.specifyCredentials')}
              onSuccess={secret => {
                if (secret) {
                  const credentialsRef = secret.referenceString
                  updateData({ credentialsRef })
                }
              }}
              enableConfigureOptions={true}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
            />
          </div>
        )}
      </>
    </Layout.Vertical>
  )
}
