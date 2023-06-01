import React from 'react'

import { Container, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import ListRows from './ListRows/ListRows'
import ListHeaders from './ListHeaders/ListHeaders'
import { useServiceOverridesContext } from '../context/ServiceOverrideContext'
import { noOverridesStringMap } from '../ServiceOverridesUtils'
import NewServiceOverrideButton from './NewServiceOverrideButton'

export default function BaseServiceOverrides(): React.ReactElement {
  const { getString } = useStrings()
  const { serviceOverrideType, listRowItems } = useServiceOverridesContext()

  const showOverridesList = Array.isArray(listRowItems) && listRowItems.length > 0

  return (
    <Container padding={{ right: 'xlarge', left: 'xlarge' }}>
      <Layout.Horizontal border={{ bottom: true }} padding={{ bottom: 'medium' }}>
        <NewServiceOverrideButton />
      </Layout.Horizontal>
      {showOverridesList ? (
        <>
          <ListHeaders />
          <ListRows />
        </>
      ) : (
        <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'center' }} height={'82vh'} spacing={'medium'}>
          <Text>{getString(noOverridesStringMap[serviceOverrideType])}</Text>
          <NewServiceOverrideButton />
        </Layout.Vertical>
      )}
    </Container>
  )
}
