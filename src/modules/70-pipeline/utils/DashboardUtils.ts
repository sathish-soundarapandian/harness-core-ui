/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TooltipFormatterContextObject } from 'highcharts'
import { defaultTo, isUndefined } from 'lodash-es'

interface PointStats {
  deployments?: {
    failure?: number
    success?: number
    total?: number
  }
  time?: number
}

/* istanbul ignore next */
export const renderTooltipContent = ({
  time,
  failureRate,
  count,
  successCount,
  failureCount,
  activeCount
}: {
  time: string | number
  failureRate: string | number
  count?: number
  successCount?: number
  failureCount?: number
  activeCount?: number
}) => {
  return `<div style="padding: 16px; color: white; width: 282px; height: 128px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 0.5px solid rgba(243, 243, 250); padding-bottom: 7px; margin-bottom: 15px;">
          <div style="font-weight: normal; font-size: 12px; line-height: 18px; opacity: 0.8;">${time}</div>
          <div>
            <span style="white-space: pre; font-weight: bold; font-size: 12px; line-height: 18px; opacity: 0.8;">Deployments: </span>
            <span style="font-weight: bold; font-size: 12px; line-height: 18px;">${count}</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p style="font-weight: 500; font-size: 10px; line-height: 14px; letter-spacing: 0.2px; color: #D9DAE6; margin-bottom: 0px;">Failure Rate</p>
            <p style="font-weight: 600; font-size: 28px; line-height: 38px; color: #FBE6E4;">${failureRate}</p>
          </div>
          <div style="margin-right: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <div style="height: 6px; width: 12px; background-color: #5FB34E; border-radius: 16px; display: inline-block; margin-right: 8px"></div>
              <span style="white-space: pre; font-weight: bold; font-size: 12px; line-height: 16px; letter-spacing: 0.2px; opacity: 0.8;">Success </span>
              <span style="font-weight: bold; font-size: 12px; line-height: 16px; letter-spacing: 0.2px;">${successCount}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <div style="height: 6px; width: 12px; background-color: #EE5F54; border-radius: 16px; display: inline-block; margin-right: 8px"></div>
              <span style="white-space: pre; font-weight: bold; font-size: 12px; line-height: 18px; opacity: 0.8;">Failed </span>
              <span style="font-weight: bold; font-size: 12px; line-height: 18px;">${failureCount}</span>
            </div>
            ${
              isUndefined(activeCount)
                ? ``
                : `<div style="display: flex; align-items: center;">
              <div style="height: 6px; width: 12px; background-color: var(--primary-4); border-radius: 16px; display: inline-block; margin-right: 8px"></div>
              <span style="white-space: pre; font-weight: bold; font-size: 12px; line-height: 18px; opacity: 0.8;">Active </span>
              <span style="font-weight: bold; font-size: 12px; line-height: 18px;">${activeCount}</span>
            </div>`
            }
          </div>
        </div>
      </div>`
}

/* istanbul ignore next */
export const getTooltip = (currPoint: TooltipFormatterContextObject): string => {
  const custom = currPoint?.series?.userOptions?.custom
  const point: PointStats = custom?.[currPoint.key]
  const time =
    point && point?.time
      ? new Date(point?.time).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
      : currPoint.x
  let failureRate: string | number = 'Infinity'
  if (point?.deployments?.failure && point.deployments?.total) {
    failureRate = ((point.deployments.failure / point.deployments.total) * 100).toFixed(1) + '%'
  }
  if (point?.deployments?.failure === 0) {
    failureRate = '0'
  }
  const failureCount = defaultTo(point?.deployments?.failure, 0)
  const successCount = defaultTo(point?.deployments?.success, 0)
  const activeCount = defaultTo(point?.deployments?.total, 0) - (successCount + failureCount)
  return renderTooltipContent({
    time,
    failureRate,
    count: point?.deployments?.total,
    successCount,
    failureCount,
    activeCount
  })
}
