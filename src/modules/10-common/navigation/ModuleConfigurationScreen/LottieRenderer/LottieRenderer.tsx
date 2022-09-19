/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import type { Asset } from 'contentful'
import { Container } from '@harness/uicore'
import Lottie from 'react-lottie-player'
import type { ModuleName } from 'framework/types/ModuleName'

interface LottieComponentProps {
  activeModule: ModuleName
  json: Asset
}

const LottieRenderer: React.FC<LottieComponentProps> = ({ json: asset }) => {
  const [lottieJson, setLottieJson] = useState<object | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lottieJson) {
      setLoading(true)
      fetch(`//${asset.fields.file.url}`)
        .then(res => res.json())
        .then(res => {
          setLoading(false)
          setLottieJson(res)
        })
    }
  }, [lottieJson])

  if (loading) {
    return null
  }

  return (
    <Container flex height="100%">
      <Lottie animationData={lottieJson} play />
    </Container>
  )
}

export default LottieRenderer
