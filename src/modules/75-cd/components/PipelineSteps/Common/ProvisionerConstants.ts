/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum ProvisionerTypes {
  Terraform = 'Terraform',
  Terragrunt = 'Terragrunt',
  CloudFormation = 'CloudFormation',
  ARM = 'ARM',
  Blueprint = 'Blueprint',
  Script = 'Script'
}

export const payloadValueforProvisionerTypes = (provisionerTypes: ProvisionerTypes) => {
  switch (provisionerTypes) {
    case ProvisionerTypes.Terraform:
      return 'TERRAFORM'
    case ProvisionerTypes.Terragrunt:
      return 'TERRAGRUNT'
    case ProvisionerTypes.CloudFormation:
      return 'CLOUD_FORMATION'
    case ProvisionerTypes.ARM:
      return 'AZURE_ARM'
    case ProvisionerTypes.Blueprint:
      return 'AZURE_BLUEPRINT'
    case ProvisionerTypes.Script:
      return 'SHELL_SCRIPT_PROVISIONER'
  }
}
