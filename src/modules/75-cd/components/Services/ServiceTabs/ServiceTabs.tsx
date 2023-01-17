/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { useModalHook } from '@harness/use-modal'
import {
  Button,
  Container,
  Dialog,
  ExpandingSearchInput,
  Layout,
  Page,
  useToaster,
  VisualYamlSelectedView as SelectedView
} from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { ServiceResponseDTO } from 'services/cd-ng'
import { useGetCommunity } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'
import { NewEditServiceModal } from '@cd/components/PipelineSteps/DeployServiceStep/NewEditServiceModal'
import { useStateWithQueryParams } from '@common/hooks/useStateWithQueryParams'
import { TimeRangeSelector, TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { convertStringToDateTimeRange } from '@cd/pages/dashboard/dashboardUtils'
import { ServicesDashboardPage } from '../ServicesDashboardPage/ServicesDashboardPage'
import { ServicesListPage } from '../ServicesListPage/ServicesListPage'
import { useServiceStore } from '../common'
import { ServiceTabs } from '../utils/ServiceUtils'

import css from './ServiceTabs.module.scss'

enum Tabs {
  DASHBOARD = 'DASHBOARD',
  MANAGESERVICE = 'MANAGESERVICE'
}

interface ServiceTabProps {
  timeRange: TimeRangeSelectorProps
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRangeSelectorProps>>
}

export const ServiceTab = (props: ServiceTabProps) => {
  const { setTimeRange, timeRange } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const isSvcEnvEntityEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)
  const { showError } = useToaster()
  const { fetchDeploymentList } = useServiceStore()
  const isCommunity = useGetCommunity()
  const history = useHistory()
  const [mode, setMode] = useState<SelectedView>(SelectedView.VISUAL)
  const [view, setView] = useStateWithQueryParams({ key: 'view' })
  const [isEdit, setIsEdit] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const resultTimeFilterRange = convertStringToDateTimeRange(timeRange)
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
          search: isSvcEnvEntityEnabled ? `tab=${ServiceTabs.Configuration}` : `tab=${ServiceTabs.SUMMARY}`
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

  return (
    <>
      <Page.SubHeader className={css.pageHeader}>
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
        <Layout.Horizontal height="inherit" flex={{ alignItems: 'flex-end' }} spacing="small">
          <Button
            text={getString('dashboardLabel')}
            minimal
            className={cx({ [css.selectedTabs]: view !== Tabs.MANAGESERVICE })}
            intent={view !== Tabs.MANAGESERVICE ? 'primary' : 'none'}
            onClick={() => setView(Tabs.DASHBOARD)}
          />
          <Button
            text={getString('cd.serviceDashboard.manageServiceLabel')}
            minimal
            className={cx({ [css.selectedTabs]: view === Tabs.MANAGESERVICE })}
            intent={view === Tabs.MANAGESERVICE ? 'primary' : 'none'}
            onClick={() => setView(Tabs.MANAGESERVICE)}
          />
        </Layout.Horizontal>
        <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge" className={css.toolbar} width={250}>
          {view !== Tabs.MANAGESERVICE ? (
            <TimeRangeSelector timeRange={resultTimeFilterRange?.range} setTimeRange={setTimeRange} minimal />
          ) : (
            <ExpandingSearchInput
              alwaysExpanded
              width={200}
              placeholder={getString('search')}
              onChange={(query: string) => setSearchTerm(query)}
            />
          )}
        </Layout.Horizontal>
      </Page.SubHeader>
      {view !== Tabs.MANAGESERVICE ? (
        <ServicesDashboardPage />
      ) : (
        <ServicesListPage isServiceDashboard searchTerm={searchTerm} />
      )}
    </>
  )
}
