/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import type { TriggerArtifactType } from '../../TriggerInterface'
import { ArtifactTrigger } from '../ArtifactTrigger'
import type { ArtifactTriggerValues } from '../utils'

export class Nexus2Registry extends ArtifactTrigger<ArtifactTriggerValues> {
  protected type: TriggerArtifactType = 'Nexus2Registry'
  protected triggerDescription: keyof StringsMap = 'connectors.nexus.nexus2Label'

  protected defaultValues = {
    triggerType: this.baseType,
    artifactType: this.type
  }
}
