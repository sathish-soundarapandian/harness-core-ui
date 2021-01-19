export default {
  projects: 'Projects',
  loading: 'Loading...',
  addProject: '+ Add Project',
  newProject: 'Project',
  search: 'Search by project, tags, members',
  getNewProjectStarted: 'Get Started',
  aboutProject: 'A Harness project allows you to logically group pipelines, corresponding environments and services.',
  tabMyProjects: 'My Projects',
  tabRecent: 'Recent',
  tabAllProjects: 'All Projects',
  tabOrgs: 'Organizations:',
  orgLabel: 'All',
  moduleSuccess: 'Module Added Successfully',
  newProjectWizard: {
    back: 'Back',
    saveAndClose: 'Save and Close',
    saveAndContinue: 'Save and Continue',
    finish: 'Finish',
    createProject: {
      name: 'Create a New Project',
      newProject: 'New Project',
      cloneProject: 'Clone An Existing Project',
      gitSync: 'Git Sync',
      recommended: 'Recommended'
    },
    aboutProject: {
      name: 'About the Project',
      edit: 'Edit Project',
      projectName: 'Project Name*',
      color: 'Color',
      org: 'Organization',
      desc: 'Description',
      tags: 'Tags',
      addTags: 'Add Tags',
      preview: 'Preview',
      previewProjectCard: 'Preview your project card',
      closePreview: 'Close Preview',
      errorColor: 'required',
      errorName: 'Name is required',
      errorIdentifier: 'Identifier is required',
      errorOrganization: 'Organization is required',
      default: 'default',
      createSuccess: 'Project Created Successfully',
      editSuccess: 'Project Updated Successfully',
      validationIdentifierChars:
        'Identifier can only contain alphanumerics, underscore and $ characters, and cannot start with a number',
      validationNameChars: 'Name can only contain alphanumerics, _ and -'
    },
    purposeList: {
      name: 'Which Harness modules would you like to enable for this project?',
      continuous: 'CONTINUOUS',
      delivery: 'Delivery',
      verification: 'Verification',
      integration: 'Integration',
      efficiency: 'Efficiency',
      features: 'Features',
      descriptionCD: 'Deploy your services with blazingly fast pipelines.',
      descriptionCV: 'Deploy in peace, verify activities that take place in system. Identify risk early.',
      descriptionCE: 'Spot and quickly debug inefficiencies and optimize them to reduce costs.',
      descriptionCI: 'Commit, build, and test your code at a whole new level.',
      descriptionCF: 'Decouple release from deployment and rollout features safely and quickly.',
      cd: 'Continuous Delivery',
      cv: 'Continuous Verification',
      ci: 'Continuous Integration',
      ce: 'Continuous Efficiency',
      cf: 'Continuous Features',
      linkcd: 'Create New pipeline',
      linkcv: 'Add New Monitoring Sources',
      linkci: 'Create New pipeline',
      linkce: 'TBD',
      linkcf: 'TBD',
      modulecd: 'CD',
      modulecv: 'CV',
      moduleci: 'CI',
      modulece: 'CE',
      modulecf: 'CF',
      time: '15 min setup',
      starttrial: 'Start a Trial',
      enable: 'Enable',
      enabled: 'Enabled',
      selectAModule: 'Select a module'
    },
    Collaborators: {
      name: 'Invite Collaborators',
      label: 'Assign a role',
      value: 'none',
      add: 'Add',
      inviteCollab: 'Invite People to Collaborate',
      invitationMsg: 'Invitation Message',
      preview: 'Preview',
      emailHello: 'Hi <collaborator>',
      emailInvite: "You've been invited to collaborate on Olivia's Harness project.",
      emailThankyou: 'Thank you,',
      emailFooter: 'Harness',
      urlMessageProject: "Your Project is only accessible to people you've invited",
      urlMessageOrg: "Your Organization is only accessible to people you've invited",
      roleAssigned: 'Role Assigned:',
      url: 'https://www.harness.io/fake-url',
      pendingInvitation: 'Pending Invitation',
      requestAccess: 'Requesting Access',
      pendingUsers: (name: string) => `People Waiting to be Processed (${name})`,
      noRole: 'No project role assigned',
      collaborator: 'collaborators',
      manage: 'Manage all the users in the project',
      manageOrg: 'Manage all the users in the organization',
      notAvailableForBeta: 'Not available for Beta',
      notValid: ' is not a valid email ',
      inviteSuccess: 'The invite has been sent successfully',
      deleteSuccess: 'The invite has been deleted successfully'
    },
    GetStartedProjectPage: {
      welcome: `Welcome, let's get you started!`,
      welcomeSecondLine: 'Take your software delivery processes to the next level using our Harness modules'
    }
  }
}
