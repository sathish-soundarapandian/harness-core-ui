/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'

import { RunStep } from './RunStep/RunStep'
import { BackgroundStep } from './BackgroundStep/BackgroundStep'
import { PluginStep } from './PluginStep/PluginStep'
import { ACRStep } from './ACRStep/ACRStep'
import { GitCloneStep } from './GitCloneStep/GitCloneStep'
import { GCRStep } from './GCRStep/GCRStep'
import { ECRStep } from './ECRStep/ECRStep'
import { SaveCacheGCSStep } from './SaveCacheGCSStep/SaveCacheGCSStep'
import { RestoreCacheGCSStep } from './RestoreCacheGCSStep/RestoreCacheGCSStep'
import { SaveCacheS3Step } from './SaveCacheS3Step/SaveCacheS3Step'
import { RestoreCacheS3Step } from './RestoreCacheS3Step/RestoreCacheS3Step'
import { DockerHubStep } from './DockerHubStep/DockerHubStep'
import { GCSStep } from './GCSStep/GCSStep'
import { S3Step } from './S3Step/S3Step'
import { JFrogArtifactoryStep } from './JFrogArtifactoryStep/JFrogArtifactoryStep'
import { Dependency } from './Dependency/Dependency'
import { RunTestsStep } from './RunTestsStep/RunTestsStep'
import { SaveCacheHarnessStep } from './SaveCacheHarnessStep/SaveCacheHarnessStep'
import { RestoreCacheHarnessStep } from './RestoreCacheHarnessStep/RestoreCacheHarnessStep'
import { GHAPluginStep } from './GHAPluginStep/GHAPluginStep'
import { BitrisePluginStep } from './BitrisePluginStep/BitrisePluginStep'

factory.registerStep(new RunStep())
factory.registerStep(new BackgroundStep())
factory.registerStep(new PluginStep())
factory.registerStep(new ACRStep())
factory.registerStep(new GCRStep())
factory.registerStep(new ECRStep())
factory.registerStep(new SaveCacheGCSStep())
factory.registerStep(new RestoreCacheGCSStep())
factory.registerStep(new SaveCacheS3Step())
factory.registerStep(new RestoreCacheS3Step())
factory.registerStep(new DockerHubStep())
factory.registerStep(new GCSStep())
factory.registerStep(new S3Step())
factory.registerStep(new JFrogArtifactoryStep())
factory.registerStep(new Dependency())
factory.registerStep(new RunTestsStep())
factory.registerStep(new GitCloneStep())
factory.registerStep(new SaveCacheHarnessStep())
factory.registerStep(new RestoreCacheHarnessStep())
factory.registerStep(new GHAPluginStep())
factory.registerStep(new BitrisePluginStep())
