/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

function MatrixNodeNameLabelWrapper({ matrixLabel = '' }: { matrixLabel: string }): JSX.Element {
  const data = (matrixLabel as unknown as string).split('\n')
  return (
    <div>
      {data.map((obj: string) => {
        const [name, value] = obj.split(':')
        return (
          <React.Fragment key={name}>
            <b>{name}</b>: {value}
            <br />
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default MatrixNodeNameLabelWrapper
