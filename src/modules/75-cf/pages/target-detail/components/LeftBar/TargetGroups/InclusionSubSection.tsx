/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { useRemoveTargetsFromIncludeList } from '@cf/utils/SegmentUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import TargetGroupsSubSection, { TargetGroupsSubSectionProps } from './TargetGroupsSubSection'

export type InclusionSubSectionProps = Pick<
  TargetGroupsSubSectionProps,
  'target' | 'targetGroups' | 'onAddTargetGroups' | 'onRemoveTargetGroup'
>

const InclusionSubSection: FC<InclusionSubSectionProps> = ({
  target,
  targetGroups,
  onAddTargetGroups,
  onRemoveTargetGroup
}) => {
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()

  const removeTargetGroup = useRemoveTargetsFromIncludeList({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  })

  return (
    <TargetGroupsSubSection
      target={target}
      targetGroups={targetGroups}
      onAddTargetGroups={onAddTargetGroups}
      removeTargetGroup={removeTargetGroup}
      onRemoveTargetGroup={onRemoveTargetGroup}
      sectionTitle="cf.targetDetail.manuallyAdded"
      sectionTitleTooltipId="ff_targetTargetGroups_manuallyAdded"
      modalTitle="cf.targetDetail.addTargetToSegment"
      addButtonText="cf.targetDetail.addToSegment"
      noDataMessage="cf.targetDetail.noSegmentAdded"
      instructionKind="addToIncludeList"
    />
  )
}

export default InclusionSubSection
