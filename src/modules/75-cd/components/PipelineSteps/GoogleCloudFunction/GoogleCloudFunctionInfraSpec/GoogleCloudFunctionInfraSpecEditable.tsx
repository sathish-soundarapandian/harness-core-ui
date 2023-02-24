/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  SelectOption,
  FormError
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { debounce, defaultTo, get, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { IItemRendererProps } from '@blueprintjs/select'

import { useGetProjects, useGetRegionsForGoogleArtifactRegistry } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { EntityReferenceResponse } from '@common/components/EntityReference/EntityReference.types'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { connectorTypes, EXPRESSION_STRING } from '@pipeline/utils/constants'
import { isFixedNonEmptyValue } from '@pipeline/utils/stageHelpers'
import { resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { getGoogleCloudFunctionInfraValidationSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { GoogleCloudFunctionInfrastructure } from './GoogleCloudFunctionInfraSpec'
import css from './GoogleCloudFunctionInfraSpec.module.scss'

export interface GoogleCloudFunctionInfraSpecEditableProps {
  initialValues: GoogleCloudFunctionInfrastructure
  onUpdate?: (data: GoogleCloudFunctionInfrastructure) => void
  readonly?: boolean
  allowableTypes: AllowedTypes
}

export const GoogleCloudFunctionInfraSpecEditable: React.FC<GoogleCloudFunctionInfraSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier = '', branch = '' } = useQueryParams<GitQueryParams>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  const [lastQueryData, setLastQueryData] = React.useState({ connectorRef: '' })

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [subscribeForm, unSubscribeForm])

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
      return !!(lastQueryData.connectorRef !== connectorRef && isFixedNonEmptyValue(connectorRef))
    },
    [lastQueryData]
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
            connectorRef
          }
        })
      }
    },
    [canFetchProjects, refetchProjects]
  )

  // Region
  const { data: regionsData } = useGetRegionsForGoogleArtifactRegistry({})
  const regions: SelectOption[] = React.useMemo(() => {
    return defaultTo(regionsData?.data, []).map(region => ({
      value: region.value as string,
      label: region.name as string
    }))
  }, [regionsData?.data])

  // Validation
  const validationSchema = getGoogleCloudFunctionInfraValidationSchema(getString)

  const getProjectHelperText = React.useCallback(
    (formik: FormikProps<GoogleCloudFunctionInfrastructure>) => {
      if (fetchProjectsError) {
        return <FormError name={`project`} errorMessage={getRBACErrorMessage(fetchProjectsError as RBACError)} />
      }
      const connectorRef = get(formik?.values, `connectorRef`)
      if (
        getMultiTypeFromValue(get(formik?.values, `project`)) === MultiTypeInputType.FIXED &&
        (getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME || connectorRef?.length === 0)
      ) {
        return getString('pipeline.projectHelperText')
      }
    },
    [fetchProjectsError]
  )

  // Item Renderer
  const itemRenderer = React.useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingProjects} />
    ),
    [loadingProjects]
  )

  return (
    <Layout.Vertical spacing="medium">
      <Formik<GoogleCloudFunctionInfrastructure>
        formName={'GoogleCloudFunctionInfraSpecEditable'}
        initialValues={initialValues}
        validate={value => {
          const data: Partial<GoogleCloudFunctionInfrastructure> = {
            connectorRef: undefined,
            project: value.project === '' ? undefined : value.project,
            region: value.region === '' ? undefined : value.region,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          if (value.connectorRef) {
            data.connectorRef = getConnectorRefValue(value.connectorRef as ConnectorRefFormValueType)
          }
          delayedOnUpdate(data)
        }}
        validationSchema={validationSchema}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('common.entityPlaceholderText')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={connectorTypes.Gcp}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  onChange={selectedConnector => {
                    if (
                      (formik.values.connectorRef as ConnectorRefFormValueType).value !==
                      (selectedConnector as unknown as EntityReferenceResponse<ConnectorReferenceDTO>)?.record
                        ?.identifier
                    ) {
                      resetFieldValue(formik, 'project')
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConnectorConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={connectorTypes.Gcp}
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                    connectorReferenceFieldProps={{
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      type: connectorTypes.Gcp,
                      label: getString('connector'),
                      disabled: readonly,
                      gitScope: { repo: repoIdentifier, branch, getDefaultFromOtherRepo: true }
                    }}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  className={css.inputWidth}
                  name="project"
                  selectItems={projectOptions}
                  useValue
                  helperText={getProjectHelperText(formik)}
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      items: projectOptions,
                      popoverClassName: css.regionPopover,
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
                        const connectorStringValue = getConnectorRefValue(
                          formik.values.connectorRef as ConnectorRefFormValueType
                        )
                        fetchProjects(connectorStringValue)
                      }
                    }
                  }}
                  label={getString('projectLabel')}
                  placeholder={getString('common.selectProject')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.project) === MultiTypeInputType.RUNTIME && !readonly && (
                  <SelectConfigureOptions
                    options={projectOptions}
                    fetchOptions={fetchProjects.bind(
                      null,
                      getConnectorRefValue(formik.values.connectorRef as ConnectorRefFormValueType)
                    )}
                    value={formik.values.project as string}
                    type="String"
                    variableName="project"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('project', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  className={css.inputWidth}
                  name="region"
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      items: regions,
                      popoverClassName: css.regionPopover,
                      allowCreatingNewItems: true
                    }
                  }}
                  label={getString('regionLabel')}
                  placeholder={getString('pipeline.regionPlaceholder')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={regions}
                    value={formik.values?.region as string}
                    type="String"
                    variableName="region"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('region', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal
                spacing="medium"
                style={{ alignItems: 'center' }}
                margin={{ top: 'medium' }}
                className={css.lastRow}
              >
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  tooltipProps={{
                    dataTooltipId: 'k8InfraAllowSimultaneousDeployments'
                  }}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
