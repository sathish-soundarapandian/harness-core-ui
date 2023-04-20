/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import {
  VisualYamlToggle,
  VisualYamlSelectedView as SelectedView,
  Tag,
  ButtonVariation,
  Container
} from '@harness/uicore'
import { cloneDeep, defaultTo, isEmpty, isEqual, set } from 'lodash-es'
import { matchPath, useHistory, useParams } from 'react-router-dom'
import { parse } from 'yaml'
import produce from 'immer'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { NGServiceConfig, useGetEntityYamlSchema } from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import DeployServiceDefinition from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceDefinition/DeployServiceDefinition'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { useServiceContext } from '@cd/context/ServiceContext'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { NavigationCheck } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { pipelineModuleParams, projectPathProps, servicePathProps } from '@common/utils/routeUtils'
import { setNameIDDescription } from '../../utils/ServiceUtils'
import ServiceStepBasicInfo from './ServiceStepBasicInfo'
import css from './ServiceConfiguration.module.scss'

interface ServiceConfigurationProps {
  serviceData: NGServiceConfig
  setHasYamlValidationErrors: (hasErrors: boolean) => void
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `service.yaml`,
  entityType: 'Service',
  width: '100%',
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

function ServiceConfiguration({
  serviceData,
  setHasYamlValidationErrors
}: ServiceConfigurationProps): React.ReactElement | null {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const {
    state: {
      pipeline: service,
      pipelineView: { isYamlEditable },
      pipelineView,
      isUpdated
    },
    updatePipeline,
    updatePipelineView,
    setView,
    isReadonly
  } = usePipelineContext()
  const { isServiceCreateModalView, isServiceEntityModalView } = useServiceContext()
  const { getString } = useStrings()
  const history = useHistory()

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
    try {
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
    }
  }, [service, yamlHandler])

  const onYamlChange = useCallback(
    (yamlChanged: boolean): void => {
      if (yamlChanged) {
        try {
          const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
          const serviceSetYamlVisual = parse(yaml).service
          if (
            !isEmpty(serviceSetYamlVisual.serviceDefinition.spec) ||
            !isEmpty(serviceSetYamlVisual.serviceDefinition.type)
          ) {
            requestAnimationFrame(() => {
              setHasYamlValidationErrors(!isEmpty(yamlHandler?.getYAMLValidationErrorMap()))
            })
          }

          const newServiceData = getUpdatedPipelineYaml()
          const isYamlUpdated = !isEqual(service, newServiceData)
          newServiceData && isYamlUpdated && updatePipeline(newServiceData)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(e)
        }
      }
    },
    [getUpdatedPipelineYaml, service, setHasYamlValidationErrors, updatePipeline, yamlHandler]
  )

  const handleModeSwitch = useCallback(
    (view: SelectedView): void => {
      if (view === SelectedView.VISUAL) {
        const newServiceData = getUpdatedPipelineYaml()
        newServiceData && updatePipeline(newServiceData, view)
      }
      setView(view)
      setSelectedView(view)
    },
    [setView, getUpdatedPipelineYaml, updatePipeline]
  )

  const isInvalidYaml = useCallback((): boolean => {
    if (yamlHandler) {
      try {
        const parsedYaml = parse(yamlHandler.getLatestYaml())
        if (!parsedYaml || yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
          return true
        }
      } catch (_) {
        return true
      }
    }
    return false
  }, [yamlHandler])

  const invalidYaml = isInvalidYaml()

  if (service.identifier === DefaultNewPipelineId && !isServiceCreateModalView) {
    return null
  }
  return (
    <Container className={css.serviceEntity} padding={{ left: isServiceEntityModalView ? 'xsmall' : 'xxlarge' }}>
      <NavigationCheck
        when={isUpdated}
        shouldBlockNavigation={nextLocation => {
          const matchDefault = matchPath(nextLocation.pathname, {
            path: routes.toServiceStudio({
              ...projectPathProps,
              ...servicePathProps,
              ...pipelineModuleParams
            }),
            exact: true
          })

          return !matchDefault?.isExact
        }}
        textProps={{
          contentText: getString(invalidYaml ? 'navigationYamlError' : 'navigationCheckText'),
          titleText: getString(invalidYaml ? 'navigationYamlErrorTitle' : 'navigationCheckTitle')
        }}
        navigate={newPath => {
          history.push(newPath)
        }}
      />
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
          <YamlBuilderMemo
            {...yamlBuilderReadOnlyModeProps}
            fileName={`${serviceData.service?.name}.yaml`}
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
            height={isServiceEntityModalView ? 540 : 700}
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
    </Container>
  )
}

export default ServiceConfiguration
