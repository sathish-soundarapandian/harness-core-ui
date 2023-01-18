/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, NoDataCard, PageError } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { MonacoDiffEditor } from 'react-monaco-editor'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import noDataImage from '@cv/assets/noData.svg'
import { useGetOSByID } from 'services/cf'
import { useStrings } from 'framework/strings'

export default function YAMLDiffView({ url }: { url: string }): JSX.Element {
  const { getString } = useStrings()

  const objectIdentifiers = url.split('/').pop()
  const {
    data: snapshotData,
    loading,
    error,
    refetch
  } = useGetOSByID({ identifiers: objectIdentifiers?.split(',') || [] })
  const { data } = snapshotData || {}

  if (loading) {
    return (
      <Layout.Horizontal height={140} flex={{ align: 'center-center' }}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Layout.Horizontal>
    )
  } else if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  } else if (data?.objectsnapshots && data.objectsnapshots.length === 2) {
    const {
      objectsnapshots: [oldYaml, newYaml]
    } = data
    return (
      <MonacoDiffEditor
        width="100%"
        height="400"
        language="yaml"
        original={yamlStringify(oldYaml.value)}
        value={yamlStringify(newYaml.value)}
      />
    )
  } else {
    return (
      <NoDataCard message={getString('cv.changeSource.FeatureFlag.noDataAvailableForYAMLDiff')} image={noDataImage} />
    )
  }
}
