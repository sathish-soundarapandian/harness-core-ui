import React from 'react'
import { ButtonVariation, NoDataCard } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import slosEmptyState from '@cv/assets/slosEmptyState.svg'
import RbacButton from '@rbac/components/Button/Button'
import routes from '@common/RouteDefinitions'
import { monitoredService } from '@cv/pages/monitored-service/CVMonitoredService/__test__/CVMonitoredService.mock'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getClassNameForMonitoredServicePage } from '../CVSLOListingPage.utils'
import css from '../CVSLOsListingPage.module.scss'

export const CVSLONoDataPage = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const getAddSLOButton = (): JSX.Element => (
    <RbacButton
      icon="plus"
      text={getString('cv.slos.createSLO')}
      variation={ButtonVariation.PRIMARY}
      onClick={() => {
        history.push({
          pathname: routes.toCVCreateSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }),
          search: monitoredService?.identifier ? `?monitoredServiceIdentifier=${monitoredService.identifier}` : ''
        })
      }}
      className={getClassNameForMonitoredServicePage(css.createSloInMonitoredService, monitoredService?.identifier)}
      permission={{
        permission: PermissionIdentifier.EDIT_SLO_SERVICE,
        resource: {
          resourceType: ResourceType.SLO,
          resourceIdentifier: projectIdentifier
        }
      }}
    />
  )
  return (
    <NoDataCard
      message={getString('cv.slos.noSLOsStateMessage')}
      messageTitle={getString('cv.slos.noData')}
      button={getAddSLOButton()}
      image={slosEmptyState}
    />
  )
}
