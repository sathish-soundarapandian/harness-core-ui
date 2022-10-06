/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  gitSyncEnabledCall,
  postServiceCall,
  cdFailureStrategiesYaml,
  newPipelineRoute,
  accountId,
  orgIdentifier,
  projectId,
  featureFlagsCall
} from '../../support/70-pipeline/constants'

describe('Ssh/WinRM -E2E flow', () => {
  const serviceV2Ssh = `/ng/api/servicesV2/list/access?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&type=Ssh&gitOpsEnabled=false`
  const artifactoryConnectorsCall = `/ng/api/connectors?accountIdentifier=${accountId}&type=Artifactory&searchTerm=&pageIndex=0&pageSize=10&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}`
  const repositoriesDetailCall = `/ng/api/artifacts/artifactory/repositoriesDetails?routingId=accountId&connectorRef=artifactorytest&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&repositoryType=generic`
  const artifactListV2 = `/ng/api/connectors/listV2?routingId=accountId&pageIndex=0&pageSize=10&searchTerm=&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&includeAllConnectorsAvailableAtScope=true`
  const environmentCall = `/ng/api/environmentsV2/upsert?routingId=accountId&accountIdentifier=accountId`
  const sshSecretsCall = `/ng/api/v2/secrets?accountIdentifier=accountId&type=SSHKey&searchTerm=&projectIdentifier=project1&orgIdentifier=default&pageIndex=0&pageSize=10`
  const infraCall = `/ng/api/infrastructures?routingId=accountId&accountIdentifier=accountId`
  const strategiesCall = `/ng/api/pipelines/configuration/strategies?routingId=accountId`
  const basicStrategy = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=accountId&serviceDefinitionType=Ssh&strategyType=Basic`
  const rollingStrategy = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=accountId&serviceDefinitionType=Ssh&strategyType=Rolling`
  const canaryStrategy = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=accountId&serviceDefinitionType=Ssh&strategyType=Canary`

  //Harness file store
  const createdBy = `/ng/api/file-store/files/createdBy?routingId=${accountId}&accountIdentifier=${accountId}`
  const supportedEntityTypes = `/ng/api/file-store/supported-entity-types?routingId=${accountId}&accountIdentifier=${accountId}`
  const folderFileStore = `/ng/api/file-store/folder?routingId=accountId&accountIdentifier=accountId&fileUsage=CONFIG`
  const downloadConfigCall = `/ng/api/file-store/files/configyaml/download?routingId=accountId&accountIdentifier=accountId`

  //Azure Infra
  const azureConnectorCall = `/ng/api/connectors?accountIdentifier=accountId&type=Azure&searchTerm=&pageIndex=0&pageSize=10&projectIdentifier=project1&orgIdentifier=default`
  const azureSubscriptionIdCall = `ng/api/azure/subscriptions?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=testAzureConnector`
  const azureResourceGroupsCall = `/ng/api/azure/subscriptions/12d2db62-5aa9-471d-84bb-faa489b3e319/resourceGroups?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=testAzureConnector`
  const azureTagsCall = `/ng/api/azure/subscriptions/12d2db62-5aa9-471d-84bb-faa489b3e319/tags?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=testAzureConnector`

  //aws infra
  const awsConnectorCall = `/ng/api/connectors?accountIdentifier=accountId&type=Aws&searchTerm=&pageIndex=0&pageSize=10&projectIdentifier=project1&orgIdentifier=default`
  const awsRegionCall = `/ng/api/aws/aws-helper/regions?routingId=accountId`
  const awsTagsCall = `/ng/api/aws/aws-helper/tags?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&region=us-east-1&awsConnectorRef=testAWSConnector`

  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'NG_SVC_ENV_REDESIGN',
            enabled: true,
            lastUpdatedAt: 0
          },
          {
            uuid: null,
            name: 'SSH_NG',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })
    cy.initializeRoute()
    cy.intercept('GET', serviceV2Ssh, { fixture: 'pipeline/api/services/serviceV2' }).as('servicesV2Call')
    cy.intercept('GET', artifactoryConnectorsCall, { fixture: '/pipeline/api/connector/artifactoryConnector' }).as(
      'artifactoryConnectorCall'
    )
    cy.intercept('GET', repositoriesDetailCall, { fixture: '/ng/api/SshWinRM/repositoriesDetail' }).as('repositoryCall')
    cy.intercept('POST', artifactListV2, { fixture: '/ng/api/SshWinRM/artifactListV2' }).as('artifactListCall')
    cy.intercept('GET', createdBy, { fixture: '/ng/api/SshWinRM/createdByCall' }).as('createdByCall')
    cy.intercept('GET', supportedEntityTypes, { fixture: '/ng/api/SshWinRM/supportedEntityCall' }).as(
      'supportedEntityCall'
    )
    cy.intercept('POST', folderFileStore, { fixture: '/ng/api/SshWinRM/folderFileStore.post.json' }).as(
      'folderFileStore'
    )
    cy.intercept('GET', downloadConfigCall, { fixture: '/ng/api/SshWinRM/downloadConfigCall.json' }).as(
      'downloadConfigCall'
    )

    cy.intercept('GET', gitSyncEnabledCall, {
      connectivityMode: null,
      gitSimplificationEnabled: false,
      gitSyncEnabled: false
    })
    cy.intercept('GET', cdFailureStrategiesYaml, {
      fixture: 'pipeline/api/pipelines/failureStrategiesYaml'
    }).as('cdFailureStrategiesYaml')
    cy.intercept('POST', postServiceCall, { fixture: 'pipeline/api/services/createService' }).as('serviceCreationCall')
    cy.intercept('PUT', environmentCall, {
      fixture: 'ng/api/SshWinRM/envUpsertCall.json'
    }).as('envUpsertCall')
    cy.intercept('GET', sshSecretsCall, { fixture: '/ng/api/SshWinRM/sshSecretCall.json' }).as('secretCall')
    cy.intercept('POST', infraCall, { fixture: '/ng/api/SshWinRM/infraCall.json' }).as('infraCall')
    cy.intercept('GET', strategiesCall, { fixture: '/ng/api/SshWinRM/sshStrategies.json' }).as('strategiesCall')
    cy.intercept('POST', basicStrategy, { fixture: '/ng/api/SshWinRM/basicStrategies.post.json' }).as('basicStrategy')
    cy.intercept('POST', rollingStrategy, { fixture: '/ng/api/SshWinRM/rollingStrategy.post.json' }).as(
      'rollingStrategy'
    )
    cy.intercept('POST', canaryStrategy, { fixture: '/ng/api/SshWinRM/canaryStrategy.post.json' }).as('canaryStrategy')

    //azure infra
    cy.intercept('GET', azureConnectorCall, { fixture: '/ng/api/SshWinRM/azureConnector.json' }).as(
      'azureConnectorCall'
    )
    cy.intercept('GET', azureSubscriptionIdCall, { fixture: '/ng/api/SshWinRM/azureSubscriptionId.json' }).as(
      'azureSubscriptionIdCall'
    )
    cy.intercept('GET', azureResourceGroupsCall, { fixture: '/ng/api/SshWinRM/azureResourceGrp.json' }).as(
      'azureResourceGroupsCall'
    )
    cy.intercept('GET', azureTagsCall, { fixture: '/ng/api/SshWinRM/azureTags.json' }).as('azureTagsCall')

    //aws infra
    cy.intercept('GET', awsConnectorCall, { fixture: '/ng/api/SshWinRM/awsConnectorCall.json' }).as('awsConnectorCall')
    cy.intercept('GET', awsRegionCall, { fixture: '/ng/api/SshWinRM/awsRegions.json' }).as('awsRegionCall')
    cy.intercept('GET', awsTagsCall, { fixture: '/ng/api/SshWinRM/awsTagsCall.json' }).as('awsTagsCall')

    //add pipeline and service
    cy.visit(newPipelineRoute, { timeout: 30000 })
    cy.visitPageAssertion()

    cy.fillName('testPipeline_Cypress')
    cy.clickSubmit()
    cy.wait(1000)

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()
    cy.fillName('testSshWinRM')
    cy.contains('p', 'Secure Shell').click()
    cy.clickSubmit()

    //add new service
    cy.wait('@servicesV2Call')
    cy.contains('span', 'New Service').click()
    cy.wait(1000)
    cy.contains('div[id="serviceDefinition"]', 'Service Definition').should('be.visible')
    cy.fillName('testService_Cypress')
  })
  it('Ssh/Winrm service spec + env + pdc infra + basic strategy', () => {
    //Add artifact
    cy.contains('span', 'Add Primary Artifact').click()
    cy.get('p').contains('Artifactory').click()
    cy.clickSubmit()

    //Add connector
    cy.contains('span[class*="placeholder"]', 'Select Artifactory Connector').click()
    cy.wait('@artifactoryConnectorCall')

    cy.contains('p', 'Id: harness_artfactory').should('be.visible')
    cy.contains('p', 'Id: artifactorytest').should('be.visible').click()
    cy.contains('span[class*="button"]', 'Apply Selected').click()
    cy.clickSubmit()

    //Repository and other details
    cy.get('input[name="repository"]').click()
    cy.wait('@repositoryCall')
    cy.wait(500)
    cy.contains('p', 'KenTest').click()
    cy.get('input[name="artifactDirectory"]').fillField('artifactDirectory', '/')
    cy.clickSubmit()
    cy.wait('@artifactListCall')

    //Add config file
    cy.contains('span', 'Add Config File').click()
    cy.contains('p', 'Harness').click()
    cy.clickSubmit()

    cy.get('input[name="identifier"]').fillField('identifier', 'configTest')
    cy.contains('p', 'Select').click()

    cy.wait('@createdByCall')
    cy.wait('@supportedEntityCall')
    cy.wait('@folderFileStore')

    cy.contains('p', 'config.yaml').should('be.visible')
    cy.contains('span', 'Apply Selected').click()
    cy.clickSubmit()

    cy.wait(1000)

    //save services
    cy.get('[class*="Dialog--children"] > div:nth-child(2) > button:nth-child(1)').contains('Save').click()

    //Add Environment
    cy.contains('Continue').click()
    cy.get('#add-new-environment').click()

    cy.contains('New Environment').should('be.visible')
    cy.get('[placeholder="Enter Name"]').fillName('testCypress_Env')
    cy.contains('Pre-Production').click()
    cy.clickSubmit()
    cy.wait('@envUpsertCall')
    cy.wait(1000)

    // Add Infra
    cy.get('#add-new-infrastructure').click()
    cy.contains('Create New Infrastructure').should('be.visible')
    cy.get('[placeholder="Enter Name"]').fillName('testCypress_Infra')
    cy.get('span[data-icon="pdc"]').click()

    //switch to Specify hosts
    cy.contains('Specify hosts').click()
    cy.get('textarea[name="hosts"]').type('localhost')

    cy.contains('Create or Select a Secret').click()
    cy.wait('@secretCall')

    cy.contains('Id: sshKey').click()
    cy.contains('span', 'Apply Selected').click()

    //save infra
    cy.get('[class*="InfrastructureDefinition-module_modalFooter"] > button:nth-child(1)').contains('Save').click()
    cy.wait('@infraCall')
    cy.contains('Continue').click()
    cy.wait(1000)

    // execution strategies
    cy.wait('@strategiesCall')
    cy.get('[data-testid="Basic-Card"]').click()
    cy.contains('span', 'Use Strategy').click()
    cy.wait('@basicStrategy')
    cy.wait(1000)

    cy.get('[class*=DefaultNode]').contains('Deploy').click()
    cy.contains('Command Scripts').should('be.visible')
    cy.contains('Setup Runtime Paths').should('be.visible')
    cy.contains('Stop Service').should('be.visible')
    cy.contains('Process Stopped').should('be.visible')
    cy.contains('Copy Artifact').should('be.visible')
  })

  it('rolling strategy with Azure infra', () => {
    cy.wait(1000)

    //save services
    cy.get('[class*="Dialog--children"] > div:nth-child(2) > button:nth-child(1)').contains('Save').click()

    //Add Environment
    cy.contains('Continue').click()
    cy.get('#add-new-environment').click()

    cy.contains('New Environment').should('be.visible')
    cy.get('[placeholder="Enter Name"]').fillName('testCypress_Env')
    cy.contains('Pre-Production').click()
    cy.clickSubmit()
    cy.wait('@envUpsertCall')
    cy.wait(1000)

    // Add Infra
    cy.get('#add-new-infrastructure').click()
    cy.contains('Create New Infrastructure').should('be.visible')
    cy.get('[placeholder="Enter Name"]').fillName('testCypress_Infra')
    cy.get('span[data-icon="service-azure"]').click()

    //add azure connector
    cy.contains('Select Connector').click()
    cy.wait('@azureConnectorCall')
    cy.contains('Id: testAzureConnector').click()
    cy.contains('span', 'Apply Selected').click()

    //add subscriptionId
    cy.get('input[name="subscriptionId"]').click()
    cy.wait('@azureSubscriptionIdCall')

    cy.wait(500)
    cy.contains('Harness-Test: 12d2db62-5aa9-471d-84bb-faa489b3e319').should('be.visible').click()

    //add resourceGroup
    cy.get('input[name="resourceGroup"]').click()
    cy.wait('@azureResourceGroupsCall')

    cy.wait(500)
    cy.contains('NetworkWatcherRG').should('be.visible').click()

    //add tag
    cy.get('button > span[icon="add"]').click()
    cy.get('input[name="tagslabel1"]').click()
    cy.wait('@azureTagsCall')
    cy.wait(500)

    cy.contains('City').should('be.visible').click()
    cy.wait(500)
    cy.get('input[name="tags.City"]').type('BLR')

    //add credential
    cy.contains('Create or Select a Secret').click()
    cy.wait('@secretCall')

    cy.contains('Id: sshKey').click()
    cy.contains('span', 'Apply Selected').click()

    //save infra
    cy.get('[class*="InfrastructureDefinition-module_modalFooter"] > button:nth-child(1)').contains('Save').click()
    cy.contains('Continue').click()
    cy.wait(1000)

    // rolling execution strategy
    cy.wait('@strategiesCall')
    cy.get('[data-testid="Rolling-Card"]').click()
    cy.contains('span', 'Use Strategy').click()
    cy.wait('@rollingStrategy')
    cy.wait(1000)

    cy.get('[class*=DefaultNode]').contains('Deploy').click()
    cy.contains('Command Scripts').should('be.visible')
    cy.contains('Setup Runtime Paths').should('be.visible')
    cy.contains('Stop Service').should('be.visible')
    cy.contains('Process Stopped').should('be.visible')
    cy.contains('Copy Artifact').should('be.visible')
  })

  it('Canary strategy with AWS infra', () => {
    cy.wait(1000)

    //save services
    cy.get('[class*="Dialog--children"] > div:nth-child(2) > button:nth-child(1)').contains('Save').click()

    //Add Environment
    cy.contains('Continue').click()
    cy.get('#add-new-environment').click()

    cy.contains('New Environment').should('be.visible')
    cy.get('[placeholder="Enter Name"]').fillName('testCypress_Env')
    cy.contains('Pre-Production').click()
    cy.clickSubmit()
    cy.wait('@envUpsertCall')
    cy.wait(1000)

    // Add Infra
    cy.get('#add-new-infrastructure').click()
    cy.contains('Create New Infrastructure').should('be.visible')
    cy.get('[placeholder="Enter Name"]').fillName('testCypress_Infra')
    cy.get('span[data-icon="service-aws"]').click()

    //add aws connector
    cy.contains('Select Connector').click()
    cy.wait('@awsConnectorCall')
    cy.contains('Id: testAWSConnector').click()
    cy.contains('span', 'Apply Selected').click()

    //add aws region
    cy.get('input[name="region"]').click()
    cy.contains('US East (N. Virginia)').should('be.visible').click()

    //add tags
    cy.get('button > span[icon="add"]').click()
    cy.get('input[name="tagslabel1"]').click()
    cy.wait('@awsTagsCall')

    cy.wait(500)
    cy.contains('Owner').should('be.visible').click()
    cy.get('input[name="awsInstanceFilter.tags.Owner"]').type('Admin')

    //add credential
    cy.contains('Create or Select a Secret').click()
    cy.wait('@secretCall')

    cy.contains('Id: sshKey').click()
    cy.contains('span', 'Apply Selected').click()

    //save infra
    cy.get('[class*="InfrastructureDefinition-module_modalFooter"] > button:nth-child(1)').contains('Save').click()
    cy.contains('Continue').click()
    cy.wait(1000)

    // Canary execution strategy
    cy.wait('@strategiesCall')
    cy.get('[data-testid="Canary-Card"]').click()
    cy.contains('span', 'Use Strategy').click()
    cy.wait('@canaryStrategy')
    cy.wait(1000)

    cy.get('[class*=DefaultNode]').contains('Deploy').click()
    cy.contains('Command Scripts').should('be.visible')
    cy.contains('Setup Runtime Paths').should('be.visible')
    cy.contains('Stop Service').should('be.visible')
    cy.contains('Process Stopped').should('be.visible')
    cy.contains('Copy Artifact').should('be.visible')
  })
})
