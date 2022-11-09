/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// Step1: deploymentType, gitopsEnabled

//  ServiceDataType = NGServiceV2InfoConfig{

//   description?: string
//   gitOpsEnabled?: boolean ------------->>gitopsEnabled
//   identifier: string
//   metadata?: string
//   name: string
//   serviceDefinition?:{
//      spec: ServiceSpec
//      type: string  ----------------------->>>> deploymentType
//   }
//   tags?: {
//     [key: string]: string
//   }
//   useFromStage?: ServiceUseFromStageV2

//  } & { data: ServiceData }

// Step 2: DelegateSelectStep

// delegateType,isDelegateInstalled, environmentEntities,delegateYAMLResponse(for next time YAML side)
// connector: newEnvironmentState.connector.name,
// delegate: delegateName.current as string,
// environment: ENV_ID,
// infrastructure: INFRASTRUCTURE_ID,
// namespace: NAMESPACE

// onmount service create identifier new
//   (name/identifier) --> user update name (identifier same)
// During whole flow, service is created so call updateServic e

//manifest empty
//artifact empty sample structuer

// then populate to avoid isEmpty(manifest.sdsd.sds.spec)

// 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
//
// CLEAN SERVICES
