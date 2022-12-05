/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { transformMatrixLabels } from './utils'
import css from './MatrixNodeLabelWrapper.module.scss'

function MatrixNodeNameLabelWrapper({
  nodeName = '',
  matrixNodeName = ''
}: {
  nodeName: string
  matrixNodeName: string
}): JSX.Element {
  return (
    <div className={css.matrixLabelWrapper}>
      {Object.entries(matrixNodeName).map(([key, value]) => {
        const labelsMap = transformMatrixLabels(value).split('\n')
        const nestedValue = (): JSX.Element[] => {
          return labelsMap.map((obj: string) => {
            const [labelKey, labelValue] = obj.split(':')
            return !labelValue ? (
              <React.Fragment key={labelKey}>{labelKey}</React.Fragment>
            ) : (
              // matrix object
              <div className="matrixLabelNestedWrapper" key={labelKey}>
                <br />
                <b>{labelKey}</b>: {labelValue}
                <br />
              </div>
            )
          })
        }

        return (
          <React.Fragment key={key}>
            <b>{key}</b>: {nestedValue()}
            <br />
          </React.Fragment>
        )
      })}
      <b>{nodeName}</b>
    </div>
  )
}

export default MatrixNodeNameLabelWrapper
