/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Menu } from '@blueprintjs/core'
import {
  Text,
  Layout,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  SelectOption,
  Accordion,
  AllowedTypes
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { isEmpty, memoize } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import { useFormikContext } from 'formik'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import type { Failure, K8sGcpInfrastructure, K8sAwsInfrastructure } from 'services/cd-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'

import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'

import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'

import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { getConnectorSchema, getNameSpaceSchema, getReleaseNameSchema, getValue } from '../../PipelineStepsUtil'
import css from './CommonKuberetesInfraSpecEditable.module.scss'

export interface K8sGcpInfrastructureUI extends Omit<K8sGcpInfrastructure, 'cluster'> {
  cluster?: { label?: string; value?: string } | string | any
}
export interface K8sAwsInfrastructureUI extends Omit<K8sAwsInfrastructure, 'cluster'> {
  cluster?: { label?: string; value?: string } | string | any
}

export interface CommonKuberetesInfraSpecEditableProps {
  readonly?: boolean
  allowableTypes: AllowedTypes
  connectorType: 'Aws' | 'Gcp'
  clusterError: GetDataError<Failure | Error> | null
  clusterLoading: boolean
  clusterOptions: SelectOption[]
  setClusterOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>
  fetchClusters?: (connectorRef: string) => void
}

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    cluster: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ /* istanbul ignore next */ if (typeof value === 'string') {
        return Yup.string().required(getString('common.cluster'))
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({ message: getString('fieldRequired', { field: getString('common.cluster') }) })
          }
          return true
        }
      })
    }),

    namespace: getNameSpaceSchema(getString),
    releaseName: getReleaseNameSchema(getString)
  })
}

export const getClusterValue = (cluster: { label?: string; value?: string } | string | any): string => {
  return typeof cluster === 'string' ? (cluster as string) : cluster?.value
}

const connectorDependentFields = {
  Aws: 'pipelineSteps.awsConnectorLabel' as keyof StringsMap,
  Gcp: 'pipelineSteps.gcpConnectorLabel' as keyof StringsMap
}
export function CommonKuberetesInfraSpecEditable(props: CommonKuberetesInfraSpecEditableProps): React.ReactElement {
  const {
    readonly,
    allowableTypes,
    connectorType,
    clusterError,
    clusterLoading,
    clusterOptions,
    setClusterOptions,
    fetchClusters
  } = props
  const connectorTypeLowerCase = connectorType.toLowerCase()
  const formik = useFormikContext<K8sAwsInfrastructureUI | K8sGcpInfrastructureUI>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const connectorConfigureLabel = connectorDependentFields[connectorType]
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item text={item.label} disabled={clusterLoading} onClick={handleClick} />
    </div>
  ))

  return (
    <React.Fragment key={connectorType}>
      <Layout.Horizontal className={css.formRow} spacing="medium">
        <FormMultiTypeConnectorField
          name="connectorRef"
          label={getString('connector')}
          placeholder={getString('common.entityPlaceholderText')}
          disabled={readonly}
          accountIdentifier={accountId}
          tooltipProps={{
            dataTooltipId: `${connectorTypeLowerCase}InfraConnector`
          }}
          multiTypeProps={{ expressions, allowableTypes }}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={450}
          connectorLabelClass={css.connectorRef}
          enableConfigureOptions={false}
          style={{ marginBottom: 'var(--spacing-large)' }}
          type={connectorType}
          onChange={
            /* istanbul ignore next */ () => {
              if (
                getMultiTypeFromValue(formik.values.cluster) === MultiTypeInputType.FIXED &&
                formik.values.cluster?.value
              ) {
                formik.setFieldValue('cluster', '')
                setClusterOptions([])
              }
            }
          }
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConnectorConfigureOptions
            value={formik.values.connectorRef as string}
            type={
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <Icon name={getIconByType(connectorType)}></Icon>
                <Text>{getString(connectorConfigureLabel)}</Text>
              </Layout.Horizontal>
            }
            variableName="connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                formik.setFieldValue('connectorRef', value)
                formik.setFieldValue('cluster', '')
              }
            }
            isReadonly={readonly}
            className={css.marginTop}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: connectorType,
              label: getString('connector'),
              disabled: readonly,
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </Layout.Horizontal>
      <Layout.Horizontal className={css.formRow} spacing="medium">
        <FormInput.MultiTypeInput
          name="cluster"
          tooltipProps={{
            dataTooltipId: `${connectorTypeLowerCase}InfraCluster`
          }}
          className={css.inputWidth}
          selectItems={clusterOptions}
          disabled={readonly}
          placeholder={
            clusterLoading
              ? /* istanbul ignore next */ getString('loading')
              : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
          }
          multiTypeInputProps={{
            expressions,
            disabled: readonly,
            selectProps: {
              items: clusterOptions,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addClearBtn: !(clusterLoading || readonly),
              noResults: (
                <Text padding={'small'}>
                  {clusterLoading
                    ? getString('loading')
                    : getRBACErrorMessage(clusterError as RBACError) ||
                      getString('cd.pipelineSteps.infraTab.clusterError')}
                </Text>
              )
            },
            allowableTypes,
            onFocus: /* istanbul ignore next */ () => {
              const connectorValue = getValue(formik.values?.connectorRef)
              if (getMultiTypeFromValue(formik.values?.cluster) === MultiTypeInputType.FIXED) {
                fetchClusters?.(connectorValue)
              }
            }
          }}
          label={getString('common.cluster')}
        />
        {getMultiTypeFromValue(getClusterValue(formik.values.cluster)) === MultiTypeInputType.RUNTIME && !readonly && (
          <SelectConfigureOptions
            value={getClusterValue(formik.values.cluster)}
            type="String"
            variableName="cluster"
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                formik.setFieldValue('cluster', value)
              }
            }
            isReadonly={readonly}
            className={css.marginTop}
            loading={clusterLoading}
            options={clusterOptions}
          />
        )}
      </Layout.Horizontal>
      <Layout.Horizontal className={css.formRow} spacing="medium">
        <FormInput.MultiTextInput
          name="namespace"
          tooltipProps={{
            dataTooltipId: `${connectorTypeLowerCase}InfraNamespace`
          }}
          className={css.inputWidth}
          label={getString('common.namespace')}
          placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
          multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(formik.values?.namespace) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values?.namespace as string}
            type="String"
            variableName="namespace"
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                formik.setFieldValue('namespace', value)
              }
            }
            isReadonly={readonly}
            className={css.marginTop}
          />
        )}
      </Layout.Horizontal>
      <Accordion
        panelClassName={css.accordionPanel}
        detailsClassName={css.accordionDetails}
        activeId={!isEmpty(formik.errors?.releaseName) ? 'advanced' : ''}
      >
        <Accordion.Panel
          id="advanced"
          addDomId={true}
          summary={getString('common.advanced')}
          details={
            <Layout.Horizontal className={css.formRow} spacing="medium">
              <FormInput.MultiTextInput
                name="releaseName"
                tooltipProps={{
                  dataTooltipId: `${connectorTypeLowerCase}InfraReleasename`
                }}
                className={css.inputWidth}
                label={getString('common.releaseName')}
                placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
                multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(formik.values?.releaseName) === MultiTypeInputType.RUNTIME && !readonly && (
                <ConfigureOptions
                  value={formik.values?.releaseName as string}
                  type="String"
                  variableName="releaseName"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={
                    /* istanbul ignore next */ value => {
                      formik.setFieldValue('releaseName', value)
                    }
                  }
                  isReadonly={readonly}
                  className={css.marginTop}
                />
              )}
            </Layout.Horizontal>
          }
        />
      </Accordion>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }} className={css.lastRow}>
        <FormInput.CheckBox
          className={css.simultaneousDeployment}
          tooltipProps={{
            dataTooltipId: `${connectorTypeLowerCase}InfraAllowSimultaneousDeployments`
          }}
          name={'allowSimultaneousDeployments'}
          label={getString('cd.allowSimultaneousDeployments')}
          disabled={readonly}
        />
      </Layout.Horizontal>
    </React.Fragment>
  )
}
