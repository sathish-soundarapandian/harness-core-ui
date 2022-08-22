/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'
import { WebhookTrigger } from '@triggers/components/Triggers/WebhookTrigger/WebhookTrigger'
import { SourceRepo } from '../../TriggerInterface'
import type { WebhookInitialValuesInterface } from '../utils'

export class Github extends WebhookTrigger<WebhookInitialValuesInterface> {
  protected type: SourceRepo = SourceRepo.Github
  protected triggerDescription: keyof StringsMap = 'common.repo_provider.githubLabel'

  protected defaultValues = {
    triggerType: this.baseType,
    sourceRepo: this.type
  }
}
