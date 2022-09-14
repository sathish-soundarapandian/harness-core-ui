import React, { useMemo } from 'react'
import { Container, FormInput } from '@harness/uicore'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import { useStrings } from 'framework/strings'
import { CloudWatchProperties } from '../../CloudWatchConstants'
import { getRegionsDropdownOptions } from '../../CloudWatch.utils'
import css from '../../CloudWatch.module.scss'

export default function AWSRegionSelector(): JSX.Element {
  const { getString } = useStrings()

  //   🚨 TODO: Fetch dropdown values from API
  const { data } = {
    status: 'SUCCESS',
    data: [
      'ap-south-1',
      'eu-south-1',
      'us-gov-east-1',
      'me-central-1',
      'ca-central-1',
      'eu-central-1',
      'us-west-1',
      'us-west-2',
      'af-south-1',
      'eu-west-3',
      'eu-north-1',
      'eu-west-2',
      'eu-west-1',
      'ap-northeast-3',
      'ap-northeast-2',
      'ap-northeast-1',
      'me-south-1',
      'sa-east-1',
      'ap-east-1',
      'cn-north-1',
      'us-gov-west-1',
      'ap-southeast-1',
      'ap-southeast-2',
      'ap-southeast-3',
      'us-east-1',
      'us-east-2',
      'cn-northwest-1'
    ],
    metaData: null,
    correlationId: 'd1f322c3-1551-4338-beea-3c8702e9b908'
  }

  const regionDropdownItems = useMemo(() => getRegionsDropdownOptions(data), [data])

  return (
    <CardWithOuterTitle title={getString('cd.serviceDashboard.awsRegion')}>
      <Container width={300}>
        <FormInput.Select
          className={css.awsRegionSelector}
          placeholder={getString('cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder')}
          name={CloudWatchProperties.region}
          items={regionDropdownItems}
        ></FormInput.Select>
      </Container>
    </CardWithOuterTitle>
  )
}
