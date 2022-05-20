/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Container } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { DashboardTag, DashboardType, IDashboard } from '@dashboards/types/DashboardTypes'
import moduleTagCss from '@dashboards/common/ModuleTags.module.scss'

export interface DashboardTagProps {
  dashboard?: IDashboard
}

const DashboardTags: React.FC<DashboardTagProps> = ({ dashboard }) => {
  const { getString } = useStrings()
  return (
    <Container className={moduleTagCss.predefinedTags}>
      {dashboard?.type === DashboardType.SHARED && (
        <section className={moduleTagCss.harnessTag}>{getString('dashboards.modules.harness')}</section>
      )}
      {dashboard?.data_source.map((tag: DashboardTag | string) => {
        if (tag === DashboardTag.CE) {
          return <section className={moduleTagCss.ceTag}>{getString('common.purpose.ce.cloudCost')}</section>
        }
        if (tag === DashboardTag.CI) {
          return <section className={moduleTagCss.ciTag}>{getString('buildsText')}</section>
        }
        if (tag === DashboardTag.CD) {
          return <section className={moduleTagCss.cdTag}>{getString('deploymentsText')}</section>
        }
        if (tag === DashboardTag.CF) {
          return <section className={moduleTagCss.cfTag}>{getString('common.purpose.cf.continuous')}</section>
        }
        if (tag === DashboardTag.CG_CD) {
          return <section className={moduleTagCss.cgCdTag}>{getString('dashboards.modules.cgDeployments')}</section>
        }
        return <></>
      })}
      {dashboard?.description &&
        dashboard.type === DashboardType.ACCOUNT &&
        dashboard?.description.split(',').map((tag: string, index: number) => {
          return (
            <section className={moduleTagCss.customTag} key={tag + index}>
              {tag}
            </section>
          )
        })}
    </Container>
  )
}

export default DashboardTags
