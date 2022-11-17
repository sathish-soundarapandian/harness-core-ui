/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { ButtonVariation, Text, Layout, useConfirmationDialog, useToaster, ButtonSize } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import type { SLOErrorBudgetResetDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import ReviewChangeSVG from '@cv/assets/sloReviewChange.svg'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useErrorBudgetRestHook } from '@cv/hooks/useErrorBudgetRestHook/useErrorBudgetRestHook'
import { useLogContentHook } from '@cv/hooks/useLogContentHook/useLogContentHook'
import { LogTypes } from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import { PeriodTypeEnum } from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy.constants'
import { SLODetailsPageTabIds } from '../../CVSLODetailsPage.types'
import type { TabToolbarProps } from '../DetailsPanel.types'
import css from '../DetailsPanel.module.scss'

const TabToolbar: React.FC<TabToolbarProps> = ({
  sloDashboardWidget,
  resetErrorBudget,
  deleteSLO,
  refetchSLODetails,
  onTabChange
}) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { monitoredServiceIdentifier } = useQueryParams<{ monitoredServiceIdentifier?: string }>()
  const [errorBudgetResetData, setErrorBudgetResetData] = useState<SLOErrorBudgetResetDTO | null>()

  const { sloIdentifier, title, serviceName, environmentName } = sloDashboardWidget

  const onResetErrorBudget = async (formData: SLOErrorBudgetResetDTO): Promise<void> => {
    try {
      await resetErrorBudget(formData, { pathParams: { identifier: sloIdentifier } })
      await refetchSLODetails()

      showSuccess(getString('cv.errorBudgetIsSuccessfullyReset'))
    } catch (e) {
      /* istanbul ignore next */ showError(getErrorMessage(e))
    }
  }

  const { openDialog: confirmReviewChanges } = useConfirmationDialog({
    intent: Intent.WARNING,
    titleText: getString('cv.slos.reviewChanges'),
    contentText: (
      <Layout.Horizontal padding={{ right: 'xxlarge' }}>
        <Text color={Color.GREY_800}>{getString('cv.slos.sloEditWarningMessage')}</Text>
        <div>
          <img src={ReviewChangeSVG} width="145px" height="200px" alt="" />
        </div>
      </Layout.Horizontal>
    ),
    confirmButtonText: getString('common.ok'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed && errorBudgetResetData) {
        onResetErrorBudget(errorBudgetResetData)
      }
      setErrorBudgetResetData(null)
    }
  })

  const { openErrorBudgetReset } = useErrorBudgetRestHook({
    onSuccess: values => {
      setErrorBudgetResetData(values)
      confirmReviewChanges()
    }
  })

  const { openLogContentHook } = useLogContentHook({
    sloIdentifier,
    serviceName,
    envName: environmentName
  })

  const onDelete = async (): Promise<void> => {
    try {
      await deleteSLO(sloIdentifier)

      showSuccess(getString('cv.slos.sloDeleted', { name: title }))

      if (monitoredServiceIdentifier) {
        history.push({
          pathname: routes.toCVAddMonitoringServicesEdit({
            accountId,
            orgIdentifier,
            projectIdentifier,
            identifier: monitoredServiceIdentifier
          })
        })
      } else {
        history.push({
          pathname: routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier })
        })
      }
    } catch (e) {
      /* istanbul ignore next */ showError(getErrorMessage(e))
    }
  }

  const { openDialog: confirmDeleteSLO } = useConfirmationDialog({
    titleText: getString('common.delete', { name: title }),
    contentText: <Text color={Color.GREY_800}>{getString('cv.slos.confirmDeleteSLO', { name: title })}</Text>,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        onDelete()
      }
    }
  })

  return (
    <>
      <RbacButton
        icon="Edit"
        withoutCurrentColor
        text={getString('edit')}
        size={ButtonSize.SMALL}
        iconProps={{ color: Color.GREY_700, size: 14 }}
        onClick={() => onTabChange(SLODetailsPageTabIds.Configurations)}
        variation={ButtonVariation.LINK}
        className={css.tabLink}
        permission={{
          permission: PermissionIdentifier.EDIT_SLO_SERVICE,
          resource: {
            resourceType: ResourceType.SLO,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
      {sloDashboardWidget.sloTargetType === PeriodTypeEnum.CALENDAR && (
        <RbacButton
          icon="reset"
          withoutCurrentColor
          size={ButtonSize.SMALL}
          text={getString('cv.resetErrorBudget')}
          iconProps={{ color: Color.GREY_700, size: 12 }}
          onClick={() => openErrorBudgetReset(sloDashboardWidget)}
          variation={ButtonVariation.LINK}
          className={css.tabLink}
          permission={{
            permission: PermissionIdentifier.EDIT_SLO_SERVICE,
            resource: {
              resourceType: ResourceType.SLO,
              resourceIdentifier: projectIdentifier
            }
          }}
        />
      )}
      <RbacButton
        icon="audit-trail"
        withoutCurrentColor
        size={ButtonSize.SMALL}
        iconProps={{ size: 17 }}
        text={getString('cv.executionLogs')}
        onClick={() => openLogContentHook(LogTypes.ExecutionLog)}
        variation={ButtonVariation.LINK}
        className={css.tabLink}
        permission={{
          permission: PermissionIdentifier.VIEW_SLO_SERVICE,
          resource: {
            resourceType: ResourceType.SLO,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
      <RbacButton
        icon="api-docs"
        withoutCurrentColor
        size={ButtonSize.SMALL}
        text={getString('cv.externalAPICalls')}
        iconProps={{ color: Color.GREY_700, size: 18 }}
        onClick={() => openLogContentHook(LogTypes.ApiCallLog)}
        variation={ButtonVariation.LINK}
        className={css.tabLink}
        permission={{
          permission: PermissionIdentifier.VIEW_SLO_SERVICE,
          resource: {
            resourceType: ResourceType.SLO,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
      <RbacButton
        icon="trash"
        withoutCurrentColor
        size={ButtonSize.SMALL}
        text={getString('delete')}
        iconProps={{ color: Color.GREY_700, size: 13 }}
        onClick={() => confirmDeleteSLO()}
        variation={ButtonVariation.LINK}
        className={css.tabLink}
        permission={{
          permission: PermissionIdentifier.DELETE_SLO_SERVICE,
          resource: {
            resourceType: ResourceType.SLO,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
    </>
  )
}

export default TabToolbar
