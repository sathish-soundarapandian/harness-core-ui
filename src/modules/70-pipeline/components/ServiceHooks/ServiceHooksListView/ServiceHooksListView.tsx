/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'

import { Layout, Button, ButtonSize, ButtonVariation, IconProps, StepProps, Text, Icon } from '@harness/uicore'
import type { IDialogProps } from '@blueprintjs/core'
import { Dialog, Classes } from '@blueprintjs/core'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { get, set, noop } from 'lodash-es'
import produce from 'immer'
import { useModalHook } from '@harness/use-modal'
import type { ServiceHookWrapper, StageElementConfig } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ServiceHooksWizard } from '../ServiceHooksWizard/ServiceHooksWizard'
import type { ServiceHooksListViewProps, ServiceHookStoreType, ServiceHookInitStepData } from '../ServiceHooksInterface'
import {
  allowedServiceHooksTypes,
  ServiceHookStoreTypeTitle,
  ServiceHookStoreIconByType,
  ServiceHooksMap
} from '../ServiceHooksHelper'
import { ServiceHooksDetailsStep } from '../ServiceHooksWizard/ServiceHooksSteps/ServiceHooksDetailsStep'

import css from '../ServiceHooks.module.scss'

function ServiceHooksListView({
  updateStage,
  stage,
  isPropagating,
  deploymentType,
  isReadonly,
  allowableTypes,
  selectedStoreType,
  setSelectedStoreType,
  selectedServiceResponse
}: ServiceHooksListViewProps): JSX.Element {
  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [newConnectorView, setNewConnectorView] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hookStore, setHookStore] = useState<ServiceHookStoreType>(ServiceHooksMap.Inline)
  const [serviceHookIndex, setEditIndex] = useState(0)
  const [isNewServiceHook, setIsNewServiceHook] = useState(true)
  const { expressions } = useVariablesExpression()

  const listOfServiceHooks = React.useMemo((): ServiceHookWrapper[] => {
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.hooks', [])
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.hooks', [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPropagating, isReadonly, selectedServiceResponse?.data?.service, stage])

  const commonProps = {
    onConnectorCreated: noop,
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined,
    serviceHookIndex,
    deploymentType,
    isReadonly,
    allowableTypes
  }

  const getInitialValues = (): ServiceHookInitStepData => {
    const data = listOfServiceHooks[serviceHookIndex]
    const initValues = data?.['preHook'] || data?.['postHook']

    if (initValues && !isNewServiceHook) {
      const values = {
        ...initValues,
        hookType: Object.keys(data)[0]
      }
      return values
    }
    return {
      identifier: '',
      storeType: hookStore,
      hookType: 'preHook',
      actions: [],
      store: {
        content: ''
      }
    }
  }

  const updateStageData = (): void => {
    const path = isPropagating
      ? 'stage.spec.serviceConfig.stageOverrides.hooks'
      : 'stage.spec.serviceConfig.serviceDefinition.spec.hooks'

    if (stage) {
      updateStage(
        produce(stage, draft => {
          set(draft, path, listOfServiceHooks)
        }).stage as StageElementConfig
      )
    }
  }

  const handleSubmit = (serviceHookWrapperData: ServiceHookWrapper): void => {
    if (isPropagating) {
      if (listOfServiceHooks?.length > 0) {
        listOfServiceHooks.splice(serviceHookIndex, 1, serviceHookWrapperData)
      } else {
        listOfServiceHooks.push(serviceHookWrapperData)
      }
    } else {
      if (listOfServiceHooks?.length > 0 && isEditMode) {
        listOfServiceHooks.splice(serviceHookIndex, 1, serviceHookWrapperData)
      } else {
        listOfServiceHooks.push(serviceHookWrapperData)
      }
    }
    updateStageData()

    hideConnectorModal()
    setIsEditMode(false)
    setEditIndex(0)
    setHookStore('' as ServiceHookStoreType)
  }
  const commonLastStepProps = {
    handleSubmit,
    expressions
  }
  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<any>>> => {
    return [
      <ServiceHooksDetailsStep
        key="hooks"
        {...commonProps}
        stepName={getString('pipeline.serviceHooks.title', { type: 'Details' })}
        name={getString('pipeline.serviceHooks.title', { type: 'Details' })}
        listOfServiceHooks={listOfServiceHooks}
        {...commonLastStepProps}
      />
    ]
  }, [commonProps, getString, listOfServiceHooks])

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setNewConnectorView(isConnectorView)
    setIsEditMode(false)
  }

  const handleChangeStore = (store: ServiceHookStoreType): void => {
    setHookStore(store || '')
  }

  const getIconProps = (): IconProps => {
    const iconProps: IconProps = {
      name: ServiceHookStoreIconByType[selectedStoreType as ServiceHookStoreType]
    }
    return iconProps
  }

  const editServiceHook = (hookStoreType: ServiceHookStoreType, index: number): void => {
    setIsEditMode(true)
    setIsNewServiceHook(false)
    setHookStore(hookStoreType)
    setSelectedStoreType(hookStoreType)
    setNewConnectorView(false)
    setEditIndex(index)
    showConnectorModal()
  }

  const removeServiceHook = (index: number): void => {
    listOfServiceHooks.splice(index, 1)

    if (stage) {
      const newStage = produce(stage, draft => {
        set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.hooks', listOfServiceHooks)
      }).stage

      if (newStage) {
        updateStage(newStage)
      }
    }
  }

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setNewConnectorView(false)
      setIsNewServiceHook(false)
      hideConnectorModal()
      setHookStore('' as ServiceHookStoreType)
      setIsEditMode(false)
      setSelectedStoreType('' as ServiceHookStoreType)
      setEditIndex(0)
    }
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          <ServiceHooksWizard
            stores={allowedServiceHooksTypes[deploymentType]}
            newConnectorView={newConnectorView}
            expressions={expressions}
            allowableTypes={allowableTypes}
            handleConnectorViewChange={() => handleConnectorViewChange(true)}
            handleStoreChange={handleChangeStore}
            initialValues={getInitialValues()}
            lastSteps={getLastSteps()}
            deploymentType={deploymentType}
            iconsProps={getIconProps()}
            isReadonly={isReadonly}
            serviceHookIndex={serviceHookIndex}
            isNewServiceHook={isNewServiceHook}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [
    selectedStoreType,
    newConnectorView,
    serviceHookIndex,
    hookStore,
    expressions.length,
    expressions,
    allowableTypes,
    isEditMode,
    isNewServiceHook
  ])

  const addNewServiceHook = (): void => {
    setIsNewServiceHook(true)
    showConnectorModal()
  }

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }} width="100%">
        {!!listOfServiceHooks?.length && (
          <div className={cx(css.serviceHooksList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.ID')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('pipeline.serviceHooks.hookType')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipelineSteps.serviceTab.manifestList.manifestStore')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('pipelineSteps.content')}</Text>
            <span></span>
          </div>
        )}
        <Layout.Vertical style={{ flexShrink: 'initial' }} width="100%">
          <section>
            {listOfServiceHooks &&
              listOfServiceHooks.map((data: ServiceHookWrapper, index: number) => {
                const hookData = data['preHook'] || data['postHook']
                const hookType = Object.keys(data)[0] // preHook or postHook
                const hookStoreType = hookData?.storeType
                const hookContent = hookData?.store?.content

                return (
                  <div className={css.rowItem} key={`${hookData?.identifier}-${index}`}>
                    <section className={css.serviceHooksList}>
                      <div className={css.columnId}>
                        <Text color={Color.BLACK} lineClamp={1} inline>
                          {hookData?.identifier}
                        </Text>
                      </div>
                      <div>{hookType}</div>
                      <div className={css.columnStore}>
                        <Icon
                          inline
                          name={ServiceHookStoreIconByType[hookStoreType as ServiceHookStoreType]}
                          size={20}
                        />
                        <Text
                          margin={{ left: 'xsmall' }}
                          inline
                          width={150}
                          className={css.type}
                          color={Color.BLACK}
                          lineClamp={1}
                        >
                          {getString(ServiceHookStoreTypeTitle[hookStoreType as ServiceHookStoreType])}
                        </Text>
                      </div>
                      <div className={css.columnLocation}>
                        <Text color={Color.BLACK} lineClamp={1} inline alwaysShowTooltip>
                          {hookContent}
                        </Text>
                      </div>
                      {!isReadonly && (
                        <span>
                          <Layout.Horizontal>
                            <Button
                              icon="Edit"
                              iconProps={{ size: 18 }}
                              onClick={() => {
                                editServiceHook(hookStoreType as ServiceHookStoreType, index)
                              }}
                              minimal
                            />

                            <Button
                              iconProps={{ size: 18 }}
                              icon="main-trash"
                              onClick={() => removeServiceHook(index)}
                              minimal
                            />
                          </Layout.Horizontal>
                        </span>
                      )}
                    </section>
                  </div>
                )
              })}
          </section>
        </Layout.Vertical>
        {!isReadonly && (
          <Button
            id="add-service-hooks"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            padding={0}
            data-test-id="addServiceHooks"
            onClick={addNewServiceHook}
            icon="plus"
            text={getString('pipeline.serviceHooks.addServiceHook')}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ServiceHooksListView
