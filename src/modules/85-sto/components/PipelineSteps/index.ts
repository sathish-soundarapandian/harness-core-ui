/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { ZeroNorthStep } from './ZeroNorthStep/ZeroNorthStep'
import { AquatrivyStep } from './AquatrivyStep/AquatrivyStep'
import { BanditStep } from './BanditStep/BanditStep'
import { BlackduckStep } from './Blackduck/BlackduckStep'
import { GrypeStep } from './GrypeStep/GrypeStep'
import { SnykStep } from './SnykStep/SnykStep'
import { SonarqubeStep } from './SonarqubeStep/SonarqubeStep'
import { ZapStep } from './ZapStep/ZapStep'
import { PrismaCloudStep } from './PrismaCloudStep/PrismaCloudStep'
import { CheckmarxStep } from './CheckmarxStep/CheckmarxStep'
import { MendStep } from './MendStep/MendStep'
import { CustomIngestionStep } from './CustomIngestionStep/CustomIngestionStep'

factory.registerStep(new ZeroNorthStep())
factory.registerStep(new AquatrivyStep())
factory.registerStep(new BlackduckStep())
factory.registerStep(new BanditStep())
factory.registerStep(new GrypeStep())
factory.registerStep(new SnykStep())
factory.registerStep(new SonarqubeStep())
factory.registerStep(new ZapStep())
factory.registerStep(new PrismaCloudStep())
factory.registerStep(new CheckmarxStep())
factory.registerStep(new MendStep())
factory.registerStep(new CustomIngestionStep())
