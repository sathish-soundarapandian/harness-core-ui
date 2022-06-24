/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { VisualYamlToggle, VisualYamlSelectedView as SelectedView, Tag, ButtonVariation } from '@harness/uicore'
import { cloneDeep, defaultTo, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import produce from 'immer'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { NGServiceConfig, PipelineInfoConfig, useGetEntityYamlSchema } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import DeployServiceDefinition from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceDefinition/DeployServiceDefinition'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { useServiceContext } from '@cd/context/ServiceContext'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { setNameIDDescription } from '../../utils/ServiceUtils'
import ServiceStepBasicInfo from './ServiceStepBasicInfo'
import css from './ServiceConfiguration.module.scss'

interface ServiceConfigurationProps {
  serviceData: NGServiceConfig
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `service.yaml`,
  entityType: 'Service',
  width: '100%',
  height: 'calc(100vh - 250px)',
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

function ServiceConfiguration({ serviceData }: ServiceConfigurationProps): React.ReactElement | null {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const {
    state: {
      pipeline: service,
      pipelineView: { isYamlEditable },
      pipelineView
    },
    updatePipeline,
    updatePipelineView,
    isReadonly
  } = usePipelineContext()
  const { isServiceCreateModalView } = useServiceContext()
  const { getString } = useStrings()

  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const { data: serviceSchema } = useGetEntityYamlSchema({
    queryParams: {
      entityType: 'Service',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    }
  })

  const getUpdatedPipelineYaml = useCallback((): PipelineInfoConfig | undefined => {
    const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
    const serviceSetYamlVisual = parse(yaml).service

    if (serviceSetYamlVisual) {
      return produce({ ...service }, draft => {
        setNameIDDescription(draft, serviceSetYamlVisual)
        set(
          draft,
          'stages[0].stage.spec.serviceConfig.serviceDefinition',
          cloneDeep(serviceSetYamlVisual.serviceDefinition)
        )
      })
    }
  }, [service, yamlHandler])

  const onYamlChange = useCallback(
    (yamlChanged: boolean): void => {
      if (yamlChanged) {
        const newServiceData = getUpdatedPipelineYaml()
        newServiceData && updatePipeline(newServiceData)
      }
    },
    [getUpdatedPipelineYaml, updatePipeline]
  )

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const newServiceData = getUpdatedPipelineYaml()
        newServiceData && updatePipeline(newServiceData)
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, serviceSchema]
  )

  if (service.identifier === DefaultNewPipelineId && !isServiceCreateModalView) {
    return null
  }
  return (
    <div className={css.serviceEntity}>
      <div className={css.optionBtns}>
        <VisualYamlToggle
          selectedView={selectedView}
          onChange={nextMode => {
            handleModeSwitch(nextMode)
          }}
          //   disableToggle={!inputSetTemplateYaml}
        />
      </div>
      {selectedView === SelectedView.VISUAL ? (
        <>
          <ServiceStepBasicInfo />
          <DeployServiceDefinition />
        </>
      ) : (
        <div className={css.yamlBuilder}>
          <YAMLBuilder
            {...yamlBuilderReadOnlyModeProps}
            key={isYamlEditable.toString()}
            isReadOnlyMode={isReadonly || !isYamlEditable}
            onChange={onYamlChange}
            onEnableEditMode={() => {
              updatePipelineView({ ...pipelineView, isYamlEditable: true })
            }}
            isEditModeSupported={!isReadonly}
            existingJSON={serviceData}
            bind={setYamlHandler}
            schema={serviceSchema?.data}
            showSnippetSection={false}
          />
          {isReadonly || !isYamlEditable ? (
            <div className={css.buttonsWrapper}>
              <Tag>{getString('common.readOnly')}</Tag>
              <RbacButton
                permission={{
                  resource: {
                    resourceType: ResourceType.SERVICE,
                    resourceIdentifier: defaultTo(serviceId, '')
                  },
                  permission: PermissionIdentifier.EDIT_SERVICE
                }}
                variation={ButtonVariation.SECONDARY}
                text={getString('common.editYaml')}
                onClick={() => {
                  updatePipelineView({ ...pipelineView, isYamlEditable: true })
                }}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default ServiceConfiguration
