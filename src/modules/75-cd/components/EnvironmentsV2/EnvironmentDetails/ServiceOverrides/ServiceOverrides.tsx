/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import cx from 'classnames'
import { parse } from 'yaml'
import {
  ButtonSize,
  ButtonVariation,
  Text,
  Layout,
  Card,
  Container,
  Dialog,
  useToaster,
  Accordion,
  IconName,
  HarnessDocTooltip,
  ButtonProps,
  MultiTypeInputType,
  AllowedTypesWithRunTime
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FontVariation, Color } from '@harness/design-system'
import {
  ApplicationSettingsConfiguration,
  ConfigFileWrapper,
  ConnectionStringsConfiguration,
  deleteServiceOverridePromise,
  ManifestConfigWrapper,
  NGServiceOverrideConfig,
  NGVariable,
  ServiceOverrideResponseDTO,
  ServiceResponse,
  upsertServiceOverridePromise,
  useGetServiceList,
  useGetServiceOverridesList
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { EnvironmentPathProps, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { usePermission } from '@rbac/hooks/usePermission'
import ApplicationConfigSelection from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceConfiguration/AzureWebAppServiceConfigSelection'
import { AzureWebAppSelectionTypes } from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceConfiguration/AzureWebAppServiceConfig.types'
import { ServiceOverrideTab } from './ServiceOverridesUtils'
import AddEditServiceOverride from './AddEditServiceOverride'
import ServiceManifestOverridesList from './ServiceManifestOverride/ServiceManifestOverridesList'
import ServiceVariablesOverridesList from './ServiceVariablesOverrides/ServiceVariablesOverridesList'
import ServiceConfigFileOverridesList from './ServiceConfigFileOverride/ServiceConfigFileOverridesList'
import css from './ServiceOverrides.module.scss'

export function ServiceOverrides(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    PipelinePathProps & EnvironmentPathProps
  >()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const rbacPermission = {
    resource: {
      resourceType: ResourceType.ENVIRONMENT
    },
    permission: PermissionIdentifier.EDIT_ENVIRONMENT
  }
  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT]
  })
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [selectedTab, setSelectedTab] = useState(ServiceOverrideTab.VARIABLE)

  const allowableTypes: AllowedTypesWithRunTime[] = [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ]

  const memoizedQueryParam = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )
  const { data: services, loading: servicesLoading } = useGetServiceList({
    queryParams: memoizedQueryParam
  })
  const {
    data: serviceOverridesData,
    loading: serviceOverridesLoading,
    refetch: refetchServiceOverrides
  } = useGetServiceOverridesList({
    queryParams: {
      ...memoizedQueryParam,
      environmentIdentifier
    },
    lazy: servicesLoading || !!get(services, 'data.empty', null)
  })
  const serviceOverrides: ServiceOverrideResponseDTO[] = get(serviceOverridesData, 'data.content', [])

  const handleDeleteOverride = async (
    overrideType: string,
    overrideList:
      | NGVariable[]
      | ManifestConfigWrapper[]
      | ConfigFileWrapper[]
      | ConnectionStringsConfiguration
      | ApplicationSettingsConfiguration,
    index: number,
    isSingleOverride: boolean,
    serviceRef?: string
  ): Promise<void> => {
    if (isSingleOverride) {
      try {
        const response = await deleteServiceOverridePromise({
          queryParams: {
            ...memoizedQueryParam,
            environmentIdentifier,
            serviceIdentifier: serviceRef
          },
          body: null as any
        })
        if (response.status === 'SUCCESS') {
          showSuccess(getString('cd.serviceOverrides.deleted'))
          refetchServiceOverrides()
        } else {
          throw response
        }
      } catch (e) {
        showError(getRBACErrorMessage(e))
      }
    } else {
      try {
        const parsedYaml = parse(
          defaultTo(serviceOverrides?.filter(override => override.serviceRef === serviceRef)?.[0].yaml, '{}')
        )
        if (overrideType === 'variables') {
          ;(overrideList as NGVariable[]).splice(index, 1).map(override => ({
            name: get(override, 'name'),
            type: get(override, 'type'),
            value: get(override, 'value')
          }))
        } else if (overrideType !== 'applicationSettings' && overrideType !== 'connectionStrings') {
          ;(overrideList as []).splice(index, 1)
        }

        const response = await upsertServiceOverridePromise({
          queryParams: {
            accountIdentifier: accountId
          },
          body: {
            orgIdentifier,
            projectIdentifier,
            environmentIdentifier,
            serviceIdentifier: serviceRef,
            yaml: yamlStringify({
              ...parsedYaml,
              serviceOverrides: {
                ...parsedYaml.serviceOverrides,
                [overrideType]:
                  overrideType === 'applicationSettings' || overrideType === 'connectionStrings'
                    ? undefined
                    : overrideList
              }
            })
          }
        })

        if (response.status === 'SUCCESS') {
          showSuccess(getString('cd.serviceOverrides.deletedOneVariable'))
          refetchServiceOverrides()
        } else {
          throw response
        }
      } catch (e) {
        showError(getRBACErrorMessage(e))
      }
    }
  }

  const createNewOverride = (): void => {
    setIsEdit(false)
    setSelectedService(null)
    setSelectedTab(ServiceOverrideTab.VARIABLE)
    showModal()
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        onClose={hideModal}
        className={cx(css.dialogStyles, 'padded-dialog')}
        title={getString(isEdit ? 'common.editName' : 'common.addName', { name: getString('common.override') })}
      >
        <AddEditServiceOverride
          selectedService={selectedService}
          expressions={expressions}
          closeModal={closeModal}
          services={defaultTo(services?.data?.content, [])}
          serviceOverrides={serviceOverrides}
          defaultTab={selectedTab}
          isReadonly={!canEdit}
        />
      </Dialog>
    ),
    [selectedService, services, isEdit, serviceOverrides, selectedTab]
  )

  const closeModal = (updateServiceOverride?: boolean): void => {
    hideModal()
    setSelectedService(null)
    setSelectedTab(ServiceOverrideTab.VARIABLE)
    if (updateServiceOverride) {
      refetchServiceOverrides()
    }
  }

  const getAddOverrideBtnProps = (overrideType: ServiceOverrideTab, serviceRef: string | undefined): ButtonProps => {
    const addOverrideBtnProps = {
      size: ButtonSize.SMALL,
      variation: ButtonVariation.LINK,
      className: css.addOverrideBtn,
      onClick: () => {
        openModal(overrideType, serviceRef)
      },
      icon: 'plus' as IconName,
      permission: rbacPermission,
      margin: { top: 'medium' }
    }
    return addOverrideBtnProps
  }

  const openModal = (tab: ServiceOverrideTab, serviceRef?: string): void => {
    setSelectedTab(tab)
    setSelectedService(defaultTo(serviceRef, ''))
    setIsEdit(true)
    showModal()
  }

  return servicesLoading || serviceOverridesLoading ? (
    <ContainerSpinner />
  ) : (
    <Container padding={{ left: 'xxlarge', right: 'medium' }}>
      <div className={css.serviceOverridesContainer}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text
            color={Color.GREY_700}
            margin={{ bottom: 'small' }}
            font={{ weight: 'bold' }}
            data-tooltip-id="serviceOverrides"
          >
            {getString('common.serviceOverrides')}
            <HarnessDocTooltip useStandAlone={true} tooltipId="serviceOverrides" />
          </Text>
          <RbacButton
            size={ButtonSize.SMALL}
            icon="plus"
            variation={ButtonVariation.SECONDARY}
            onClick={createNewOverride}
            text={getString('cd.pipelineSteps.serviceTab.newServiceOverride')}
            permission={rbacPermission}
            margin={{ right: 'small' }}
          />
        </Layout.Horizontal>
        <Text>{getString('cd.serviceOverrides.helperText')}</Text>
        <Accordion activeId={serviceOverrides[0]?.serviceRef} allowMultiOpen>
          {serviceOverrides.map((serviceOverride: ServiceOverrideResponseDTO) => {
            const {
              serviceOverrides: {
                serviceRef,
                variables = [],
                manifests = [],
                configFiles = [],
                applicationSettings = undefined,
                connectionStrings = undefined
              } = {}
            } = parse(defaultTo(serviceOverride.yaml, '{}')) as NGServiceOverrideConfig
            const applicationSettingsNumber = applicationSettings ? 1 : 0
            const connectionStringsNumber = connectionStrings ? 1 : 0
            const isSingleOverride =
              variables.length +
                manifests.length +
                configFiles.length +
                applicationSettingsNumber +
                connectionStringsNumber ===
              1
            const serviceName = get(
              get(services, 'data.content', []).find(
                (serviceObject: ServiceResponse) => serviceRef === serviceObject.service?.identifier
              ),
              'service.name',
              serviceRef
            )

            return (
              <Accordion.Panel
                key={serviceRef}
                id={serviceRef as string}
                addDomId={true}
                summary={
                  <Text
                    color={Color.BLACK}
                    font={{ variation: FontVariation.CARD_TITLE, weight: 'bold' }}
                    margin={{ right: 'small' }}
                  >
                    {serviceName}
                  </Text>
                }
                details={
                  <Layout.Vertical spacing="medium">
                    {!!manifests.length && (
                      <Card>
                        <Accordion
                          activeId={`${serviceRef}-manifests`}
                          allowMultiOpen
                          panelClassName={css.overridesAccordionPanel}
                          detailsClassName={css.overridesAccordionDetails}
                        >
                          <Accordion.Panel
                            key={`${serviceRef}-manifests`}
                            id={`${serviceRef}-manifests` as string}
                            addDomId={true}
                            summary={
                              <Text
                                font={{ variation: FontVariation.CARD_TITLE, weight: 'bold' }}
                                margin={{ right: 'small' }}
                                color={Color.GREY_700}
                                data-tooltip-id="serviceManifestOverrides"
                              >
                                {getString('cd.serviceOverrides.manifestOverrides')}
                                <HarnessDocTooltip useStandAlone={true} tooltipId="serviceManifestOverrides" />
                              </Text>
                            }
                            details={
                              <>
                                <ServiceManifestOverridesList
                                  manifestOverridesList={manifests}
                                  isReadonly={!canEdit}
                                  editManifestOverride={() => {
                                    openModal(ServiceOverrideTab.MANIFEST, serviceRef)
                                  }}
                                  removeManifestConfig={index =>
                                    handleDeleteOverride('manifests', manifests, index, isSingleOverride, serviceRef)
                                  }
                                />
                                <RbacButton
                                  {...getAddOverrideBtnProps(ServiceOverrideTab.MANIFEST, serviceRef)}
                                  text={`${getString('common.newName', {
                                    name: getString('manifestsText')
                                  })} ${getString('common.override')}`}
                                />
                              </>
                            }
                          />
                        </Accordion>
                      </Card>
                    )}
                    {!!configFiles.length && (
                      <Card>
                        <Accordion
                          activeId={`${serviceRef}-configFiles`}
                          allowMultiOpen
                          panelClassName={css.overridesAccordionPanel}
                          detailsClassName={css.overridesAccordionDetails}
                        >
                          <Accordion.Panel
                            key={`${serviceRef}-configFiles`}
                            id={`${serviceRef}-configFiles` as string}
                            addDomId={true}
                            summary={
                              <Text
                                font={{ variation: FontVariation.CARD_TITLE, weight: 'bold' }}
                                margin={{ right: 'small' }}
                                color={Color.GREY_700}
                                data-tooltip-id="serviceFilesOverrides"
                              >
                                {getString('cd.serviceOverrides.configFileOverrides')}
                                <HarnessDocTooltip useStandAlone={true} tooltipId="serviceFilesOverrides" />
                              </Text>
                            }
                            details={
                              <>
                                <ServiceConfigFileOverridesList
                                  configFileOverrideList={configFiles}
                                  isReadonly={!canEdit}
                                  editFileOverride={() => {
                                    openModal(ServiceOverrideTab.CONFIG, serviceRef)
                                  }}
                                  handleServiceFileDelete={index =>
                                    handleDeleteOverride(
                                      'configFiles',
                                      configFiles,
                                      index,
                                      isSingleOverride,
                                      serviceRef
                                    )
                                  }
                                />
                                <RbacButton
                                  {...getAddOverrideBtnProps(ServiceOverrideTab.CONFIG, serviceRef)}
                                  text={`${getString('common.newName', {
                                    name: getString('cd.configFileStoreTitle')
                                  })} ${getString('common.override')}`}
                                />
                              </>
                            }
                          />
                        </Accordion>
                      </Card>
                    )}
                    {applicationSettings && (
                      <Card>
                        <Accordion
                          activeId={`${serviceRef}-applicationSettings`}
                          allowMultiOpen
                          panelClassName={css.overridesAccordionPanel}
                          detailsClassName={css.overridesAccordionDetails}
                        >
                          <Accordion.Panel
                            key={`${serviceRef}-applicationSettings`}
                            id={`${serviceRef}-applicationSettings` as string}
                            addDomId={true}
                            summary={
                              <Text
                                font={{ variation: FontVariation.CARD_TITLE, weight: 'bold' }}
                                margin={{ right: 'small' }}
                                color={Color.GREY_700}
                                data-tooltip-id="serviceApplicationSettingsOverride"
                              >
                                {getString('pipeline.appServiceConfig.applicationSettings.overrides')}
                                <HarnessDocTooltip
                                  useStandAlone={true}
                                  tooltipId="serviceApplicationSettingsOverride"
                                />
                              </Text>
                            }
                            details={
                              <Layout.Vertical>
                                <ApplicationConfigSelection
                                  environmentAllowableTypes={allowableTypes}
                                  readonly={!canEdit}
                                  showApplicationSettings={true}
                                  data={applicationSettings as ApplicationSettingsConfiguration}
                                  selectionType={AzureWebAppSelectionTypes.SERVICE_OVERRIDE}
                                  handleDeleteConfig={index =>
                                    handleDeleteOverride(
                                      'applicationSettings',
                                      applicationSettings,
                                      index,
                                      isSingleOverride,
                                      serviceRef
                                    )
                                  }
                                  editServiceOverride={() => {
                                    openModal(ServiceOverrideTab.APPLICATIONSETTING, serviceRef)
                                  }}
                                />
                              </Layout.Vertical>
                            }
                          />
                        </Accordion>
                      </Card>
                    )}
                    {connectionStrings && (
                      <Card>
                        <Accordion
                          activeId={`${serviceRef}-connectionStrings`}
                          allowMultiOpen
                          panelClassName={css.overridesAccordionPanel}
                          detailsClassName={css.overridesAccordionDetails}
                        >
                          <Accordion.Panel
                            key={`${serviceRef}-connectionStrings`}
                            id={`${serviceRef}-connectionStrings` as string}
                            addDomId={true}
                            summary={
                              <Text
                                font={{ variation: FontVariation.CARD_TITLE, weight: 'bold' }}
                                margin={{ right: 'small' }}
                                color={Color.GREY_700}
                                data-tooltip-id="serviceConnectionStringsOverride"
                              >
                                {getString('pipeline.appServiceConfig.connectionStrings.overrides')}
                                <HarnessDocTooltip useStandAlone={true} tooltipId="serviceConnectionStringsOverride" />
                              </Text>
                            }
                            details={
                              <Layout.Vertical>
                                <ApplicationConfigSelection
                                  environmentAllowableTypes={allowableTypes}
                                  readonly={!canEdit}
                                  showConnectionStrings={true}
                                  data={connectionStrings as ConnectionStringsConfiguration}
                                  selectionType={AzureWebAppSelectionTypes.SERVICE_OVERRIDE}
                                  handleDeleteConfig={index =>
                                    handleDeleteOverride(
                                      'connectionStrings',
                                      connectionStrings,
                                      index,
                                      isSingleOverride,
                                      serviceRef
                                    )
                                  }
                                  editServiceOverride={() => {
                                    openModal(ServiceOverrideTab.CONNECTIONSTRING, serviceRef)
                                  }}
                                />
                              </Layout.Vertical>
                            }
                          />
                        </Accordion>
                      </Card>
                    )}
                    {!!variables.length && (
                      <Card>
                        <Accordion
                          activeId={`${serviceRef}-variables`}
                          allowMultiOpen
                          panelClassName={css.overridesAccordionPanel}
                          detailsClassName={css.overridesAccordionDetails}
                        >
                          <Accordion.Panel
                            key={`${serviceRef}-variables`}
                            id={`${serviceRef}-variables` as string}
                            addDomId={true}
                            summary={
                              <Text
                                font={{ variation: FontVariation.CARD_TITLE, weight: 'bold' }}
                                margin={{ right: 'small' }}
                                color={Color.GREY_700}
                                data-tooltip-id="serviceVariableOverrides"
                              >
                                {getString('cd.serviceOverrides.variableOverrides')}
                                <HarnessDocTooltip useStandAlone={true} tooltipId="serviceVariableOverrides" />
                              </Text>
                            }
                            details={
                              <>
                                <ServiceVariablesOverridesList
                                  variableOverrides={variables}
                                  isReadonly={!canEdit}
                                  onServiceVarEdit={() => {
                                    setSelectedTab(ServiceOverrideTab.VARIABLE)
                                    openModal(ServiceOverrideTab.VARIABLE, serviceRef)
                                  }}
                                  onServiceVarDelete={index =>
                                    handleDeleteOverride('variables', variables, index, isSingleOverride, serviceRef)
                                  }
                                />
                                <RbacButton
                                  {...getAddOverrideBtnProps(ServiceOverrideTab.VARIABLE, serviceRef)}
                                  text={`${getString('common.newName', {
                                    name: getString('variableLabel')
                                  })} ${getString('common.override')}`}
                                />
                              </>
                            }
                          />
                        </Accordion>
                      </Card>
                    )}
                  </Layout.Vertical>
                }
              />
            )
          })}
        </Accordion>
      </div>
    </Container>
  )
}
