/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Text, Icon, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

interface SvgInlineProps {
  url: string
  className?: string
}

const SvgInline: React.FC<SvgInlineProps> = ({ url, className }) => {
  const [svg, setSvg] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(undefined)

  const { getString } = useStrings()

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    fetch(url)
      .then(res => res.text())
      .then(setSvg)
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))
    return () => {
      isMounted = false
    }
  }, [url])

  if (loading) {
    return <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
  }

  if (error) {
    return (
      <Layout.Horizontal spacing={'small'}>
        <Icon name="error" size={32} color={Color.RED_500} />
        <Text font={{ align: 'center' }} color={Color.RED_500}>
          {error.message || getString('somethingWentWrong')}
        </Text>
      </Layout.Horizontal>
    )
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}

export default SvgInline
