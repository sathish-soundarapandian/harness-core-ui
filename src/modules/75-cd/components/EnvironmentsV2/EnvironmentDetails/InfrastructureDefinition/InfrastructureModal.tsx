/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, merge, noop, set } from 'lodash-es'
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
  useToaster,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  Tag
} from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import {
  DeploymentStageConfig,
  InfrastructureConfig,
  InfrastructureDefinitionConfig,
  InfrastructureRequestDTORequestBody,
  InfrastructureResponseDTO,
  useCreateInfrastructure,
  useGetYamlSchema,
  useUpdateInfrastructure
} from 'services/cd-ng'

import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
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
import type { PipelineInfoConfig, StageElementConfig } from 'services/pipeline-ng'

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
import css from './InfrastructureDefinition.module.scss'

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
  environmentIdentifier
}: {
  hideModal: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: any
  selectedInfrastructure?: string
  environmentIdentifier: string
}): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const infrastructureDefinition = useMemo(() => {
    return /* istanbul ignore next */ (parse(defaultTo(selectedInfrastructure, '{}')) as InfrastructureConfig)
      ?.infrastructureDefinition
  }, [selectedInfrastructure])

  const { type, spec, allowSimultaneousDeployments } = defaultTo(
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
                  type: ''
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
  environmentIdentifier
}: {
  hideModal: () => void
  refetch: (infrastructure?: InfrastructureResponseDTO) => void
  infrastructureDefinition?: InfrastructureDefinitionConfig
  environmentIdentifier: string
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
  const { showSuccess, showError } = useToaster()
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
  const [invalidYaml, setInvalidYaml] = useState(false)
  const [formValues, setFormValues] = useState({
    name,
    identifier,
    description,
    tags
  })
  const formikRef = useRef<FormikProps<Partial<InfrastructureDefinitionConfig>>>()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  useEffect(() => {
    setSelection({
      stageId: 'stage_id'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data: environmentSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Infrastructure',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const updateFormValues = (infrastructureDefinitionConfig: InfrastructureDefinitionConfig): void => {
    setFormValues({
      name: infrastructureDefinitionConfig.name,
      identifier: infrastructureDefinitionConfig.identifier,
      description: infrastructureDefinitionConfig.description,
      tags: infrastructureDefinitionConfig.tags
    })

    const stageData = produce(stage, draft => {
      const infraDefinition = get(draft, 'stage.spec.infrastructure.infrastructureDefinition', {})
      infraDefinition.spec = infrastructureDefinitionConfig.spec
      infraDefinition.allowSimultaneousDeployments = infrastructureDefinitionConfig.allowSimultaneousDeployments
    })
    updateStage(stageData?.stage as StageElementConfig)
  }

  const handleYamlChange = useCallback((): void => {
    const errors = yamlHandler?.getYAMLValidationErrorMap()
    const hasError = errors?.size ? true : false
    setInvalidYaml(hasError)
    const yaml = defaultTo(yamlHandler?.getLatestYaml(), '{}')
    const yamlVisual = parse(yaml).infrastructureDefinition as InfrastructureDefinitionConfig

    // istanbul ignore else
    if (yamlVisual) {
      updateFormValues(yamlVisual)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yamlHandler])

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      // istanbul ignore else
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '{}')
        const yamlVisual = parse(yaml).infrastructureDefinition as InfrastructureDefinitionConfig

        // istanbul ignore else
        if (yamlHandler?.getYAMLValidationErrorMap()?.size && isYamlEditable) {
          showError(getString('common.validation.invalidYamlText'))
          return
        }

        // istanbul ignore else
        if (yamlVisual) {
          updateFormValues(yamlVisual)
        }
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
    const { name: newName, identifier: newIdentifier, description: newDescription, tags: newTags } = values
    const body: InfrastructureRequestDTORequestBody = {
      name: newName,
      identifier: newIdentifier,
      description: newDescription,
      tags: newTags,
      orgIdentifier,
      projectIdentifier,
      type: (pipeline.stages?.[0].stage?.spec as DeployStageConfig)?.infrastructure?.infrastructureDefinition?.type,
      environmentRef: environmentIdentifier
    }

    mutateFn({
      ...body,
      yaml: yamlStringify({
        infrastructureDefinition: {
          ...body,
          spec: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure?.infrastructureDefinition
            ?.spec,
          allowSimultaneousDeployments: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure
            ?.allowSimultaneousDeployments
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

  const handleDeploymentTypeChange = useCallback(
    (deploymentType: ServiceDeploymentType): void => {
      // istanbul ignore else
      if (deploymentType !== selectedDeploymentType) {
        const stageData = produce(stage, draft => {
          const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})
          serviceDefinition.type = deploymentType
        })
        setSelectedDeploymentType(deploymentType)
        updateStage(stageData?.stage as StageElementConfig)
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
              {!infrastructureDefinition && (
                <SelectDeploymentType
                  viewContext="setup"
                  selectedDeploymentType={selectedDeploymentType}
                  isReadonly={false}
                  handleDeploymentTypeChange={handleDeploymentTypeChange}
                  shouldShowGitops={false}
                />
              )}
              {(selectedDeploymentType || infrastructureDefinition) && <DeployInfraDefinition />}
            </>
          ) : (
            <div className={css.yamlBuilder}>
              <YAMLBuilder
                {...yamlBuilderReadOnlyModeProps}
                existingJSON={{
                  infrastructureDefinition: {
                    ...formikRef.current?.values,
                    orgIdentifier,
                    projectIdentifier,
                    environmentRef: environmentIdentifier,
                    type: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure
                      ?.infrastructureDefinition?.type,
                    spec: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)?.infrastructure
                      ?.infrastructureDefinition?.spec,
                    allowSimultaneousDeployments: (pipeline.stages?.[0].stage?.spec as DeploymentStageConfig)
                      ?.infrastructure?.allowSimultaneousDeployments
                  } as InfrastructureDefinitionConfig
                }}
                key={isYamlEditable.toString()}
                schema={environmentSchema?.data}
                bind={setYamlHandler}
                showSnippetSection={false}
                isReadOnlyMode={!isYamlEditable}
                onChange={handleYamlChange}
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
              const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
              onSubmit(parse(latestYaml)?.infrastructureDefinition)
            } else {
              checkForErrors()
                .then(() => {
                  onSubmit({
                    ...formikRef.current?.values,
                    orgIdentifier,
                    projectIdentifier,
                    environmentRef: environmentIdentifier
                  } as InfrastructureDefinitionConfig)
                })
                .catch(noop)
            }
          }}
          disabled={isSavingInfrastructure || invalidYaml}
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
