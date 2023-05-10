/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import {
  Dialog,
  Layout,
  Views,
  VisualYamlSelectedView as SelectedView,
  Container,
  GridListToggle,
  useToaster,
  Heading,
  ButtonVariation,
  ExpandingSearchInput
} from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { useModalHook } from '@harness/use-modal'
import { defaultTo } from 'lodash-es'
import { useServiceStore } from '@cd/components/Services/common'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import { Page } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import { ServiceResponseDTO, useGetServiceList, ServiceResponse, useGetSettingValue } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useGetCommunity, useGetFreeOrCommunityCD } from '@common/utils/utils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SettingType } from '@common/constants/Utils'
import { NewEditServiceModal } from '@cd/components/PipelineSteps/DeployServiceStep/NewEditServiceModal'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { SortOption } from '@common/components/SortOption/SortOption'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import serviceEmptyStateSvg from '@cd/icons/ServiceDetailsEmptyState.svg'
import GetStartedWithCDButton from '@pipeline/components/GetStartedWithCDButton/GetStartedWithCDButton'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { Sort, SortFields } from '@common/utils/listUtils'
import ServicesGridView from '../ServicesGridView/ServicesGridView'
import ServicesListView from '../ServicesListView/ServicesListView'
import { ServicesQueryParams, ServiceTabs, useServicesQueryParamOptions } from '../utils/ServiceUtils'
import css from './ServicesListPage.module.scss'

interface ServicesListPageProps {
  setShowBanner?: (status: boolean) => void
}

export const ServicesListPage = ({ setShowBanner }: ServicesListPageProps): React.ReactElement => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const isCommunity = useGetCommunity()
  // const isSvcEnvEntityEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)
  // const isCdsV1EOLEnabled = useFeatureFlag(FeatureFlag.CDS_V1_EOL_BANNER)
  const {
    NG_SVC_ENV_REDESIGN: isSvcEnvEntityEnabled,
    CDS_V1_EOL_BANNER: isCdsV1EOLEnabled,
    NG_SETTINGS: isSettingsEnabled
  } = useFeatureFlags()

  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { fetchDeploymentList } = useServiceStore()
  const history = useHistory()
  const isFreeOrCommunityCD = useGetFreeOrCommunityCD()

  const { preference: savedSortOption, setPreference: setSavedSortOption } = usePreferenceStore<
    [SortFields, Sort] | undefined
  >(PreferenceScope.USER, 'sortOptionManageService')

  const queryParamOptions = useServicesQueryParamOptions()
  const queryParams = useQueryParams(queryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<ServicesQueryParams>()
  const { page, size } = queryParams

  const [sort, setSort] = useState<[SortFields, Sort]>(savedSortOption ?? queryParams.sort)
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useState(Views.LIST)
  const [mode, setMode] = useState<SelectedView>(SelectedView.VISUAL)
  const [isEdit, setIsEdit] = useState(false)
  const [serviceDetails, setServiceDetails] = useState({
    name: '',
    identifier: '',
    orgIdentifier,
    projectIdentifier,
    description: '',
    tags: {}
  })

  useEffect(() => {
    if (isEdit) {
      showModal()
    }
  }, [isEdit])

  const { data: forceDeleteSettings, error: forceDeleteSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_FORCE_DELETE,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: !isSettingsEnabled
  })

  useEffect(() => {
    if (forceDeleteSettingsError) {
      showError(getRBACErrorMessage(forceDeleteSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceDeleteSettingsError])

  const goToServiceDetails = useCallback(
    (selectedService: ServiceResponseDTO): void => {
      if (isCommunity) {
        const newServiceData = {
          name: defaultTo(selectedService.name, ''),
          identifier: defaultTo(selectedService.identifier, ''),
          orgIdentifier,
          projectIdentifier,
          description: defaultTo(selectedService.description, ''),
          tags: defaultTo(selectedService.tags, {})
        }
        setServiceDetails({ ...newServiceData })
        setIsEdit(true)
        return
      }
      if (selectedService?.identifier) {
        history.push({
          pathname: routes.toServiceStudio({
            accountId,
            orgIdentifier,
            projectIdentifier,
            serviceId: selectedService?.identifier,
            module
          }),
          search: isSvcEnvEntityEnabled
            ? `tab=${ServiceTabs.Configuration}`
            : projectIdentifier
            ? `tab=${ServiceTabs.SUMMARY}`
            : `tab=${ServiceTabs.REFERENCED_BY}`
        })
      } else {
        showError(getString('cd.serviceList.noIdentifier'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, orgIdentifier, projectIdentifier, module]
  )

  const onServiceCreate = useCallback(
    (values: ServiceResponseDTO): void => {
      if (isSvcEnvEntityEnabled) {
        goToServiceDetails(values)
      } else {
        ;(fetchDeploymentList.current as () => void)?.()
        hideModal()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => {
          hideModal()
          setIsEdit(false)
        }}
        title={isEdit ? getString('editService') : getString('cd.addService')}
        isCloseButtonShown
        className={cx('padded-dialog', css.dialogStyles)}
      >
        <Container>
          <NewEditServiceModal
            data={isEdit ? serviceDetails : { name: '', identifier: '', orgIdentifier, projectIdentifier }}
            isEdit={isEdit}
            isService={!isEdit}
            onCreateOrUpdate={values => {
              onServiceCreate(values)
              setIsEdit(false)
            }}
            closeModal={() => {
              hideModal()
              setIsEdit(false)
            }}
          />
        </Container>
      </Dialog>
    ),
    [fetchDeploymentList, orgIdentifier, projectIdentifier, mode, isEdit, serviceDetails]
  )

  const {
    loading,
    data: serviceList,
    refetch
  } = useGetServiceList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size,
      page,
      sort,
      searchTerm,

      includeVersionInfo: isCdsV1EOLEnabled
    },
    debounce: 500,
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  useEffect(() => {
    if (serviceList?.data?.content?.length && isCdsV1EOLEnabled) {
      const existV1Service = !!serviceList?.data?.content.find(({ service }: ServiceResponse) => !service?.v2Service)
      if (existV1Service && setShowBanner) {
        setShowBanner(true)
      }
    }
  }, [serviceList])

  useEffect(() => {
    fetchDeploymentList.current = refetch
  }, [fetchDeploymentList, refetch])

  const isForceDeleteEnabled = useMemo(
    () => forceDeleteSettings?.data?.value === 'true',
    [forceDeleteSettings?.data?.value]
  )

  return (
    <Page.Body className={css.pageBody}>
      <>
        <Layout.Horizontal
          padding={{ left: 'xlarge', right: 'xlarge', top: 'medium' }}
          flex={{ distribution: 'space-between' }}
        >
          <RbacButton
            intent="primary"
            data-testid="add-service"
            icon="plus"
            iconProps={{ size: 10 }}
            text={getString('newService')}
            permission={{
              permission: PermissionIdentifier.EDIT_SERVICE,
              resource: {
                resourceType: ResourceType.SERVICE
              }
            }}
            onClick={() => {
              showModal()
              setMode(SelectedView.VISUAL)
            }}
          />
          <Layout.Horizontal className={css.sortClass}>
            <ExpandingSearchInput
              placeholder={getString('search')}
              throttle={200}
              onChange={(val: string) => {
                setSearchTerm(val.trim())
              }}
              alwaysExpanded={true}
            />
            <SortOption
              setSort={setSort}
              sort={sort}
              setSavedSortOption={newSort => {
                setSavedSortOption(newSort)
                updateQueryParams({ sort: newSort })
              }}
            />
            <GridListToggle initialSelectedView={Views.LIST} onViewToggle={setView} />
          </Layout.Horizontal>
        </Layout.Horizontal>

        <Layout.Vertical
          margin={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}
          className={css.container}
        >
          {(serviceList && serviceList.data?.content?.length) || loading ? (
            view === Views.GRID ? (
              <ServicesGridView
                data={serviceList}
                loading={loading}
                onRefresh={() => refetch()}
                onServiceSelect={async service => goToServiceDetails(service)}
                isForceDeleteEnabled={isForceDeleteEnabled}
              />
            ) : (
              <ServicesListView
                data={serviceList}
                loading={loading}
                onRefresh={() => refetch()}
                onServiceSelect={async service => goToServiceDetails(service)}
                isForceDeleteEnabled={isForceDeleteEnabled}
              />
            )
          ) : (
            <Container flex={{ align: 'center-center' }} height="80vh">
              <Layout.Vertical flex={{ alignItems: 'center' }}>
                <img src={serviceEmptyStateSvg} width={300} height={150} />
                <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
                  {getString('cd.noService')}
                </Heading>
                {isFreeOrCommunityCD && <GetStartedWithCDButton />}
                <RbacButton
                  {...(isFreeOrCommunityCD ? { variation: ButtonVariation.LINK } : { intent: 'primary' })}
                  data-testid="add-service"
                  icon="plus"
                  iconProps={{ size: 10 }}
                  text={getString('newService')}
                  permission={{
                    permission: PermissionIdentifier.EDIT_SERVICE,
                    resource: {
                      resourceType: ResourceType.SERVICE
                    }
                  }}
                  onClick={() => {
                    showModal()
                    setMode(SelectedView.VISUAL)
                  }}
                />
              </Layout.Vertical>
            </Container>
          )}
        </Layout.Vertical>
      </>
    </Page.Body>
  )
}
