/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import type { TriggerArtifactType } from '../../TriggerInterface'
import { ArtifactTrigger } from '../../ArtifactTrigger/ArtifactTrigger'
import type { ArtifactTriggerValues } from '../../ArtifactTrigger/utils'

export class Custom extends ArtifactTrigger<ArtifactTriggerValues> {
  protected type: TriggerArtifactType = 'CustomArtifact'
  protected triggerDescription: keyof StringsMap = 'common.repo_provider.customLabel'

  protected defaultValues = {
    triggerType: this.baseType,
    artifactType: this.type
  }
}
