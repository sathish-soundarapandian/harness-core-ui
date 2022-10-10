/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Checkbox, Layout, Tabs } from '@harness/uicore'
import { computeOptimisedInstances, generalPurposeInstances, sizes } from './data'
import css from './ScaleAndLimitPoliciesTab.module.scss'

interface InstanceFamiliesSelectorTableProps {
  gridData: Record<string, string[]>
}

const InstanceFamiliesSelectorTable: React.FC<InstanceFamiliesSelectorTableProps> = ({ gridData }) => {
  const modifiedGridData = useMemo(() => {
    const map: Record<string, Record<string, boolean>> = {}
    Object.entries(gridData).forEach(([key, arr]) => {
      const sizesMap: Record<string, boolean> = {}
      arr.forEach(size => {
        sizesMap[size] = true
      })
      map[key] = sizesMap
    })
    return map
  }, [gridData])

  // const [selectedInstances, setSelectedInstances] = useState({})

  // const handleSelection = e => {
  //   console.log(e.target)
  //   console.log(e.target.dataset)
  // }

  return (
    <table className={css.instanceFamiliesTable}>
      <tr>
        <td></td>
        {sizes.map(size => (
          <th key={size} scope="col">
            {size}
          </th>
        ))}
      </tr>
      {Object.entries(modifiedGridData).map(([type, sizeMap]) => {
        return (
          <tr key={type} className={css.rowHeader}>
            <th scope="row">{type}</th>
            {sizes.map(size => {
              return (
                <td key={size}>
                  {sizeMap[size] ? (
                    <Layout.Vertical flex>
                      <Checkbox data-type={type} data-size={size} />
                    </Layout.Vertical>
                  ) : null}
                </td>
              )
            })}
          </tr>
        )
      })}
    </table>
  )
}

const InstanceFamililesByCategories: React.FC = () => {
  return (
    <Tabs
      id="instanceFamilies"
      defaultSelectedTabId={1}
      tabList={[
        {
          id: 1,
          title: 'General Purpose',
          panel: <InstanceFamiliesSelectorTable gridData={generalPurposeInstances} />
        },
        {
          id: 2,
          title: 'Compute Optimized',
          panel: <InstanceFamiliesSelectorTable gridData={computeOptimisedInstances} />
        }
      ]}
    />
  )
}

export default InstanceFamililesByCategories
