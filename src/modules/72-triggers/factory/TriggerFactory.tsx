/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

//Webhook Triggers
import { Github } from '@triggers/components/Triggers/WebhookTrigger/Github/Github'
import { Gitlab } from '@triggers/components/Triggers/WebhookTrigger/Gitlab/Gitlab'
import { Bitbucket } from '@triggers/components/Triggers/WebhookTrigger/Bitbucket/Bitbucket'
import { AzureRepo } from '@triggers/components/Triggers/WebhookTrigger/AzureRepo/AzureRepo'
import { Custom } from '@triggers/components/Triggers/WebhookTrigger/Custom/Custom'

// Artifact Triggers
import { Acr } from '@triggers/components/Triggers/ArtifactTrigger/Acr/Acr'
import { AmazonS3 } from '@triggers/components/Triggers/ArtifactTrigger/AmazonS3/AmazonS3'
import { ArtifactoryRegistry } from '@triggers/components/Triggers/ArtifactTrigger/ArtifactoryRegistry/ArtifactoryRegistry'
import { DockerRegistry } from '@triggers/components/Triggers/ArtifactTrigger/DockerRegistry/DockerRegistry'
import { Ecr } from '@triggers/components/Triggers/ArtifactTrigger/Ecr/Ecr'
import { Gcr } from '@triggers/components/Triggers/ArtifactTrigger/Gcr/Gcr'
import { Jenkins } from '@triggers/components/Triggers/ArtifactTrigger/Jenkins/Jenkins'
import { Nexus3Registry } from '@triggers/components/Triggers/ArtifactTrigger/Nexus3Registry/Nexus3Registry'

// Scheduled Triggers
import { Cron } from '@triggers/components/Triggers/ScheduledTrigger/Cron/Cron'

// Manifest Triggers
import { HelmChart } from '@triggers/components/Triggers/ManifestTrigger/HelmChart/HelmChart'
import { AbstractTriggerFactory } from './AbstractTriggerFactory'

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
TriggerFactory.registerTrigger(new AzureRepo())
TriggerFactory.registerTrigger(new Custom())

// Scheduled Triggers
TriggerFactory.registerTrigger(new Cron())

// Artifact Triggers
TriggerFactory.registerTrigger(new Acr())
TriggerFactory.registerTrigger(new AmazonS3())
TriggerFactory.registerTrigger(new ArtifactoryRegistry())
TriggerFactory.registerTrigger(new DockerRegistry())
TriggerFactory.registerTrigger(new Ecr())
TriggerFactory.registerTrigger(new Gcr())
TriggerFactory.registerTrigger(new Jenkins())
TriggerFactory.registerTrigger(new Nexus3Registry())

// Manifest Triggers
TriggerFactory.registerTrigger(new HelmChart())

export default TriggerFactory
