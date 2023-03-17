/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum PageNames {
  Purpose = 'Purpose page',
  TrialInProgress = 'Trial in progress page',
  TrialSetupPipelineModal = 'Trial setup pipeline modal'
}

export enum PurposeActions {
  ModuleContinue = 'Purpose Continue click',
  CDModuleContinue = 'CD Welcome Page Continue Clicked',
  CDCGModuleSelected = 'CD Current Gen Continue Clicked'
}

export enum TrialActions {
  StartTrialClick = 'Start a trial click',
  TrialModalPipelineSetupSubmit = 'Trial modal pipeline setup submit',
  TrialModalPipelineSetupCancel = 'Trial modal pipeline setup cancel'
}

export enum PlanActions {
  StartFreeClick = 'Start a free plan click'
}

export enum StageActions {
  SelectStage = 'Select a Stage',
  SetupStage = 'Setup Stage',
  DeleteStage = 'Delete Stage',
  LoadSelectStageTypeView = 'Load Select Stage Type View',
  LoadEditStageView = 'Load Edit Stage View',
  LoadCreateOrSelectConnectorView = 'Load Create or Select a Connector View',
  ApplySelectedConnector = 'Apply Selected Connector',
  CancelSelectConnector = 'Cancel Select Connector',
  LoadSelectConnectorTypeView = 'Load Select Connector Type View',
  SelectConnectorType = 'Select Connector Type'
}

export enum SecretActions {
  StartCreateSecret = 'Start Create Secret',
  SaveCreateSecret = 'Save Create Secret'
}

export enum ConnectorActions {
  StartCreateConnector = 'Create Connector Started',
  SaveCreateConnector = 'Create Connector Saved',
  ConnectorDetailsStepLoad = 'Connector Details Step Loaded',
  ConnectorDetailsStepSubmit = 'Connector Details Step Submitted',
  AuthenticationStepLoad = 'Connector Authentication Step Loaded',
  AuthenticationStepSubmit = 'Connector Authentication Step Submitted',
  DetailsStepLoad = 'Details Step Loaded',
  DetailsStepSubmit = 'Details Step Submitted',
  ConfigLoad = 'Connector Config Loaded',
  ConfigSubmit = 'Connector Config Submitted',
  CreateConnectorLoad = 'Connector Loaded',
  CreateConnectorSubmit = 'Connector Submitted',
  DelegateSelectorStepLoad = 'Delegate Selector Step Loaded',
  DelegateSelectorStepSubmit = 'Delegate Selector Step Submitted',
  ConnectivityModeStepLoad = 'Connectivity Mode Step Loaded',
  ConnectivityModeStepSubmit = 'Connectivity Mode Step Submitted',
  SetupEngineLoad = 'Setup Engine Loaded',
  SetupEngineSubmit = 'Setup Engine Submitted',
  AzureKeyValueFormLoad = 'Azure Key Value Form Loaded',
  AzureKeyValueFormSubmit = 'Azure Key Value Form Submitted',
  SetupVaultLoad = 'Setup Vault Loaded',
  SetupVaultSubmit = 'Setup Vault Submitted',
  OverviewLoad = 'Connector Overview Loaded',
  OverviewSubmit = 'Connector Overview Submitted',
  AzureConnectorBillingLoad = 'Azure Connector Billing Loaded',
  AzureConnectorBillingSubmit = 'Azure Connector Billing Submitted',
  CEGcpConnectorBillingExportLoad = 'CCM Gcp Connector Billing Export Loaded',
  CEGcpConnectorBillingExportSubmit = 'CCM Gcp Connector Billing Export Submitted',
  ChooseRequirementsLoad = 'Choose Requirements Loaded',
  ChooseRequirementsSubmit = 'Choose Requirements Submitted',
  ProvidePermissionsLoad = 'Provide Permissions Loaded',
  ProvidePermissionsSubmit = 'Provide Permissions Submitted',
  CustomHealthHeadersAndParamsLoad = 'Custom Health Headers And Param Loaded',
  CustomHealthHeadersAndParamsSubmit = 'Custom Health Headers And Param Submitted',
  CustomHealthValidationPathLoad = 'Custom Health Validation Path Loaded',
  CustomHealthValidationPathSubmit = 'Custom Health Validation Path Submitted',
  CreateServicePrincipalLoad = 'Create Service Principal Loaded',
  CreateServicePrincipalSubmit = 'Create Service Principal Submitted',
  FeatureSelectionStepLoad = 'Feature Selection Step Loaded',
  FeatureSelectionStepSubmit = 'Feature Selection Step Submitted',
  SecretCreationStepLoad = 'Secret Creation Step Loaded',
  SecretCreationStepSubmit = 'Secret Creation Step Submitted',
  CENGAwsConnectorCostUsageReportLoad = 'CCM NG AWS Connector Cost Usage Report Loaded',
  CENGAwsConnectorCostUsageReportSubmit = 'CCM NG AWS Connector Cost Usage Report Submitted',
  CENGAwsConnectorCrossAccountRoleStep1Load = 'CCM NG AWS Connector Cross Account Role Step1 Loaded',
  CENGAwsConnectorCrossAccountRoleStep1Submit = 'CCM NG AWS Connector Cross Account Role Step1 Submitted',
  CENGAwsConnectorCrossAccountRoleStep2Load = 'CCM NG AWS Connector Cross Account Role Step2 Loaded',
  CENGAwsConnectorCrossAccountRoleStep2Submit = 'CCM NG AWS Connector Cross Account Role Step2 Submitted'
}

export enum ConnectorTypes {
  Helm = 'Helm',
  Docker = 'Docker',
  CEGcp = 'CEGcp'
}

export enum DelegateActions {
  StartCreateDelegate = 'Start Create Delegate',
  SaveCreateDelegate = 'Save Create Delegate',
  SelectDelegateType = 'Select Delegate Type',
  SetupDelegate = 'Set up Delegate',
  SetupDelegateBack = 'Set up Delegate Back',
  VerificationBack = 'Verification Back',
  DownloadYAML = 'Download YAML File',
  LoadCreateTokenModal = 'Load Create Token Modal',
  SaveCreateToken = 'Save Create Token',
  CloseCreateToken = 'Close Create Token',
  ReviewScriptContinue = 'Review Script Continue',
  ReviewScriptBack = 'Review Script Back',
  DelegateCommandLineKubernetes = 'Delegate Command Line Kubernetes',
  DelegateCommandLineVerify = 'Delegate Command Line Verify Clicked',
  DelegateCommandLineKubernetesManifest = 'Delegate Command Line Kubernetes Manifest',
  DelegateCommandLineKubernetesManifestCommandCopy1 = 'curl -LO https://raw.githubusercontent.com/harness/delegate-kubernetes-manifest/main/harness-delegate.yaml copied',
  DelegateCommandLineKubernetesManifestBasic = 'Kubernetes Manifest Basic button clicked',
  DelegateCommandLineKubernetesManifestCustom = 'Kubernetes Manifest Custom button clicked',
  DelegateCommandLineKubernetesManifestDownloadYaml = 'Kubernetes Manifest YAML Downloaded',
  DelegateCommandLineKubernetesManifestPreviewYaml = 'Kubernetes Manifest YAML Preview',
  DelegateCommandLineReplaceCommands = 'Kubernetes Manifest Custom replace command',

  DelegateCommandLineKubernetesManifestPreviewYamlClosed = 'Kubernetes Manifest YAML Preview Closed',
  DelegateCommandLineKubernetesManifestCommandCopy2 = 'kubectl apply -f harness-delegate.yaml copy',
  DelegateCommandLineHelm = 'Delegate Command Line Helm',

  DelegateCommandLineHelmCommandCopy1 = 'helm repo add harness-delegate https://app.harness.io/storage/harness-download/delegate-helm-chart/ copied',
  DelegateCommandLineTroubleShoot = 'Delegate Command Line TroubleShoot',
  DelegateCommandLineTroubleShootRetryConnection = 'Delegate Command Line TroubleShoot retry connection',
  DelegateCommandLineDone = 'Delegate Command Line Done',
  DelegateCommandLineHelmCommandCopy2 = 'helm repo update copied',

  DelegateCommandLineHelmCommandCopy4 = 'Delegate Command Line Helm command from backend  copied',
  DelegateCommandLineTerraform = 'Delegate Command Line Terraform',
  DelegateCommandLineTerraformCommandCopy1 = 'terraform apply copied',
  DelegateCommandLineTerraformCommandCopy2 = 'terraform init copied',
  DelegateCommandLineTerraformCommandCopy3 = 'Delegate Command Line Terraform command from backend  copied',
  DelegateCommandLineTerraformDownloadCommand3 = 'Delegate Command Line Terraform command from backend download',
  DelegateCommandLineKubernetesYamlDownloadCommand = 'Delegate Command Line Kubenetes yaml backend download from preview',
  DelegateCommandLineKubernetesYamlDownloadCopy = 'Delegate Command Line Kubenetes yaml backend copied from preview',
  DelegateCommandLineSizingGuideOpen = 'Delegate command line sizing guide opened',
  DelegateCommandLineSizingGuideClosed = 'Delegate command line sizing guide closed',
  DelegateCommandLineTroubleShootProblemSolved = 'Delegate CommandLine TroubleShoot Problem Solved',
  DelegateCommandLineTroubleShootProblemNotSolved = 'Delegate CommandLine TroubleShoot Problem Not Solved',
  DelegateCommandLineTroubleShootProblemFeedBackSaved = 'Delegate CommandLine TroubleShoot FeedBack Saved',
  DelegateCommandLineDefaultValuesYamlUsed = 'Default values.yaml used for command below clicked',

  DelegateCommandLineDocker = 'Delegate Command Line Docker',
  DelegateCommandLineDockerCommandCopy = 'Delegate Command Line Docker Command copied',
  DelegateCommandLineTroubleShootCopyCommonCommand1 = 'kubectl describe pods -n <namespace> copied',
  DelegateCommandLineTroubleShootCopyCommonCommand2 = 'kubectl logs -f <harnessDelegateName> -n <namespace> copied',
  DelegateCommandLineTroubleShootCopyCommonCommand3 = 'kubectl describe <pod_name> -n <namespace> copied',
  DelegateCommandLineTroubleShootDockerCopyCommonCommand1 = 'docker container ls -a copied',
  DelegateCommandLineTroubleShootDockerCopyCommonCommand2 = 'docker container logs <delegatename> -f copied',
  DelegateCommandLineTroubleShootDockerCopyCommonCommand3 = 'docker container stop <delegatename> copied',
  DelegateCommandLineTroubleShootDockerCopyCommonCommand4 = 'docker container start <delegatename> copied',
  DelegateCommandLineTroubleShootDockerCopyCommonCommand5 = 'docker container rm [container id] copied',
  DelegateCommandLineTroubleShootHelmCopyCommonCommand1 = 'helm copied',
  DelegateCommandLineTroubleShootHelmCopyCommonCommand2 = 'helm version copied',
  DelegateCommandLineTroubleShootTerraformCopyCommonCommand1 = 'terraform -version copied',
  SwitchedToOldDelegateCreationModal = 'switchedToOldDelegateCreationModal',
  DelegateCommandLineCreationOpened = 'Delegate CommandLine Creation Opened',
  DelegateCommandLineCreationClosed = 'Delegate CommandLine Creation Closed',

  DelegateTaskLogsViewed = 'Delegate Task Logs Viewed'
}

export enum StepActions {
  SelectStep = 'Select a Step',
  AddEditStep = 'Add/Edit Step',
  AddEditStepGroup = 'Add/Edit Step Group',
  DeleteStep = 'Delete Step',
  AddEditFailureStrategy = 'Add/Edit Failure strategy'
}

export enum PipelineActions {
  StartedExecution = 'Started Pipeline Execution',
  // CompletedExecution = 'Completed Pipeline Execution', // this is done from BE
  StartedPipelineCreation = 'Started Pipeline Creation',
  PipelineCreatedViaVisual = 'Save a pipeline using Visual Mode',
  PipelineCreatedViaYAML = 'Save a pipeline using YAML editor',
  PipelineUpdatedViaVisual = 'Update a pipeline using Visual Mode',
  PipelineUpdatedViaYAML = 'Update a pipeline using YAML editor',
  SetupLater = 'Click Setup later',
  LoadCreateNewPipeline = 'Load Create new Pipeline',
  CancelCreateNewPipeline = 'Cancel Create new Pipeline',
  LoadSelectOrCreatePipeline = 'Load Select or Create Pipeline',
  SelectAPipeline = 'Select a Pipeline',
  CreateAPipeline = 'Create a Pipeline'
}

export enum NavigatedToPage {
  DeploymentsPage = 'Navigates to Deployments/Builds page',
  PipelinesPage = 'Navigates to Pipelines page',
  PipelineStudio = 'Navigates to Pipline Studio',
  PipelineInputSet = 'Navigates to Pipline Input Set',
  PipelineTriggers = 'Navigates to Pipline Triggers',
  PipelineExecutionHistory = 'Navigates to Pipline Execution History'
}

export enum Category {
  SIGNUP = 'Signup',
  PROJECT = 'Project',
  PIPELINE = 'Pipeline',
  STAGE = 'Stage',
  SECRET = 'Secret',
  CONNECTOR = 'Connector',
  DELEGATE = 'Delegate',
  ENVIRONMENT = 'Environment',
  CONTACT_SALES = 'ContactSales',
  LICENSE = 'License',
  FEEDBACK = 'Feedback',
  ENFORCEMENT = 'Enforcement',
  FEATUREFLAG = 'Featureflag'
}

export enum ManifestActions {
  SaveManifestOnPipelinePage = 'Save Manifest on Pipeline Page',
  UpdateManifestOnPipelinePage = 'Update Manifest on Pipeline Page'
}

export enum ServiceConfigActions {
  SaveConnectionStringOnPipelinePage = 'Save Connection String on Pipeline Page',
  SaveApplicationSettingOnPipelinePage = 'Save Application Setting on Pipeline Page'
}

export enum StartupScriptActions {
  SaveStartupScriptOnPipelinePage = 'Save Startup Script on Pipeline Page'
}

export enum ArtifactActions {
  SavePrimaryArtifactOnPipelinePage = 'Save Primary Artifact on Pipeline Page',
  UpdatePrimaryArtifactOnPipelinePage = 'Update Primary Artifact on Pipeline Page',
  SaveSidecarArtifactOnPipelinePage = 'Save Sidecar Artifact on Pipeline Page',
  UpdateSidecarArtifactOnPipelinePage = 'Update Sidecar Artifact on Pipeline Page'
}

export enum ProjectActions {
  OpenCreateProjectModal = 'Open Create Project modal',
  SaveCreateProject = 'Save Create project',
  LoadInviteCollaborators = 'Load Invite Collaborators',
  SaveInviteCollaborators = 'Save Invite Collaborators',
  ClickBackToProject = 'Click Back to Project',
  LoadSelectOrCreateProjectModal = 'Load Select Or Create Project Modal',
  ClickSelectProject = 'Select Project from Project Selector'
}

export enum ExitModalActions {
  ExitByCancel = 'ExitByCancel',
  ExitByClose = 'ExitByClose',
  ExitByClick = 'ExitByClick'
}

export enum EnvironmentActions {
  StartCreateEnvironment = 'Start Create Environment',
  SaveCreateEnvironment = 'Save Create Environment'
}

export enum ContactSalesActions {
  LoadContactSales = 'Load Contact Sales',
  SubmitContactSales = 'Submit Contact Sales'
}

export enum FeedbackActions {
  LoadFeedback = 'Load Feedback',
  SubmitFeedback = 'Submit Feedback'
}

export enum LicenseActions {
  ExtendTrial = 'Extend Trial',
  LoadExtendedTrial = 'Load Extended Trial'
}

export enum FeatureActions {
  DismissFeatureBanner = 'Feature Banner Dismissed',
  AddNewFeatureFlag = 'Add New FeatureFlag Clicked',
  SelectFeatureFlagType = 'Select FeatureFlag Type Loaded',
  AboutTheFlag = 'About the Flag Loaded',
  AboutTheFlagNext = 'About the Flag Next Clicked',
  BackToSelectFeatureFlagType = 'Back to FeatureFlag Type Select Clicked',
  VariationSettings = 'Variation Settings Loaded',
  CreateFeatureFlagSubmit = 'Create FeatureFlag Submitted',
  AddFlagPipeline = 'Add New Flag Pipeline Button Clicked',
  SavedFlagPipeline = 'Flag Pipeline Saved',
  EditFlagPipeline = 'Edit Flag Pipeline Button Clicked',
  DeletedFlagPipeline = 'Flag Pipeline Deleted',
  GitExperience = 'Set Up with Existing Repository Loaded',
  GitExperienceSubmit = 'Set Up with Existing Repository Submitted',
  GitExperienceBack = 'Set Up with Existing Repository Back Clicked',
  GetStartedClick = 'Get Started Clicked',
  CreateAFlagView = 'Create a Flag View Loaded',
  SetUpYourApplicationView = 'Set Up Your Application View Loaded',
  SetUpYourApplicationVerify = 'Set Up Your Application Verify Clicked',
  SetUpYourCodeView = 'Set Up Your Code View Clicked',
  TestYourFlagBack = 'Test Your Flag Back to Quick Start Guide Clicked',
  GetStartedPrevious = 'Get Started Previous Clicked',
  GetStartedNext = 'Get Started Next Clicked',
  LanguageSelect = 'Language Selected',
  EnvSelect = 'Environment Selected',
  CreateEnvClick = 'Create an Environment Clicked',
  CreateEnvSubmit = 'Create an Environment Submitted',
  CreateEnvCancel = 'Create an Environment Cancel Clicked',
  CreateSDKKeyClick = 'Create SDK Key Clicked',
  CreateSDKKeySubmit = 'Create SDK Key Submitted',
  CreateSDKKeyCancel = 'Create SDK Key Cancel Clicked',
  JiraAddedToFlag = 'Jira Added To Flag'
}

export enum CCMActions {
  CCMStartPlanModal = 'CCM Start Plan Modal Loaded',
  CCMStartPlanContinue = 'CCM Start Plan Modal Continue Clicked'
}

export enum CIOnboardingActions {
  SelectGitProvider = 'Git Provider Selected',
  GetStartedClicked = 'Clicked on Get Started for CI',
  ConfigurePipelineClicked = 'Clicked on Configure Pipeline',
  CreatePipelineClicked = 'Clicked on Create Pipeline'
}

export enum CDOnboardingActions {
  GetStartedClicked = 'Clicked on Get Started for CD',
  ExitCDOnboarding = 'Exited CD Get Started',
  MoveToOtherDeploymentTypes = 'Exit for other deployment types',
  StartOnboardingDelegateCreation = 'Start onboarding Delegate creation',
  SetupOnboardingDelegate = 'Setup onboarding Delegate',
  SaveCreateOnboardingDelegate = 'Save create onboarding Delegate',
  DownloadOnboardingYAML = 'Download onboarding YAML File',
  PreviewHelpAndTroubleshooting = 'Preview Help and Troubleshoot for K8s',
  HeartbeatVerifiedOnboardingYAML = 'Heartbeat verified onboarding YAML',
  HeartbeatFailedOnboardingYAML = 'Heartbeat failed onboarding YAML',
  EnvironmentEntitiesCreation = 'Harness environment entities created',
  SelectManifestType = 'Manifest type selection',
  SelectManifestStore = 'Manifest store selection',
  SelectArtifactType = 'Select artifact type',
  SelectDeploymentType = 'Select deployment type',
  SelectDeploymentTypeDefault = 'Pre-Selected deployment type',
  MoveBackToSelectDeploymentType = 'Move Back to Select deployment type',
  MoveToServiceSelection = 'Move to Service Selection Step',
  MovetoDeployStep = 'Move to Deploy Step',
  MovetoConnectStep = 'Move to Connect Step',
  MoveBacktoConnectStep = 'Move Back to Connect Step',
  MoveToConfigureStep = 'Move to Configure Step',
  MoveBacktoConfigureStep = 'Move Back to Configure Step',
  MoveToDeploymentSelection = 'Move to Deployment type',
  MoveToPipelineSummary = 'Move to Pipeline summary page',
  StartProvisionAgentClicked = 'Clicked on Start Provisioning',
  AgentCreatedAndStartedProvisioningInBackend = 'Agent Created and started Provisioning in Backend - takes 2-5 mins',
  AgentCreationFailedWithoutProvisioning = 'Agent Creation Failed Without Provisioning (no provisioning)',
  AgentProvisionedSuccessfully = 'Agent Provisioned Successfully',
  SelectedExistingAgent = 'Existing Agent is Selected',
  SelectSourceType = 'Select source type',
  SelectSourceTypeDefault = 'Pre-Selected source type',
  SelectSourceRepoType = 'Select source Repo Type',
  TestConnectionClicked = 'Clicked on Test connection for Repository',
  RepoCreatedSuccessfully = 'Repository Created Successfully',
  RepoCreateFailure = 'Repository Creation Failed',
  NextStepClicked = 'Clicked on Next Step',
  SelectClusterTypeDefault = 'Pre-Selected Cluster type',
  SelectClusterType = 'Select Cluster Type',
  ConnectToClusterClicked = 'Clicked on Connect To Cluster',
  ClusterCreatedSuccessfully = 'Cluster Created Successfully',
  ClusterCreateFailure = 'Cluster Creation Failed',
  CreateAndSyncAppClicked = 'Clicked on Create and Sync Application',
  AppCreatedSuccessfully = 'Application Created Successfully',
  AppSyncedSuccessfully = 'Application Synced Successfully',
  AppCreateOrSyncFailure = 'Application Creation/Sync Failed'
}

export enum CFOverviewActions {
  OverviewStartFreePlan = 'FF Overview - Start a free plan',
  InviteCollaboratorsClick = 'Clicked Invite Collaborators'
}
