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
  IconName
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FontVariation, Color } from '@harness/design-system'
import {
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
import { ServiceOverrideTab } from './ServiceOverridesUtils'
import AddEditServiceOverride from './AddEditServiceOverride'
import ServiceManifestOverridesList from './ServiceManifestOverride/ServiceManifestOverridesList'
import ServiceVariablesOverridesList from './ServiceVariablesOverrides/ServiceVariablesOverridesList'
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
    overrideList: NGVariable[] | ManifestConfigWrapper[],
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
        } else {
          overrideList.splice(index, 1)
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
                [overrideType]: overrideList
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
    [selectedService, services, isEdit, serviceOverrides]
  )

  const closeModal = (updateServiceOverride?: boolean): void => {
    hideModal()
    setSelectedService(null)
    setSelectedTab(ServiceOverrideTab.VARIABLE)
    if (updateServiceOverride) {
      refetchServiceOverrides()
    }
  }

  return servicesLoading || serviceOverridesLoading ? (
    <ContainerSpinner />
  ) : (
    <Container padding={{ left: 'xxlarge', right: 'medium' }}>
      <div className={css.serviceOverridesContainer}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text color={Color.GREY_700} margin={{ bottom: 'small' }} font={{ weight: 'bold' }}>
            {getString('common.serviceOverrides')}
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
            const { serviceOverrides: { serviceRef, variables = [], manifests = [] } = {} } = parse(
              defaultTo(serviceOverride.yaml, '{}')
            ) as NGServiceOverrideConfig
            const isSingleOverride = variables.length + manifests.length === 1
            const serviceName = get(
              get(services, 'data.content', []).find(
                (serviceObject: ServiceResponse) => serviceRef === serviceObject.service?.identifier
              ),
              'service.name',
              serviceRef
            )
            const addOverrideBtnProps = {
              size: ButtonSize.SMALL,
              variation: ButtonVariation.LINK,
              onClick: () => {
                setSelectedService(defaultTo(serviceRef, ''))
                setIsEdit(false)
                showModal()
              },
              icon: 'plus' as IconName,
              text: getString('common.newName', { name: getString('common.override') }),
              permission: rbacPermission,
              margin: { top: 'medium' }
            }

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
                    {!!variables.length && (
                      <Card>
                        <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                          {getString('cd.serviceOverrides.variableOverrides')}
                        </Text>
                        <ServiceVariablesOverridesList
                          variableOverrides={variables}
                          isReadonly={!canEdit}
                          onServiceVarEdit={() => {
                            setSelectedTab(ServiceOverrideTab.VARIABLE)
                            setSelectedService(defaultTo(serviceRef, ''))
                            setIsEdit(true)
                            showModal()
                          }}
                          onServiceVarDelete={index =>
                            handleDeleteOverride('variables', variables, index, isSingleOverride, serviceRef)
                          }
                        />
                        <RbacButton {...addOverrideBtnProps} />
                      </Card>
                    )}
                    {!!manifests.length && (
                      <Card>
                        <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                          {getString('cd.serviceOverrides.manifestOverrides')}
                        </Text>
                        <ServiceManifestOverridesList
                          manifestOverridesList={manifests}
                          isReadonly={!canEdit}
                          editManifestOverride={() => {
                            setSelectedTab(ServiceOverrideTab.MANIFEST)
                            setSelectedService(defaultTo(serviceRef, ''))
                            setIsEdit(true)
                            showModal()
                          }}
                          removeManifestConfig={index =>
                            handleDeleteOverride('manifests', manifests, index, isSingleOverride, serviceRef)
                          }
                        />
                        <RbacButton {...addOverrideBtnProps} />
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
