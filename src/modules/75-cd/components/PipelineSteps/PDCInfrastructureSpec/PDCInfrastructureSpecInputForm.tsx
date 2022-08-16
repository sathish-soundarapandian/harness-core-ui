/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, get, isArray, isString, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { AllowedTypes, Formik, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { PdcInfrastructure } from 'services/cd-ng'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeTextAreaField } from '@common/components'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import {
  getValidationSchema,
  parseAttributes,
  parseHosts,
  PdcInfrastructureTemplate,
  PDCInfrastructureUI,
  PDCInfrastructureYAML
} from './PDCInfrastructureInterface'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PDCInfrastructureSpec.module.scss'

interface PDCInfrastructureSpecInputProps {
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

export const getAttributeFilters = (value: PdcInfrastructure): string => {
  return isString(value.attributeFilters)
    ? value.attributeFilters
    : Object.entries(defaultTo(value.attributeFilters, {}))
        .map(group => `${group[0]}:${group[1]}`)
        .join(', ')
}

export const PDCInfrastructureSpecInputForm: React.FC<PDCInfrastructureSpecInputProps & { path: string }> = ({
  template,
  readonly,
  allowableTypes,
  initialValues,
  onUpdate
}): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()

  const formikRef = React.useRef<FormikProps<PDCInfrastructureUI> | null>(null)

  const formikInitialValues: PDCInfrastructureUI = {
    attributeFilters: '',
    credentialsRef: '',
    hostFilters: '',
    hosts: '',
    connectorRef: '',
    serviceType: ''
  }

  useDeepCompareEffect(() => {
    formikRef.current?.setValues({
      ...initialValues,
      hosts: isArray(initialValues.hosts) ? initialValues.hosts.join(', ') : defaultTo(initialValues.hosts, ''),
      hostFilters: isArray(initialValues.hostFilters)
        ? initialValues.hostFilters.join(', ')
        : defaultTo(initialValues.hostFilters, ''),
      attributeFilters: getAttributeFilters(initialValues),
      serviceType: defaultTo(initialValues.serviceType, '')
    })
  }, [initialValues])

  return (
    <Layout.Vertical spacing="small">
      {formikInitialValues && (
        <Formik<PDCInfrastructureUI>
          formName="pdcInfraRuntime"
          initialValues={formikInitialValues}
          enableReinitialize={true}
          validationSchema={getValidationSchema(getString) as Partial<PDCInfrastructureYAML>}
          validate={
            /* istanbul ignore next */ value => {
              const data: Partial<PDCInfrastructureYAML> = {}
              if (getMultiTypeFromValue(template?.hosts) === MultiTypeInputType.RUNTIME) {
                data.hosts = parseHosts(value.hosts)
              }
              if (getMultiTypeFromValue(template?.hostFilters) === MultiTypeInputType.RUNTIME) {
                data.hostFilters = parseHosts(value.hostFilters || '')
              }
              if (getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME) {
                data.connectorRef = value.connectorRef
              }
              if (getMultiTypeFromValue(template?.attributeFilters) === MultiTypeInputType.RUNTIME) {
                data.attributeFilters = parseAttributes(value.attributeFilters || '')
              }
              if (getMultiTypeFromValue(template?.credentialsRef) === MultiTypeInputType.RUNTIME) {
                data.credentialsRef = (value.credentialsRef || value.sshKey || '') as string
              }
              onUpdate?.(data as PdcInfrastructure)
            }
          }
          onSubmit={noop}
        >
          {formikProps => {
            formikRef.current = formikProps
            return (
              <>
                {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <div className={cx(stepCss.formGroup, stepCss.md, css.connectorRuntime)}>
                    <FormMultiTypeConnectorField
                      error={get(formikProps, 'errors.connectorRef', undefined)}
                      name={getString('cd.connectorRefText')}
                      label={getString('connector')}
                      placeholder={getString('connectors.selectConnector')}
                      disabled={readonly}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      type={Connectors.PDC}
                      multiTypeProps={{ allowableTypes, expressions }}
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                      setRefValue
                      className={css.runtimeWidth}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(template?.hosts) === MultiTypeInputType.RUNTIME && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormMultiTypeTextAreaField
                      key={getString('cd.hosts')}
                      name={getString('cd.hosts')}
                      className={css.hostsTextArea}
                      label={getString('cd.steps.pdcStep.hostsOptional')}
                      multiTypeTextArea={{
                        expressions,
                        allowableTypes
                      }}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(template?.hostFilters) === MultiTypeInputType.RUNTIME && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormMultiTypeTextAreaField
                      key={getString('cd.hostFilters')}
                      name={getString('cd.hostFilters')}
                      label={getString('cd.steps.pdcStep.specificHostsOptional')}
                      placeholder={getString('cd.steps.pdcStep.specificHostsPlaceholder')}
                      className={cx(css.hostsTextArea, css.runtimeWidth)}
                      tooltipProps={{
                        dataTooltipId: 'pdcSpecificHosts'
                      }}
                      multiTypeTextArea={{
                        expressions,
                        allowableTypes
                      }}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(template?.attributeFilters) === MultiTypeInputType.RUNTIME && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormMultiTypeTextAreaField
                      key={getString('cd.attributeFilters')}
                      name={getString('cd.attributeFilters')}
                      label={getString('cd.steps.pdcStep.specificAttributesOptional')}
                      placeholder={getString('cd.steps.pdcStep.attributesPlaceholder')}
                      className={cx(css.hostsTextArea, css.runtimeWidth)}
                      tooltipProps={{
                        dataTooltipId: 'pdcSpecificAttributes'
                      }}
                      multiTypeTextArea={{
                        expressions,
                        allowableTypes
                      }}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(template?.credentialsRef) === MultiTypeInputType.RUNTIME && (
                  <div className={cx(stepCss.formGroup, stepCss.md, css.credRefWidth)}>
                    <MultiTypeSecretInput
                      name={getString('cd.credentialsRef')}
                      type="SSHKey"
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      label={getString('cd.steps.common.specifyCredentials')}
                    />
                  </div>
                )}
              </>
            )
          }}
        </Formik>
      )}
    </Layout.Vertical>
  )
}
