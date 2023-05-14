/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@ci/components/PipelineSteps/StepsFlatObject'
import type { BurpStepData } from './BurpStep'

export interface BurpStepVariablesProps {
  initialValues: BurpStepData
  stageIdentifier: string
  onUpdate?(data: BurpStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: BurpStepData
}

export const BurpStepVariables: React.FC<BurpStepVariablesProps> = ({ variablesData, metadataMap, initialValues }) => (
  <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
)

export const BURP_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}

export const BURP_ORCHESTRATION_CONFIGS = [
  BURP_DEFAULT_CONFIG,
  {
    value: 'never-stop-crawl-due-to-application-errors',
    label: 'Never stop crawl due to application errors'
  },
  {
    value: 'never-stop-audit-due-to-application-errors',
    label: 'Never stop audit due to application errors'
  },
  {
    value: 'minimize-false-positives',
    label: 'Minimize false positives'
  },
  {
    value: 'minimize-false-negatives',
    label: 'Minimize false negatives'
  },
  {
    value: 'crawl-strategy-most-complete',
    label: 'Crawl strategy - most complete'
  },
  {
    value: 'crawl-strategy-more-complete',
    label: 'Crawl strategy - more complete'
  },
  {
    value: 'crawl-strategy-fastest',
    label: 'Crawl strategy - fastest'
  },
  {
    value: 'crawl-strategy-faster',
    label: 'Crawl strategy - faster'
  },
  {
    value: 'crawl-limit-60-minutes',
    label: 'Crawl limit - 60 minutes'
  },
  {
    value: 'crawl-limit-30-minutes',
    label: 'Crawl limit - 30 minutes'
  },
  {
    value: 'crawl-limit-10-minutes',
    label: 'Crawl limit - 10 minutes'
  },
  {
    value: 'crawl-and-audit-lightweight',
    label: 'Crawl and Audit - Lightweight'
  },
  {
    value: 'crawl-and-audit-fast',
    label: 'Crawl and Audit - Fast'
  },
  {
    value: 'crawl-and-audit-deep',
    label: 'Crawl and Audit - Deep'
  },
  {
    value: 'crawl-and-audit-balanced',
    label: 'Crawl and Audit - Balanced'
  },
  {
    value: 'audit-coverage-thorough',
    label: 'Audit coverage - thorough'
  },
  {
    value: 'audit-coverage-maximum',
    label: 'Audit coverage - maximum'
  },
  {
    value: 'audit-checks-passive',
    label: 'Audit checks - passive'
  },
  {
    value: 'audit-checks-medium-active',
    label: 'Audit checks - medium active'
  },
  {
    value: 'audit-checks-light-active',
    label: 'Audit checks - light active'
  },
  {
    value: 'audit-checks-critical-issues-only',
    label: 'Audit checks - critical issues only'
  },
  {
    value: 'audit-checks-all-except-time-based-detection-methods',
    label: 'Audit checks - all except time-based detection methods'
  },
  {
    value: 'audit-checks-all-except-java-script-analysis',
    label: 'Audit checks - all except JavaScript analysis'
  }
]
