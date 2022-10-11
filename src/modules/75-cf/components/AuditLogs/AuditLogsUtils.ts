/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { AuditTrail } from 'services/cf'

export function translateEvents(
  instructionSet: AuditTrail['instructionSet'],
  getString: UseStringsReturn['getString']
): string[] {
  return instructionSet.map(({ Kind, Parameters }) => {
    let message = Kind
    const target: string = Parameters?.targets?.map((t: string) => t).join(', ') || ''

    switch (Kind) {
      case 'updateClause':
        message = getString('cf.auditLogs.events.updateClause')
        break
      case 'removeClause':
        message = getString('cf.auditLogs.events.removeClause')
        break

      case 'addClause':
        message = getString('cf.auditLogs.events.addClause')
        break

      case 'addToIncludeList':
        message = getString('cf.auditLogs.events.addToIncludeList', { target })
        break

      case 'addToExcludeList':
        message = getString('cf.auditLogs.events.addToExcludeList', { target })
        break

      case 'removeFromIncludeList':
        message = getString('cf.auditLogs.events.removeFromIncludeList', { target })
        break

      case 'removeFromExcludeList':
        message = getString('cf.auditLogs.events.removeFromExcludeList', { target })
        break

      case 'addRule':
        message = getString('cf.auditLogs.events.addRule', {
          clauses: Parameters?.clauses?.map((clause: Record<string, string>) => clause?.attribute || '').join(', ')
        })
        break
      case 'updateRule':
        message = getString('cf.auditLogs.events.updateRule')
        break
      case 'removeRule':
        message = getString('cf.auditLogs.events.removeRule')
        break
      case 'reorderRules':
        message = getString('cf.auditLogs.events.reorderRules')
        break

      case 'updateDefaultServe':
        message = Parameters.bucketBy
          ? getString('cf.auditLogs.events.updateDefaultServe.bucketBy', { bucketBy: Parameters.bucketBy })
          : getString('cf.auditLogs.events.updateDefaultServe.variation', { variation: Parameters.variation })
        break

      case 'addTargetsToVariationTargetMap':
        message = getString('cf.auditLogs.events.addTargetsToVariationTargetMap', {
          target: Parameters.targets?.toString(),
          variation: Parameters.variation
        })
        break

      case 'updateDescription':
        message = getString('cf.auditLogs.events.updateDescription', { description: Parameters.description })
        break
      case 'updateName':
        message = getString('cf.auditLogs.events.updateName', { name: Parameters.name })
        break
      case 'updatePermanent':
        message = getString('cf.auditLogs.events.updatePermanent', { permanent: Parameters.permanent })
        break

      case 'addVariation':
        message = getString('cf.auditLogs.events.addVariation', { variation: Parameters.name })
        break
      case 'updateVariation':
        message = getString('cf.auditLogs.events.updateVariation', { variation: Parameters.name })
        break
      case 'deleteVariation':
        message = getString('cf.auditLogs.events.deleteVariation', { variation: Parameters.identifier })
        break

      case 'setDefaultOnVariation':
        message = getString('cf.auditLogs.events.setDefaultOnVariation', { variation: Parameters.identifier })
        break
      case 'setDefaultOffVariation':
        message = getString('cf.auditLogs.events.setDefaultOffVariation', { variation: Parameters.identifier })
        break

      case 'addSegmentToVariationTargetMap':
        message = getString('cf.auditLogs.events.addSegmentToVariationTargetMap', {
          variation: Parameters.name,
          segment: Parameters.targetSegments?.toString()
        })
        break

      case 'setFeatureFlagState':
        message = getString(
          Parameters.state === FeatureFlagActivationStatus.ON
            ? 'cf.auditLogs.events.setFeatureFlagStateOn'
            : 'cf.auditLogs.events.setFeatureFlagStateOff'
        )
        break

      case 'updateTag':
      case 'addTag':
        message = getString('cf.auditLogs.events.tagUpdated')
        break

      case 'addPrerequisite':
        message = getString('cf.auditLogs.events.addPrerequisite', { name: Parameters.feature })
        break
      case 'updatePrerequisite':
        message = getString('cf.auditLogs.events.updatePrerequisite', { name: Parameters.feature })
        break
      case 'removePrerequisite':
        message = getString('cf.auditLogs.events.removePrerequisite', { name: Parameters.feature })
        break

      case 'removeTargetsToVariationTargetMap':
        message = getString('cf.auditLogs.events.removeTargetsToVariationTargetMap', {
          variation: Parameters.variation,
          targets: Parameters.targets?.toString()
        })
        break

      case 'clearVariationTargetMapping':
        message = getString('cf.auditLogs.events.clearVariationTargetMapping')
        break

      case 'updateOffVariation':
        message = getString('cf.auditLogs.events.updateOffVariation', { variation: Parameters.variation })
        break

      case 'addService':
        message = getString('cf.auditLogs.events.addService', { name: Parameters.name })
        break
      case 'removeService':
        message = getString('cf.auditLogs.events.removeService', { name: Parameters.identifier })
        break
    }

    return message
  })
}
