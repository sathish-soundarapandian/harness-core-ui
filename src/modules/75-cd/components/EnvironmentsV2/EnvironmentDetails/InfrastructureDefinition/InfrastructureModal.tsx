/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, merge, noop, omit, set } from 'lodash-es'
import type { FormikProps } from 'formik'
import { parse } from 'yaml'
import produce from 'immer'
import * as Yup from 'yup'

import {
  Button,
  ButtonVariation,
  Card,
  Container,
  Formik,
  getErrorInfoFromErrorObject,
  Layout,
  Tag,
  useToaster,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import {
  CustomDeploymentInfraNGVariable,
  DeploymentStageConfig,
  InfrastructureConfig,
  InfrastructureDefinitionConfig,
  InfrastructureResponseDTO,
  useCreateInfrastructure,
  useGetYamlSchema,
  useUpdateInfrastructure
} from 'services/cd-ng'

import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import { NameIdDescriptionTags } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'

import { DefaultPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ServiceDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import type { PipelineInfoConfig, StageElementConfig, TemplateLinkConfig } from 'services/pipeline-ng'

import DeployInfraDefinition from '@cd/components/PipelineStudio/DeployInfraSpecifications/DeployInfraDefinition/DeployInfraDefinition'
import { DefaultNewStageId, DefaultNewStageName } from '@cd/components/Services/utils/ServiceUtils'
import SelectDeploymentType from '@cd/components/PipelineStudio/DeployServiceSpecifications/SelectDeploymentType'
import { InfrastructurePipelineProvider } from '@cd/context/InfrastructurePipelineContext'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { DeployStageErrorProvider, StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { getTemplateRefVersionLabelObject } from '@pipeline/utils/templateUtils'
import { useDeepCompareEffect } from '@common/hooks'
import css from './InfrastructureDefinition.module.scss'

interface CustomDeploymentMetaData {
  templateMetaData: TemplateLinkConfig
  variables: Array<CustomDeploymentInfraNGVariable>
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `infrastructureDefinition.yaml`,
  entityType: 'Infrastructure',
  width: '100%',
  height: 540,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export default function InfrastructureModal({
  hideModal,
  refetch,
  selectedInfrastructure,
  environmentIdentifier,
  stageDeploymentType,
  stageCustomDeploymentData,
  getTemplate
}: {
  hideModal: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: any
  selectedInfrastructure?: string
  environmentIdentifier: string
  stageDeploymentType?: ServiceDeploymentType
  stageCustomDeploymentData?: TemplateLinkConfig
  getTemplate?: (data: GetTemplateProps) => Promise<GetTemplateResponse>
}): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const infrastructureDefinition = useMemo(() => {
    const infrastructureDefinitionObj = defaultTo(
      (parse(defaultTo(selectedInfrastructure, '{}')) as InfrastructureConfig)?.infrastructureDefinition,
      {}
    )
    return produce(infrastructureDefinitionObj as InfrastructureDefinitionConfig, draft => {
      if (stageDeploymentType === ServiceDeploymentType.CustomDeployment && !isEmpty(stageCustomDeploymentData)) {
        set(draft, 'spec.customDeploymentRef', stageCustomDeploymentData)
      }
    })
  }, [selectedInfrastructure, stageDeploymentType, stageCustomDeploymentData])

  const { type, spec, allowSimultaneousDeployments, deploymentType } = defaultTo(
    infrastructureDefinition,
    {}
  ) as InfrastructureDefinitionConfig

  const pipeline = React.useMemo(
    () =>
      produce({ ...DefaultPipeline }, draft => {
        set(
          draft,
          'stages[0].stage',
          merge({}, {} as DeploymentStageElementConfig, {
            name: DefaultNewStageName,
            identifier: DefaultNewStageId,
            type: StageType.DEPLOY,
            spec: {
              infrastructure: {
                infrastructureDefinition: {
                  ...(Boolean(type) && { type }),
                  ...(Boolean(spec) && { spec })
                },
                allowSimultaneousDeployments: Boolean(allowSimultaneousDeployments)
              },
              serviceConfig: {
                serviceDefinition: {
                  type: deploymentType
                }
              }
            }
          })
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <InfrastructurePipelineProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
      initialValue={pipeline as PipelineInfoConfig}
      isReadOnly={false}
    >
      <PipelineVariablesContextProvider pipeline={pipeline}>
        <DeployStageErrorProvider>
          <BootstrapDeployInfraDefinition
            hideModal={hideModal}
            refetch={refetch}
            infrastructureDefinition={infrastructureDefinition}
            environmentIdentifier={environmentIdentifier}
            stageDeploymentType={(deploymentType as Partial<ServiceDeploymentType>) || stageDeploymentType}
            getTemplate={getTemplate}
          />
        </DeployStageErrorProvider>
      </PipelineVariablesContextProvider>
    </InfrastructurePipelineProvider>
  )
}

function BootstrapDeployInfraDefinition({
  hideModal,
  refetch,
  infrastructureDefinition,
  environmentIdentifier,
  stageDeploymentType,
  getTemplate
}: {
  hideModal: () => void
  refetch: (infrastructure?: InfrastructureResponseDTO) => void
  infrastructureDefinition?: InfrastructureDefinitionConfig
  environmentIdentifier: string
  stageDeploymentType?: ServiceDeploymentType
  getTemplate?: (data: GetTemplateProps) => Promise<GetTemplateResponse>
}): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    setSelection,
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const { checkErrorsForTab } = useContext(StageErrorContext)

  const { name, identifier, description, tags } = defaultTo(
    infrastructureDefinition,
    {}
  ) as InfrastructureDefinitionConfig

  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [isSavingInfrastructure, setIsSavingInfrastructure] = useState(false)
  const [selectedDeploymentType, setSelectedDeploymentType] = useState<ServiceDeploymentType | undefined>()
  const [isYamlEditable, setIsYamlEditable] = useState(false)
  const [formValues, setFormValues] = useState({
    name,
    identifier,
    description,
    tags
  })
  const formikRef = useRef<FormikProps<Partial<InfrastructureDefinitionConfig>>>()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const getDeploymentTemplateData = useCallback((): CustomDeploymentMetaData => {
    const variables = get(stage, 'stage.spec.infrastructure.infrastructureDefinition.spec.variables')
    return {
      templateMetaData: get(stage, 'stage.spec.infrastructure.infrastructureDefinition.spec.customDeploymentRef'),
      ...(variables && variables)
    }
  }, [stage])

  const [customDeploymentMetaData, setCustomDeploymentMetaData] = useState<CustomDeploymentMetaData | undefined>(
    getDeploymentTemplateData()
  )

  useEffect(() => {
    setSelection({
      stageId: 'stage_id'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedStageId && stageDeploymentType) {
      handleDeploymentTypeChange(stageDeploymentType, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStageId])

  useDeepCompareEffect(() => {
    if (customDeploymentMetaData) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.type', ServiceDeploymentType.CustomDeployment)
          set(
            draft,
            'stage.spec.infrastructure.infrastructureDefinition.spec.customDeploymentRef',
            customDeploymentMetaData?.templateMetaData
          )
          set(
            draft,
            'stage.spec.infrastructure.infrastructureDefinition.spec.variables',
            customDeploymentMetaData?.variables
          )
        }
      })
      updateStage(stageData?.stage as StageElementConfig)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDeploymentMetaData])

  const { data: infrastructureDefinitionSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Infrastructure',
      identifier,
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const addOrUpdateTemplate = async (): Promise<void> => {
    if (getTemplate) {
      const { template } = await getTemplate({ templateType: 'CustomDeployment' })
      const templateJSON = parse(template.yaml || '').template
      setCustomDeploymentMetaData({
        templateMetaData: getTemplateRefVersionLabelObject(template),
        variables: templateJSON?.spec?.infrastructure?.variables
      })
    }
  }

  const updateFormValues = (infrastructureDefinitionConfig: InfrastructureDefinitionConfig): void => {
    setFormValues({
      name: infrastructureDefinitionConfig.name,
      identifier: infrastructureDefinitionConfig.identifier,
      description: infrastructureDefinitionConfig.description,
      tags: infrastructureDefinitionConfig.tags
    })

    const stageData = produce(stage, draft => {
      const infraDefinition = get(draft, 'stage.spec.infrastructure', {})
      infraDefinition.infrastructureDefinition.spec = infrastructureDefinitionConfig.spec
      infraDefinition.allowSimultaneousDeployments = infrastructureDefinitionConfig.allowSimultaneousDeployments

      const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})
      serviceDefinition.type = infrastructureDefinitionConfig.deploymentType
    })
    updateStage(stageData?.stage as StageElementConfig)
  }

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      // istanbul ignore else
      if (view === SelectedView.VISUAL) {
        // istanbul ignore else
        if (yamlHandler?.getYAMLValidationErrorMap()?.size && isYamlEditable) {
          clear()
          showError(getString('common.validation.invalidYamlText'))
          return
        }

        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '{}')
        const yamlVisual = parse(yaml).infrastructureDefinition as InfrastructureDefinitionConfig

        // istanbul ignore else
        if (yamlVisual) {
          updateFormValues(yamlVisual)
        }
        setIsYamlEditable(false)
      }
      setSelectedView(view)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    /* istanbul ignore next */ [yamlHandler?.getLatestYaml]
  )

  const { mutate: updateInfrastructure } = useUpdateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: createInfrastructure } = useCreateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const mutateFn = infrastructureDefinition ? updateInfrastructure : createInfrastructure

  const onSubmit = (values: InfrastructureDefinitionConfig): void => {
    setIsSavingInfrastructure(true)
    const body = omit(values, ['spec', 'allowSimultaneousDeployments'])

    mutateFn({
      ...body,
      yaml: yamlStringify({
        infrastructureDefinition: {
          ...body,
          spec: values.spec,
          allowSimultaneousDeployments: values.allowSimultaneousDeployments
        }
      })
    })
      .then(response => {
        if (response.status === 'SUCCESS') {
          showSuccess(
            getString(infrastructureDefinition ? 'cd.infrastructure.updated' : 'cd.infrastructure.created', {
              identifier: response.data?.infrastructure?.identifier
            })
          )
          setIsSavingInfrastructure(false)
          if (environmentIdentifier) {
            refetch(response.data?.infrastructure)
          } else {
            refetch()
          }
          hideModal()
        } else {
          throw response
        }
      })
      .catch(e => {
        setIsSavingInfrastructure(false)
        showError(getErrorInfoFromErrorObject(e))
      })
  }

  const onCustomDeploymentSelection = async (): Promise<void> => {
    if (getTemplate) {
      try {
        const { template } = await getTemplate({ templateType: 'CustomDeployment' })
        const templateRefObj = getTemplateRefVersionLabelObject(template)
        const templateJSON = parse(template.yaml || '').template
        setCustomDeploymentMetaData({
          templateMetaData: templateRefObj,
          variables: templateJSON?.spec?.infrastructure?.variables
        })
      } catch (_) {
        // Reset data.. user cancelled template selection
        setSelectedDeploymentType(undefined)
        setCustomDeploymentMetaData(undefined)
      }
    }
  }

  const handleDeploymentTypeChange = useCallback(
    (deploymentType: ServiceDeploymentType, resetInfrastructureDefinition = true): void => {
      // istanbul ignore else
      if (deploymentType !== selectedDeploymentType) {
        const stageData = produce(stage, draft => {
          const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})
          serviceDefinition.type = deploymentType

          if (draft?.stage?.spec?.infrastructure?.infrastructureDefinition && resetInfrastructureDefinition) {
            delete draft.stage.spec.infrastructure.infrastructureDefinition
            delete draft.stage.spec.infrastructure.allowSimultaneousDeployments
          }
        })
        setSelectedDeploymentType(deploymentType)
        const customDeploymentRef =
          stage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec?.customDeploymentRef
        if (deploymentType === ServiceDeploymentType.CustomDeployment) {
          if (isEmpty(customDeploymentRef)) {
            onCustomDeploymentSelection()
          } else {
            setCustomDeploymentMetaData(getDeploymentTemplateData())
          }
        } else {
          setCustomDeploymentMetaData(undefined)
          updateStage(stageData?.stage as StageElementConfig)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, updateStage]
  )

  const handleEditMode = (): void => {
    setIsYamlEditable(true)
  }

  const checkForErrors = async (): Promise<void> => {
    formikRef.current?.submitForm()

    return Promise.allSettled([
      formikRef.current?.validateForm(),
      checkErrorsForTab(DeployTabs.SERVICE),
      checkErrorsForTab(DeployTabs.INFRASTRUCTURE)
    ]).then(responses => {
      if (responses.map(response => response.status).filter(status => status === 'rejected').length > 0) {
        return Promise.reject()
      } else {
        return Promise.resolve()
      }
    })
  }

  return (
    <>
      <Layout.Vertical
        padding={{ top: 'xlarge', bottom: 'large', right: 'xxlarge', left: 'huge' }}
        className={css.body}
        background={Color.FORM_BG}
      >
        <Layout.Horizontal padding={{ bottom: 'large' }} width={'100%'}>
          <VisualYamlToggle selectedView={selectedView} onChange={handleModeSwitch} />
        </Layout.Horizontal>
        <Container>
          {selectedView === SelectedView.VISUAL ? (
            <>
              <Card className={css.nameIdCard}>
                <Formik<Partial<InfrastructureDefinitionConfig>>
                  initialValues={{
                    name: defaultTo(formValues.name, ''),
                    identifier: defaultTo(formValues.identifier, ''),
                    description: defaultTo(formValues.description, ''),
                    tags: defaultTo(formValues.tags, {})
                  }}
                  formName={'infrastructure-modal'}
                  onSubmit={noop}
                  validationSchema={Yup.object().shape({
                    name: NameSchema({ requiredErrorMsg: getString('fieldRequired', { field: 'Name' }) }),
                    identifier: IdentifierSchema()
                  })}
                >
                  {formikProps => {
                    formikRef.current = formikProps
                    return (
                      <NameIdDescriptionTags
                        formikProps={formikProps}
                        identifierProps={{
                          isIdentifierEditable: !infrastructureDefinition
                        }}
                      />
                    )
                  }}
                </Formik>
              </Card>
              <SelectDeploymentType
                viewContext="setup"
                selectedDeploymentType={selectedDeploymentType}
                isReadonly={!!stageDeploymentType}
                handleDeploymentTypeChange={handleDeploymentTypeChange}
                shouldShowGitops={false}
                customDeploymentData={customDeploymentMetaData?.templateMetaData}
                addOrUpdateTemplate={addOrUpdateTemplate}
              />
              {selectedDeploymentType && <DeployInfraDefinition />}
            </>
          ) : (
            <div className={css.yamlBuilder}>
              <YamlBuilderMemo
                {...yamlBuilderReadOnlyModeProps}
                existingJSON={{
                  infrastructureDefinition: {
                    ...formikRef.current?.values,
                    orgIdentifier,
                    projectIdentifier,
                    environmentRef: environmentIdentifier,
                    deploymentType: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.serviceConfig
                      ?.serviceDefinition?.type,
                    type: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure
                      ?.infrastructureDefinition?.type,
                    spec: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure
                      ?.infrastructureDefinition?.spec,
                    allowSimultaneousDeployments: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)
                      ?.infrastructure?.allowSimultaneousDeployments
                  } as InfrastructureDefinitionConfig
                }}
                key={isYamlEditable.toString()}
                schema={infrastructureDefinitionSchema?.data}
                bind={setYamlHandler}
                showSnippetSection={false}
                isReadOnlyMode={!isYamlEditable}
                onEnableEditMode={handleEditMode}
              />
              {!isYamlEditable ? (
                <div className={css.buttonWrapper}>
                  <Tag>{getString('common.readOnly')}</Tag>
                  <RbacButton
                    permission={{
                      resource: {
                        resourceType: ResourceType.ENVIRONMENT
                      },
                      permission: PermissionIdentifier.EDIT_ENVIRONMENT
                    }}
                    variation={ButtonVariation.SECONDARY}
                    text={getString('common.editYaml')}
                    onClick={handleEditMode}
                  />
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </Layout.Vertical>
      <Layout.Horizontal
        spacing={'medium'}
        padding={{ top: 'xlarge', left: 'huge', bottom: 'large' }}
        className={css.modalFooter}
      >
        <Button
          text={getString('save')}
          variation={ButtonVariation.PRIMARY}
          onClick={() => {
            if (selectedView === SelectedView.YAML) {
              if (yamlHandler?.getYAMLValidationErrorMap()?.size) {
                clear()
                showError(getString('common.validation.invalidYamlText'))
              } else {
                const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
                onSubmit(parse(latestYaml)?.infrastructureDefinition)
              }
            } else {
              checkForErrors()
                .then(() => {
                  onSubmit({
                    ...formikRef.current?.values,
                    orgIdentifier,
                    projectIdentifier,
                    environmentRef: environmentIdentifier,
                    deploymentType: (pipeline.stages?.[0].stage?.spec as DeployStageConfig)?.serviceConfig
                      ?.serviceDefinition?.type,
                    type: (pipeline.stages?.[0].stage?.spec as DeployStageConfig)?.infrastructure
                      ?.infrastructureDefinition?.type,
                    spec: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure
                      ?.infrastructureDefinition?.spec,
                    allowSimultaneousDeployments: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)
                      ?.infrastructure?.allowSimultaneousDeployments
                  } as InfrastructureDefinitionConfig)
                })
                .catch(noop)
            }
          }}
          disabled={isSavingInfrastructure}
          loading={isSavingInfrastructure}
        />
        <Button
          text={getString('cancel')}
          variation={ButtonVariation.SECONDARY}
          onClick={hideModal}
          disabled={isSavingInfrastructure}
        />
      </Layout.Horizontal>
    </>
  )
}
