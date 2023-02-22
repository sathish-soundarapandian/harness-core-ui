/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikProps } from 'formik'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import {
  Layout,
  AllowedTypes,
  SelectOption,
  Text,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormError
} from '@harness/uicore'

import { useGetProjects, useGetRegionsForGoogleArtifactRegistry } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import type { EntityReferenceResponse } from '@common/components/EntityReference/EntityReference.types'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { isValueRuntimeInput } from '@common/utils/utils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { connectorTypes, EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { isFixedNonEmptyValue } from '@pipeline/utils/stageHelpers'
import type { ConnectorRefFormValueType } from '@cd/utils/connectorUtils'
import type {
  GoogleCloudFunctionInfraSpecCustomStepProps,
  GoogleCloudFunctionInfrastructure
} from './GoogleCloudFunctionInfraSpec'
import { getFinalQueryParamData } from '../../K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import { DefaultParam } from '../../K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface GoogleCloudFunctionInfraSpecInputFormProps {
  initialValues: GoogleCloudFunctionInfrastructure
  allValues: GoogleCloudFunctionInfrastructure
  onUpdate?: (data: GoogleCloudFunctionInfrastructure) => void
  readonly?: boolean
  template?: GoogleCloudFunctionInfrastructure
  allowableTypes: AllowedTypes
  path: string
  formik?: FormikProps<GoogleCloudFunctionInfrastructure>
  customStepProps: GoogleCloudFunctionInfraSpecCustomStepProps
}

const GoogleCloudFunctionInfraSpecInputForm = ({
  initialValues,
  allValues,
  template,
  readonly = false,
  path,
  allowableTypes,
  formik,
  customStepProps
}: GoogleCloudFunctionInfraSpecInputFormProps) => {
  const { environmentRef, infrastructureRef } = customStepProps
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { NG_SVC_ENV_REDESIGN } = useFeatureFlags()

  const [lastQueryData, setLastQueryData] = React.useState({ connectorRef: '' })

  const initialConnectorValue = defaultTo(initialValues.connectorRef, allValues.connectorRef)

  // Project
  const {
    data: projectsData,
    refetch: refetchProjects,
    loading: loadingProjects,
    error: fetchProjectsError
  } = useMutateAsGet(useGetProjects, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: getFinalQueryParamData(isEmpty(initialConnectorValue) ? DefaultParam : initialConnectorValue),
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: true
  })

  const projectOptions: SelectOption[] = React.useMemo(() => {
    if (loadingProjects) {
      return [{ label: getString('loading'), value: getString('loading') }]
    } else if (fetchProjectsError) {
      return []
    }
    return defaultTo(projectsData?.data?.projects, []).map(project => ({
      value: project.id as string,
      label: project.name as string
    }))
  }, [projectsData?.data, loadingProjects, fetchProjectsError])

  const canFetchProjects = React.useCallback(
    (connectorRef: string): boolean => {
      if (NG_SVC_ENV_REDESIGN) {
        let shouldFetchProjects = false
        if (isValueRuntimeInput(get(template, `connectorRef`))) {
          shouldFetchProjects = !!(
            lastQueryData.connectorRef !== connectorRef && isFixedNonEmptyValue(defaultTo(connectorRef, ''))
          )
        }
        return shouldFetchProjects || isNil(projectsData?.data)
      } else {
        return !!(lastQueryData.connectorRef != connectorRef && isFixedNonEmptyValue(defaultTo(connectorRef, '')))
      }
    },
    [NG_SVC_ENV_REDESIGN, template, lastQueryData, projectsData?.data]
  )

  const fetchProjects = React.useCallback(
    (connectorRef = ''): void => {
      if (canFetchProjects(connectorRef)) {
        setLastQueryData({ connectorRef })
        refetchProjects({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: getFinalQueryParamData(isEmpty(connectorRef) ? DefaultParam : connectorRef),
            envId: environmentRef,
            infraDefinitionId: infrastructureRef
          }
        })
      }
    },
    [canFetchProjects, accountId, orgIdentifier, projectIdentifier, refetchProjects]
  )

  // Region
  const { data: regionsData, error: fetchRegionsError } = useGetRegionsForGoogleArtifactRegistry({})
  const regions: SelectOption[] = React.useMemo(() => {
    return defaultTo(regionsData?.data, []).map(region => ({
      value: region.value as string,
      label: region.name as string
    }))
  }, [regionsData?.data])

  const itemRenderer = React.useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingProjects} />
    ),
    [loadingProjects]
  )

  const connectorFieldName = isEmpty(path) ? 'connectorRef' : `${path}.connectorRef`
  const projectFieldName = isEmpty(path) ? 'project' : `${path}.project`
  const regionFieldName = isEmpty(path) ? 'region' : `${path}.region`

  const getProjectHelperText = React.useCallback(() => {
    if (fetchProjectsError) {
      return <FormError name={projectFieldName} errorMessage={getRBACErrorMessage(fetchProjectsError as RBACError)} />
    }
    const connectorRef = get(formik?.values, connectorFieldName)
    if (
      getMultiTypeFromValue(get(formik?.values, projectFieldName)) === MultiTypeInputType.FIXED &&
      (getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME || connectorRef?.length === 0)
    ) {
      return getString('pipeline.projectHelperText')
    }
  }, [path, formik?.values, fetchProjectsError])

  return (
    <Layout.Vertical spacing="small">
      {isValueRuntimeInput(template?.connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={connectorFieldName}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('common.entityPlaceholderText')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorTypes.Gcp}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            onChange={selectedConnector => {
              if (
                formik &&
                (get(formik?.values, connectorFieldName) as ConnectorRefFormValueType).value !==
                  (selectedConnector as unknown as EntityReferenceResponse<ConnectorReferenceDTO>)?.record?.identifier
              ) {
                resetFieldValue(formik, projectFieldName)
              }
            }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: get(template, `connectorRef`)
            }}
          />
        </div>
      )}

      {isValueRuntimeInput(template?.project) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md)}
          name={projectFieldName}
          label={getString('projectLabel')}
          placeholder={getString('common.selectProject')}
          disabled={readonly}
          selectItems={projectOptions}
          useValue
          helperText={getProjectHelperText()}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              items: projectOptions,
              popoverClassName: cx(stepCss.formGroup, stepCss.md),
              allowCreatingNewItems: true,
              itemRenderer,
              noResults: (
                <Text lineClamp={1} width={500} height={35} padding="small">
                  {getString('noProjects')}
                </Text>
              )
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!loadingProjects) {
                fetchProjects(initialConnectorValue)
              }
            }
          }}
          fieldPath={'project'}
          template={template}
        />
      )}

      {isValueRuntimeInput(template?.region) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md)}
          name={regionFieldName}
          label={getString('regionLabel')}
          placeholder={getString('pipeline.regionPlaceholder')}
          disabled={readonly}
          selectItems={regions}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              items: regions,
              popoverClassName: cx(stepCss.formGroup, stepCss.md),
              allowCreatingNewItems: true,
              itemRenderer,
              noResults: (
                <Text lineClamp={1} width={500} height={35} padding="small">
                  {getRBACErrorMessage(fetchRegionsError as RBACError) || getString('pipeline.noRegions')}
                </Text>
              )
            }
          }}
          fieldPath={'region'}
          template={template}
        />
      )}
    </Layout.Vertical>
  )
}

export const GoogleCloudFunctionInfraSpecInputSetMode = connect(GoogleCloudFunctionInfraSpecInputForm)
