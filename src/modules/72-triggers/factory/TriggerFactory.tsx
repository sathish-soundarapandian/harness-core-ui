/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Github } from '@triggers/components/Triggers/WebhookTrigger/Github/Github'
import { Gitlab } from '@triggers/components/Triggers/WebhookTrigger/Gitlab/Gitlab'
import { Bitbucket } from '@triggers/components/Triggers/WebhookTrigger/Bitbucket/Bitbucket'
import { AwsCodeCommit } from '@triggers/components/Triggers/WebhookTrigger/AwsCodeCommit/AwsCodeCommit'

import { AbstractTriggerFactory } from './AbstractTriggerFactory'
//Webhook Triggers

class Factory extends AbstractTriggerFactory {
  constructor() {
    super()
  }
}

const TriggerFactory = new Factory()

// Webhook Triggers
TriggerFactory.registerTrigger(new Github())
TriggerFactory.registerTrigger(new Gitlab())
TriggerFactory.registerTrigger(new Bitbucket())
TriggerFactory.registerTrigger(new AwsCodeCommit())

export default TriggerFactory
