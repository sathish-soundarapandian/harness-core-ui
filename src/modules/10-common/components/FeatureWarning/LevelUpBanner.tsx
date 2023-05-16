/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactNode } from 'react';
import React from 'react'
import { Layout } from '@harness/uicore'
import cx from 'classnames'

import type { Module } from 'framework/types/ModuleName'
import { ExplorePlansBtn, LevelUpText, ViewUsageLink } from '../../layouts/FeatureUtils'
import css from '../../layouts/layouts.module.scss'

export interface LevelUpBannerProps {
  message: ReactNode
  module?: Module
}

const LevelUpBanner: React.FC<LevelUpBannerProps> = ({ message, module = 'cd' }) => {
  return (
    <div className={cx(css.featuresBanner, css.levelUp)}>
      <Layout.Horizontal width="95%" padding={{ left: 'large' }}>
        <LevelUpText message={message} />
        <ViewUsageLink module={module} />
        <ExplorePlansBtn module={module} />
      </Layout.Horizontal>
    </div>
  )
}

export default LevelUpBanner
