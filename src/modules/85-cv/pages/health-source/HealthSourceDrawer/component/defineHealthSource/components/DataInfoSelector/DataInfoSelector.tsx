import React from 'react'
import { Container, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetAllAwsRegions, useGetPrometheusWorkspaces } from 'services/cv'
import { getRegionsDropdownOptions, getWorkspaceDropdownOptions } from '../../DefineHealthSource.utils'
import { DataSourceTypeFieldNames } from '../../DefineHealthSource.constant'

export default function DataInfoSelector({ isEdit }: { isEdit?: boolean }): JSX.Element {
  const { getString } = useStrings()

  const { data: responseData, loading: regionsLoading } = useGetAllAwsRegions({})

  const { data: workspaceResponse, loading: workspaceLoading } = useGetPrometheusWorkspaces({})

  const regionPlaceholderText = regionsLoading
    ? getString('loading')
    : getString('cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder')

  const workspacePlaceholderText = workspaceLoading
    ? getString('loading')
    : getString('cv.healthSource.awsWorkspacePlaceholderText')

  const regionItems = getRegionsDropdownOptions(responseData?.data)
  const workspaceItems = getWorkspaceDropdownOptions(workspaceResponse?.data)

  return (
    <Container margin={{ bottom: 'large' }} width={400} data-testid="dataInfoSelector">
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
        disabled={workspaceLoading || isEdit}
        label={getString('cv.healthSource.awsWorkspaceLabel')}
        tooltipProps={{ dataTooltipId: 'healthSourcesAWSWorkspace' }}
      />
    </Container>
  )
}
