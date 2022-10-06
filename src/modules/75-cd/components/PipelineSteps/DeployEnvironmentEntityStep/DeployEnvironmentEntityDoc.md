# Possible scenarios

## GitOps Disabled

### Single Env view

- Environment selection

1. Select envRef => deployToAll - true, infraDefYaml - unset
2. Change envRef => deployToAll - true, infraDefYaml - unset
3. Clear envRef => deployToAll - unset, infraDefYaml - unset
4. Runtime envRef => deployToAll - RUNTIME_INPUT_VALUE, infraDefYaml - deployToAll - RUNTIME_INPUT_VALUE, environmentInputs: RUNTIME_INPUT_VALUE, serviceOverrideInputs: RUNTIME_INPUT_VALUE
5. On select or change of envRef, if envRef is not runtime, make input yaml call to get env inputs
6. Should delete be close instead?

- Loading Infrastructure

1. On select of envRef, if no initialValues exist, then set value to All and unset Yaml
2. On select of envRef, if initialValues exist, then set value to initialValues(all or selected). Unset yaml if All, else set
3. On select or load of infra refs and field is not runtime, then make input yaml call to get infra inputs
4. Do we allow clear of infraRef?

### Multi Env view

## GitOps Enabled

##Fixed Values only 1. When environment ref is selected, set deployToAll as true and infrastructureDef input should show all 2. When environment ref is changed, set deployToAll as true and infrastructreDef input should show all 3. When environment ref is cleared, clear deployToAll as well as infrastructureDef

When environment Ref is selected/changed 1. Infrastructure input should contain the array based on selection of options. If all is selected, then set deployToAll as true and infrastructureDef cleared from yaml, else set deployToAll as false and update the yaml
