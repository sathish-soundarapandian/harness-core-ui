/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, Layout, Text, useToaster } from '@harness/uicore'
import { FontVariation, Intent } from '@harness/design-system'
import type { Target, TargetDetailSegment } from 'services/cf'
import { String, StringKeys, useStrings } from 'framework/strings'
import TargetGroupRow from '@cf/pages/target-detail/components/LeftBar/TargetGroups/TargetGroupRow'
import { NoDataFoundRow } from '@cf/components/NoDataFoundRow/NoDataFoundRow'
import type { useAddTargetsToExcludeList } from '@cf/utils/SegmentUtils'
import { getErrorMessage } from '@cf/utils/CFUtils'
import type { Instruction } from '@cf/utils/instructions'
import useAddTargetToTargetGroupsDialog from '@cf/pages/target-detail/hooks/useAddTargetToTargetGroupsDialog'

import css from './TargetGroupsSubSection.module.scss'

export interface TargetGroupsSubSectionProps {
  target: Target
  targetGroups: TargetDetailSegment[]
  onAddTargetGroups: () => void
  removeTargetGroup: ReturnType<typeof useAddTargetsToExcludeList>
  onRemoveTargetGroup: () => void
  sectionTitle: StringKeys
  sectionTitleTooltipId: string
  modalTitle: StringKeys
  addButtonText: StringKeys
  noDataMessage: StringKeys
  instructionKind: Instruction['kind']
}

const TargetGroupsSubSection: FC<TargetGroupsSubSectionProps> = ({
  target,
  targetGroups,
  onAddTargetGroups,
  removeTargetGroup,
  onRemoveTargetGroup,
  sectionTitle,
  sectionTitleTooltipId,
  modalTitle,
  addButtonText,
  noDataMessage,
  instructionKind
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()

  const [openAddTargetToTargetGroupsDialog] = useAddTargetToTargetGroupsDialog(
    target,
    onAddTargetGroups,
    getString(modalTitle),
    addButtonText,
    instructionKind
  )

  return (
    <Layout.Vertical spacing="xsmall">
      <Layout.Horizontal
        flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}
        padding={{ left: 'small', right: 'small' }}
      >
        <Text
          font={{ variation: FontVariation.TABLE_HEADERS }}
          tooltipProps={{
            dataTooltipId: sectionTitleTooltipId
          }}
        >
          {getString(sectionTitle)}
        </Text>
        <Button
          className={css.addBtn}
          text={getString(addButtonText)}
          variation={ButtonVariation.LINK}
          onClick={() => openAddTargetToTargetGroupsDialog()}
        />
      </Layout.Horizontal>
      {targetGroups.length ? (
        <Layout.Vertical spacing="small">
          {targetGroups.map(targetGroup => (
            <TargetGroupRow
              key={targetGroup.identifier}
              targetGroup={targetGroup}
              confirmActionProps={{
                message: (
                  <String
                    useRichText
                    stringID="cf.targetDetail.removeFromIncludeList"
                    vars={{
                      targetName: target.name,
                      segmentName: targetGroup.name
                    }}
                  />
                ),
                intent: Intent.DANGER,
                action: async () => {
                  try {
                    await removeTargetGroup(targetGroup.identifier as string, [target.identifier])
                    onRemoveTargetGroup()
                  } catch (e) {
                    showError(getErrorMessage(e), undefined, 'cf.remove.target.list.error')
                  }
                }
              }}
            />
          ))}
        </Layout.Vertical>
      ) : (
        <NoDataFoundRow message={getString(noDataMessage)} />
      )}
    </Layout.Vertical>
  )
}

export default TargetGroupsSubSection
