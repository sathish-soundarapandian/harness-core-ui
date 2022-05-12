/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import cx from 'classnames'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Event, DiagramType } from '@pipeline/components/Diagram'
import { useStrings } from 'framework/strings'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'
import { NodeType } from '../../DiagramFactory'
import css from './StepGroupNode.module.scss'

export function CIDependencyNode(props: any): JSX.Element {
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(false)
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component

  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const stepsData = props?.data?.steps
  const { getString } = useStrings()
  React.useEffect(() => {
    props?.updateGraphLinks?.()
  }, [isNodeCollapsed])

  return (
    <>
      {isNodeCollapsed && DefaultNode ? (
        <DefaultNode
          onClick={() => {
            setNodeCollapsed(false)
          }}
          {...props}
          icon="step-group"
          readonly
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            className={cx(
              css.stepGroup,
              { [css.firstnode]: !props?.isParallelNode },
              { [css.marginBottom]: props?.isParallelNode }
            )}
          >
            <div id={props?.id} className={css.horizontalBar}></div>
            <div className={css.stepGroupHeader}>
              <Layout.Horizontal
                spacing="xsmall"
                onMouseOver={e => {
                  e.stopPropagation()
                }}
                onMouseOut={e => {
                  e.stopPropagation()
                }}
              >
                <Icon
                  className={css.collapseIcon}
                  name="minus"
                  onClick={e => {
                    e.stopPropagation()
                    setNodeCollapsed(true)
                  }}
                />
                <Text lineClamp={1}>{props.name}</Text>
              </Layout.Horizontal>
            </div>
            <div className={css.stepGroupBody}>
              <div className={css.createnodecimain}>
                {CreateNode && !props.readonly && (
                  <CreateNode
                    {...props}
                    className={css.createnodeci}
                    titleClassName={cx(css.createnodecititle, css.nodeNameText)}
                    isInsideStepGroup={true}
                    onClick={(event: any) => {
                      props?.fireEvent?.({
                        type: Event.ClickNode,
                        target: event.target,
                        data: {
                          identifier: props?.identifier,
                          parentIdentifier: props?.identifier,
                          entityType: DiagramType.CreateNew,
                          node: props
                        }
                      })
                    }}
                    name={getString('pipelines-studio.addDependency')}
                  />
                )}
              </div>
              {props.data?.steps?.length > 0 && (
                <StepGroupGraph
                  hideLinks
                  hideAdd
                  alwaysShowCreateNode
                  {...props}
                  data={stepsData}
                  isNodeCollapsed={isNodeCollapsed}
                  readonly={props.readonly}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
