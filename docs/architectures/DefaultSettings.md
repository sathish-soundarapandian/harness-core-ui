# Default Settings

There are different parts of Default Settings: Configuration and Consumption. Prerequisite to add a setting/ settingCategory on UI side is that, it should also have been registered on the Backend side too.

**Configuration**: The part where you configure settings, settings category.

**Consumption**: The part where you use the settings.

## Configuration

The Configuration framework built using the _registration_ pattern. Since each setting will have its own UI and services calls, the framework is unware of these details

Developers from different teams will need to register their settings with the DefaultSettings Factory.

- This registration of settings is required to support adding your setting to setting category.
- This registration is done at a [module](https://github.com/wings-software/nextgenui/blob/master/src/modules/README.md) level.
- These settings are grouped into a category and those categories are registered at [defaultSettings](https://github.com/wings-software/nextgenui/blob/master/src/modules/23-default-settings/RouteDestinations.tsx).

Example of a settings registration:

```typescript
DefaultSettingsFactory.registerSettingHandler(SettingType.test_setting_CI_3, {
  label: 'secretType',
  settingRenderer: props => <DependendentValues {...props} />,
  yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
  settingCategory: 'CI',
  groupId: SettingGroups.group_1
})
```

Example of a group setting registration:

```typescript
DefaultSettingsFactory.registerGroupHandler(SettingGroups.group_1, {
  groupName: 'addStepGroup',
  settingCategory: 'CI',
  settingsDisplayOrder: [SettingType.test_setting_CI_2, SettingType.test_setting_CI_5, SettingType.test_setting_CI_3]
})
```

Example of a setting category registration:

```typescript
DefaultSettingsFactory.registerCategory('CI', {
  icon: 'ci-main',
  label: 'common.purpose.ci.continuous',
  settingsAndGroupDisplayOrder: [
    SettingType.test_setting_CI_6,
    SettingGroups.group_1,
    SettingGroups.group_2,
    SettingType.test_setting_CI_7
  ],
  modulesWhereCategoryWillBeDisplayed: ['ci']
})
```

The `DefaultSettingFactory` maintains a map of `SettingType` enum to `SettingHandler` interface implementations along with a map from the `SettingCategory` to `SettingCategoryHandler` and also `SettingGroups` enum to `GroupedSettingsHandler`. The commong settings between the map returned from DefaultSetting Factory and list of settings registered on the Backend which are returned by the api call are filtered by the setting UI to display it on the UI.

<img width="1023" alt="Screenshot 2021-04-08 at 10 01 04 AM" src="https://user-images.githubusercontent.com/73115842/181220861-3c121bae-2905-4d99-8a2d-89abd13e990f.png">

We expose `settingRenderer` function prop from the `SettingHandler` interface by which any team can render there setting UI component through this prop. This function prop takes below params which will allow the rendered UI component to communicate with parent scope.

```typescript
export interface SettingRendererProps {
  identifier: string
  onSettingSelectionChange: (val: string) => void
  onRestore: () => void
  settingValue: SettingDTO | undefined
  categoryAllSettings: Map<SettingType, SettingDTO>
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}
```

We created few reusable Setting components (Textbox, DropDown, Checkbox etc) in the [ReusableHandlers](https://github.com/wings-software/nextgenui/blob/master/src/modules/23-default-settings/components/ReusableHandlers.tsx) from which on boarding teams can take advantage of re using them while regestering there setting handlers

While onboarding a new setting if the present setting is depenedent on other settings then UI component can take advantage of the `categoryAllSettings` prop from the `SettingRendererProps` to keep a watch on any of the changed setting value and accordingly re render for your setting component

Example below renders Even or Odd as Text when test_setting_CD_3 value changes

```typescript
const DependendentValues: React.FC<SettingRendererProps> = ({
  categoryAllSettings: allSettings,
  setFieldValue,

  ...otherProps
}) => {
  const isEvenorOdd = (number: string | undefined) => {
    if (isUndefined(number)) {
      return ''
    }

    return parseInt(number) % 2 ? 'Odd' : 'Even'
  }

  useEffect(() => {
    setFieldValue(otherProps.identifier, isEvenorOdd(allSettings.get(SettingType.test_setting_CI_2)?.value))
  }, [allSettings.get(SettingType.test_setting_CI_2)?.value])
  return (
    <span>
      <span>Dependent Value</span>
      <DefaultSettingTextbox setFieldValue={setFieldValue} {...otherProps} allSettings={allSettings} />
    </span>
  )
}
```

## Feature Flags

We can optionally add settings based on feature flag. Example is below. Do make sure that we have FeatureFlag access at the place of the adding a settings
Below is the example where feature flag was used to optionally add the category. In the same way group and settings registration can also be done.

```typescript
export default function DefaultSettingsRoutes(): React.ReactElement {
  const flagEnabled = useFeatureFlag(FeatureFlag.EXAMPLE_FLAG)
  console.log({ flagEnabled })
  // Register  Category Factory only when Feature Flag is enabled
  if (flagEnabled) {
    DefaultSettingsFactory.registerCategory('CD', {
      icon: 'cd-main',
      label: 'common.purpose.cd.continuous',
      settingsAndGroupDisplayOrder: [
        SettingType.test_setting_CD_1,
        SettingType.test_setting_CD_2,
        SettingType.test_setting_CD_3
      ]
    })
  }

  return (
    <>
      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routes.toDefaultSettings({ ...accountPathProps })}
        exact
      >
        <SettingsList />
      </RouteWithLayout>
    </>
  )
}
```

## Categories to be displayed in a Module

We use `modulesWhereCategoryWillBeDisplayed` prop `SettingCategoryHandler` to decide one category should be displayed in any of the module.
When DefaultSettings page loads in common places like account/Org (non specific Module) pages it displayes all the Categories since those pages does not belong to any of the module.

## UI Order of Settings/ Groupings

We use `settingsAndGroupDisplayOrder` prop of the `SettingCategoryHandler` type to determine the display order of the settings on the UI. We can add `SettingGroups` enum, `SettingType` enum in combination to determine the order of the settings and group on the UI.
Frameworks takes care of the settings and groups which are registred but not added to `settingsAndGroupDisplayOrder` and displays them at the end on the UI. Same goes for the `settingsDisplayOrder` in `GroupedSettingsHandler`.
Framework will display only registered settings/ groups via `registerSettingHandler` and `registerGroupHandler` and even if extra settings/ groups added via `settingsAndGroupDisplayOrder` and `settingsDisplayOrder` will not be considered to display on UI

## Consumption

We can just call the backend api using `GetSettingValue` method by passing the setting id and scope values like project id , org id, account id and backend will resolve the setting values at various levels and gives a final value in the response which is relevant to the passed scope data
