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
import { SettingType } from '@default-settings/interfaces/SettingType'

DefaultSettingsFactory.registerSettingTypeHandler(SettingType.test_setting_CORE_2, {
  label: 'pipeline.ACR.name',
  settingRenderer: props => <DependendentValues {...props} />
})
```

Example of a setting category registration:

```typescript
DefaultSettingsFactory.registerSettingCategory('CI', {
  icon: 'ci-main',
  label: 'common.purpose.ci.continuous',
  settings: [
    {
      settingTypes: new Set([SettingType.test_setting_CI_6, SettingType.test_setting_CI_7])
    },
    {
      groupId: SettingGroups.group_1,
      groupName: 'addStepGroup',
      settingTypes: new Set([
        SettingType.test_setting_CI_5,
        SettingType.test_setting_CI_2,
        SettingType.test_setting_CI_3
      ])
    },
    {
      groupId: SettingGroups.group_2,
      groupName: 'auditTrail.delegateGroups',
      settingTypes: new Set([SettingType.test_setting_CI_5, SettingType.test_setting_CI_4])
    }
  ]
})
```

The `DefaultSettingFactory` maintains a map of `SettingType` enum to `SettingHandler` interface implementations along with a map from the `SettingCategory` to `SettingCategoryHandler`. The commong settings between the map returned from DefaultSetting Factory and list of settings registered on the Backend which are returned by the api call are filtered by the setting UI to display it on the UI.

<img width="1023" alt="Screenshot 2021-04-08 at 10 01 04 AM" src="https://user-images.githubusercontent.com/73115842/179783330-92756bed-3c93-41ae-97e3-0aa2f590017c.png">

We expose `settingRenderer` function prop from the `SettingHandler` interface by which any team can render there setting UI component through this prop. This function prop takes below params which will allow the rendered UI component to communicate with parent scope.

```typescript
export interface SettingRendererProps {
  identifier: any
  onSettingSelectionChange: (val: string) => void
  onRestore: () => void
  settingValue: any
  allowedValues?: SettingDTO['allowedValues'] | undefined
  otherSettingsWhichAreChanged: Map<SettingType, SettingRequestDTO>
}
```

We created few reusable Setting components (Textbox, DropDown, Checkbox etc) in the [ReusableHandlers](https://github.com/wings-software/nextgenui/blob/master/src/modules/23-default-settings/components/ReusableHandlers.tsx) from which on boarding teams can take advantage of re using them while regestering there setting handlers

While onboarding a new setting if the present setting is depenedent on other settings then UI component can take advantage of the `otherSettingsWhichAreChanged` prop from the `SettingRendererProps` to keep a watch on any of the changed setting value and accordingly re render or your setting component

Example below renders Even or Odd as Text when test_setting_CD_3 value changes

```typescript
const DependendentValues: React.FC<SettingRendererProps> = ({ otherSettingsWhichAreChanged, ...otherProps }) => {
  const isEvenorOdd = (number: string | undefined) => {
    if (isUndefined(number)) {
      return ''
    }
    console.log({ number }, parseInt(number) % 2 ? 'Odd' : 'Even')

    return parseInt(number) % 2 ? 'Odd' : 'Even'
  }
  const [settingValue, updateSettingValue] = useState(
    isEvenorOdd(otherSettingsWhichAreChanged.get(SettingType.test_setting_CD_3)?.value)
  )
  useEffect(() => {
    console.log('otherSettingsWhichAreChanged', { otherSettingsWhichAreChanged })
    updateSettingValue(isEvenorOdd(otherSettingsWhichAreChanged.get(SettingType.test_setting_CD_3)?.value))
  }, [otherSettingsWhichAreChanged.get(SettingType.test_setting_CD_3)?.value])
  return (
    <DefaultSettingTextbox
      {...otherProps}
      otherSettingsWhichAreChanged={otherSettingsWhichAreChanged}
      settingValue={settingValue}
    />
  )
}
```

## Feature Flags

There are props in `SettingHandler` and `SettingCategoryHandler` to enable/disable a setting or setting category depending on the feature flag which is passed during the registration step. If a setting or category is not supplied with feature flag during registration is considered to be generally available and will be visible to all the users

## UI Order of Settings/ Groupings

We use `settings` prop of the `SettingCategoryHandler` type to determine the display order of the settings on the UI.
`settings` is of type `GroupedSettings`

```typescript
export interface GroupedSettings {
  groupName?: keyof StringsMap
  groupId?: SettingGroups
  settingTypes: Set<SettingType>
}
```

all the settings in `settingTypes` Set will be grouped under that `groupName` . Depending on if the value of `groupName` is supplied or not the UI will show the group name for that settings.
In below example Section we can see that there are three grouped settings where first group does not have a group name while other two have the name

```typescript
DefaultSettingsFactory.registerSettingCategory('CI', {
  icon: 'ci-main',
  label: 'common.purpose.ci.continuous',
  settings: [
    {
      settingTypes: new Set([SettingType.test_setting_CI_6, SettingType.test_setting_CI_7])
    },
    {
      groupId: SettingGroups.group_1,
      groupName: 'addStepGroup',
      settingTypes: new Set([
        SettingType.test_setting_CI_5,
        SettingType.test_setting_CI_2,
        SettingType.test_setting_CI_3
      ])
    },
    {
      groupId: SettingGroups.group_2,
      groupName: 'auditTrail.delegateGroups',
      settingTypes: new Set([SettingType.test_setting_CI_5, SettingType.test_setting_CI_4])
    }
  ]
})
```

<img width="1023" alt="Screenshot 2021-04-08 at 10 01 04 AM" src="https://user-images.githubusercontent.com/73115842/179783330-92756bed-3c93-41ae-97e3-0aa2f590017c.png">

## Consumption

We can just call the backend api using `GetSettingValue` method by passing the setting id and scope values like project id , org id, account id and backend will resolve the setting values at various levels and gives a final value in the response which is relevant to the passed scope data
