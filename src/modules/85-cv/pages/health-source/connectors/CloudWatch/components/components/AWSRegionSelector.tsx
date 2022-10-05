import React, { useMemo } from 'react'
import { Container, FormInput } from '@harness/uicore'
import { useGetRegions } from 'services/cv'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import { CloudWatchProperties } from '../../CloudWatchConstants'
import { getRegionsDropdownOptions } from '../../CloudWatch.utils'
import css from '../../CloudWatch.module.scss'

export default function AWSRegionSelector(): JSX.Element {
  const { getString } = useStrings()

  const { data: responseData, loading } = useGetRegions({})

  const regionDropdownItems = useMemo(() => getRegionsDropdownOptions(responseData?.data), [responseData])

  const placeholderText = loading
    ? getString('loading')
    : getString('cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder')

  const items = loading ? [] : regionDropdownItems

  return (
    <CardWithOuterTitle title={getString('cd.serviceDashboard.awsRegion')}>
      <Container width={300}>
        <FormInput.Select
          className={css.awsRegionSelector}
          placeholder={placeholderText}
          name={CloudWatchProperties.region}
          items={items}
        ></FormInput.Select>
      </Container>
    </CardWithOuterTitle>
  )
}
