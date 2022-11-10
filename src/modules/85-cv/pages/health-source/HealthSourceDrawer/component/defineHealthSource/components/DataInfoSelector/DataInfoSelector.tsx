import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import { Container, FormInput, Utils } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetAllAwsRegions, useGetPrometheusWorkspaces } from 'services/cv'
import { getRegionsDropdownOptions, getWorkspaceDropdownOptions } from '../../DefineHealthSource.utils'
import { DataSourceTypeFieldNames } from '../../DefineHealthSource.constant'
import type { DefineHealthSourceFormInterface } from '../../DefineHealthSource.types'

export default function DataInfoSelector({ isEdit }: { isEdit?: boolean }): JSX.Element {
  const { getString } = useStrings()

  const { values, setFieldValue } = useFormikContext<DefineHealthSourceFormInterface>()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { region, connectorRef, workspaceId } = values || {}

  const { data: responseData, loading: regionsLoading } = useGetAllAwsRegions({})

  const {
    data: workspaceResponse,
    loading: workspaceLoading,
    refetch: fetchWorkspaceId
  } = useGetPrometheusWorkspaces({
    lazy: true
  })

  useEffect(() => {
    if (region) {
      if (!isEdit) {
        setFieldValue(DataSourceTypeFieldNames.WorkspaceId, '')
      }
      fetchWorkspaceId({
        queryParams: {
          region,
          accountId,
          orgIdentifier,
          projectIdentifier,
          connectorIdentifier: connectorRef as string,
          tracingId: Utils.randomId()
        }
      })
    }
  }, [accountId, connectorRef, orgIdentifier, projectIdentifier, region, isEdit])

  const regionPlaceholderText = regionsLoading
    ? getString('loading')
    : getString('cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder')

  const workspacePlaceholderText = workspaceLoading
    ? getString('loading')
    : getString('cv.healthSource.awsWorkspacePlaceholderText')

  const regionItems = getRegionsDropdownOptions(responseData?.data)
  const workspaceItems = getWorkspaceDropdownOptions(workspaceResponse?.data)

  return (
    <Container margin={{ bottom: 'large' }} key={`${region}-${workspaceId}`} width={400} data-testid="dataInfoSelector">
      <FormInput.Select
        usePortal
        items={regionItems}
        placeholder={regionPlaceholderText}
        name={DataSourceTypeFieldNames.Region}
        disabled={regionsLoading || isEdit}
        label={getString('cv.healthSource.awsRegionLabel')}
        tooltipProps={{ dataTooltipId: 'healthSourcesAWSRegion' }}
      />
      <FormInput.Select
        usePortal
        items={workspaceItems}
        placeholder={workspacePlaceholderText}
        name={DataSourceTypeFieldNames.WorkspaceId}
        disabled={workspaceLoading || isEdit || !region || !connectorRef}
        label={getString('cv.healthSource.awsWorkspaceLabel')}
        tooltipProps={{ dataTooltipId: 'healthSourcesAWSWorkspace' }}
      />
    </Container>
  )
}
