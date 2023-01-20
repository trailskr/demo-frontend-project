<script setup lang="ts">
  import NatCheckbox from '@/ui/Forms/Checkbox/NatCheckbox.vue'
  import { FetchOptions, SelectFetch } from '@/ui/Forms/Inputs/Select/inputSelect'
  import { v } from '@/utils/Validation'
  import { fullTextSearch } from '@/utils/utils'

  const validation = reactive(v())

  const boolean1 = ref<boolean>()

  const disabled = ref(false)

  const getOptionsText = () => ([
    'value1',
    'value2',
    'value3',
    'value4'
  ])

  const optionText = ref(getOptionsText())

  interface ObjectOption {
    id: number
    textField: string
    someField: string
  }

  interface ObjectOption2 {
    id: string
    name: string
  }

  const getOptionsObject = () => ([{
    id: 1,
    groupId: 1,
    groupName: 'Group 1',
    textField: 'name1',
    someField: 'some1'
  }, {
    id: 2,
    groupId: 1,
    groupName: 'Group 1',
    textField: 'name2',
    someField: 'some2'
  }, {
    id: 3,
    groupId: 2,
    groupName: 'Group 2',
    textField: 'name3',
    someField: 'some3'
  }, {
    id: 4,
    groupId: 2,
    groupName: 'Group 2',
    textField: 'name4',
    someField: 'some4',
    disabled: true
  }])

  const optionsObject = ref<ObjectOption[]>(getOptionsObject())

  const typedOptions = ref(['Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias aperiam consectetur delectus deserunt dignissimos dolore doloremque iusto necessitatibus quibusdam rem sed velit vero, voluptates. Magni obcaecati omnis quos ullam voluptates.', 'Loremipsumdolorsitamet,consecteturadipisicingelit.Aliasaperiamconsecteturdelectusdeseruntdignissimosdoloredoloremqueiustonecessitatibusquibusdamremsedvelitvero,voluptates.Magniobcaecatiomnisquosullamvoluptates.', 'Abkhazia', 'Australia', 'Austria', 'Azerbaijan', 'Albania', 'Algeria', 'American Samoa', 'Anguilla', 'Angola', 'Andorra', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Afghanistan', 'Bahamas', 'Bangladesh', 'Barbados', 'Bahrain', 'Belarus', 'Belize', 'Belgium', 'Benin', 'Bermuda', 'Bulgaria', 'Bolivia, Multinational State', 'Bonaire, Saba and Sint-Eustatius', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'British Indian Ocean Territory', 'Brunei Darussalam', 'Burkina Faso', 'Burundi', 'Bhutan', 'Vanuatu', 'Hungary', 'Venezuela Bolivarian Republic of', 'Virgin Islands, British', 'Virgin Islands, USA', 'Vietnam', 'Gabon', 'Haiti', 'Guyana', 'Gambia', 'Ghana', 'Guadeloupe', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Germany', 'Guernsey', 'Gibraltar', 'Honduras', 'Hong Kong', 'Hong Kong Special Administrative Region of China', 'Grenada', 'Greenland', 'Greece', 'Georgia', 'Guam', 'Denmark', 'Jersey', 'Djibouti', 'Dominica', 'Dominican Republic', 'Egypt', 'Zambia', 'Western Sahara', 'Zimbabwe', 'Israel', 'India', 'Indonesia', 'Jordan', 'Iraq', 'Iran, Islamic Republic', 'Ireland', 'Iceland', 'Spain', 'Italy', 'Yemen', 'Cape Verde', 'Kazakhstan', 'Cambodia', 'Cameroon', 'Canada', 'Qatar', 'Kenya', 'Cyprus', 'Kyrgyzstan', 'Kiribati', 'China', 'Coconut (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Congo, Democratic Republic', 'Korea, Democratic People\'s Republic', 'Korea, Republic', 'Costa Rica', 'Ivory Coast', 'Cuba', 'Kuwait', 'Curacao', 'Laos', 'Latvia', 'Lesotho', 'Lebanon', 'Libyan Arab Jamahiriya', 'Socialist People\'s Libyan Arab Jamahiriya', 'Liberia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Mauritius', 'Mauritania', 'Madagascar', 'Mayotte', 'Macau', 'Malawi', 'Malaysia', 'Mali', 'Small Pacific Remote Islands of the United States', 'Maldives', 'Malta', 'Morocco', 'Martinique', 'Marshall Islands', 'Mexico', 'Micronesia, Federated States of', 'Mozambique', 'Moldova, Republic of', 'Monaco', 'Mongolia', 'Montserrat', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Niger', 'Nigeria', 'Netherlands', 'Nicaragua', 'Niue', 'New Zealand', 'New Caledonia', 'Norway', 'United Arab Emirates', 'Oman', 'Bouvet Island', 'Isle of Man', 'Norfolk Island', 'Christmas Island', 'Heard Island and McDonald Islands', 'Cayman Islands', 'Cook Islands', 'Turks and Caicos Islands', 'Pakistan', 'Palau', 'Occupied Palestinian Territory', 'Panama', 'Papal See (State — Vatican City)', 'Papua New Guinea', 'Paraguay', 'Peru', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Republic of Macedonia', 'Reunion', 'Russia', 'Rwanda', 'Romania', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Swaziland', 'Saint Helena, Ascension Island, Tristan da Cunha', 'Northern Mariana Islands', 'Saint Barthelemy', 'Saint Martin', 'Senegal', 'Saint Vincent and the Grenadines', 'Saint Lucia', 'Saint Kitts and Nevis', 'Saint Pierre and Miquelon', 'Serbia', 'Seychelles', 'Singapore', 'Sint Maarten', 'Syrian Arab Republic', 'Slovakia', 'Slovenia', 'United Kingdom', 'United States', 'Solomon Islands', 'Somalia', 'Sudan', 'Suriname', 'Sierra Leone', 'Tajikistan', 'Thailand', 'Taiwan (China)', 'Tanzania, United Republic of', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tuvalu', 'Tunisia', 'Turkmenistan', 'Turkey', 'Uganda', 'Uzbekistan', 'Ukraine', 'Wallis and Futuna', 'Uruguay', 'Faroe Islands', 'Fiji', 'Philippines', 'Finland', 'Falkland Islands (Malvinas)', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Croatia', 'Central African Republic', 'Chad', 'Montenegro', 'Czech Republic', 'Chile', 'Switzerland', 'Sweden', 'Svalbard and Jan Mayen', 'Sri Lanka', 'Democratic Socialist Republic of Sri Lanka', 'Ecuador', 'Equatorial Guinea', 'Eland Islands', 'El Salvador', 'Eritrea', 'Estonia', 'Ethiopia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'South Ossetia', 'South Sudan', 'Jamaica', 'Japan'])
  const typedObjectOptions = computed<ObjectOption2[]>(() => typedOptions.value.map((name) => ({ id: name, name })))

  const selectedText = ref<string | null>(optionText.value[2])
  const selectedTexts = ref<string[]>([])
  const selectedTags = ref<string[]>([])

  const selectedObject1 = ref<ObjectOption | null>()
  const selectedObject2 = ref<ObjectOption | null>(optionsObject.value[2])
  const selectedObject3 = ref<ObjectOption2 | null>()
  const selectedObjects1 = ref<ObjectOption[]>([])

  const selectedId1 = ref<number | null>()

  const typedText0 = ref('')
  const typedText1 = ref('')
  const typedText2 = ref('')

  const selectedAsyncText1 = ref()
  const selectedAsyncObject2 = ref<ObjectOption2[]>([])

  const changeOptionsText = () => {
    optionText.value = optionText.value.length === getOptionsText().length
      ? optionText.value.slice(2)
      : getOptionsText()
  }

  const changeOptionsObject = () => {
    optionsObject.value = optionsObject.value.length === getOptionsObject().length
      ? optionsObject.value.slice(2)
      : getOptionsObject()
  }

  const reverseText = (text: string) => {
    return text ? text.split('').reverse().join('') : ''
  }

  const reverseTextFromObject = (item: ObjectOption) => {
    return item ? reverseText(item.textField + (item.someField ? ' (' + item.someField + ')' : '')) : ''
  }

  const fetchTextOptions: SelectFetch<string> = (event: FetchOptions) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const options = !event.query
          ? typedOptions.value
          : typedOptions.value
            .map((item) => ({ result: fullTextSearch(item, event.query, false), item }))
            .filter((item) => item.result)
            .map((item) => item.item)
        resolve(options.slice(event.offset, event.offset + event.limit))
      }, 500)
    })
  }

  const fetchObjectOptions: SelectFetch<ObjectOption2> = (event: FetchOptions) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const options = !event.query
          ? typedObjectOptions.value
          : typedObjectOptions.value
            .map((item) => ({ result: fullTextSearch(item.name, event.query, false), item }))
            .filter((item) => item.result)
            .map((item) => item.item)
        resolve(options.slice(event.offset, event.offset + event.limit))
      }, 500)
    })
  }
</script>

<template>
  <NatForm class="space-y-2">
    Form is invalid: {{ validation.isInvalid }}
    <legend class="grid grid-cols-[2fr_2fr] gap-2">
      <div class="flex items-center space-x-2">
        <NatCheckbox
          v-model="disabled"
          label="disabled"
        />
        <NatButton
          @click="changeOptionsText()"
        >
          Edit the list of rows
        </NatButton>
        <NatButton
          @click="changeOptionsObject()"
        >
          Change the list of objects
        </NatButton>
      </div>
    </legend>
    <UiInputField
      label="Rich Text"
      :modelValue="typedText0"
    >
      <NatAsyncRichText
        v-model="typedText0"
        label="typedText0"
        :disabled="disabled"
      />
    </UiInputField>
    <UiInputField
      label="Tagging mode [tagging]"
      :modelValue="typedText1"
    >
      <NatSelect
        v-model="typedText1"
        label="typedText1"
        :disabled="disabled"
        :options="typedOptions"
        tagging
      />
    </UiInputField>
    <UiInputField
      label="Selecting from a list of strings"
      :modelValue="typedText2"
    >
      <NatSelect
        v-model="typedText2"
        :disabled="disabled"
        :options="typedOptions"
      />
    </UiInputField>
    <UiInputField
      label="Simple selection from a list of strings"
      :modelValue="selectedText"
    >
      <NatSelect
        v-model="selectedText"
        label="selectedText"
        :disabled="disabled"
        :options="optionText"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedText"
          :valueToSet="optionText[0]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Simple selection from a list of strings with a custom text display function (reverseText)"
      :modelValue="selectedText"
    >
      <NatSelect
        v-model="selectedText"
        label="selectedText"
        :disabled="disabled"
        :optionText="reverseText"
        :options="optionText"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedText"
          :valueToSet="optionText[0]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Simple selection from the list of objects (the default object ID is the 'id' field):"
      :modelValue="selectedObject1"
    >
      <NatSelect
        v-model="selectedObject1"
        label="selectedObject1"
        :disabled="disabled"
        :options="optionsObject"
        optionText="textField"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedObject1"
          :valueToSet="optionsObject[0]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Simple selection from the list of objects with grouping:"
      :modelValue="selectedObject1"
    >
      <NatSelect
        v-model="selectedObject1"
        label="selectedObject1"
        :disabled="disabled"
        :options="optionsObject"
        optionText="textField"
        grouping
        optionGroupKey="groupId"
        optionGroupText="groupName"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedObject1"
          :valueToSet="optionsObject[0]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Selecting from the list of objects, and getting the value from the object ID [keyAsModel]"
      :modelValue="selectedId1"
    >
      <NatSelect
        v-model="selectedId1"
        label="selectedId1"
        :disabled="disabled"
        :options="optionsObject"
        keyAsModel
        optionText="textField"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedId1"
          :valueToSet="optionsObject[0].id"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Simple selection from a list of objects with a custom text display function (reverse Text From Object(ListItem))"
      :modelValue="selectedObject2"
    >
      <NatSelect
        v-model="selectedObject2"
        label="selectedObject2"
        :disabled="disabled"
        :options="optionsObject"
        :optionText="reverseTextFromObject"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedObject2"
          :valueToSet="optionsObject[0]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Multi selection from a list of strings:"
      :modelValue="selectedTexts"
    >
      <NatSelect
        v-model="selectedTexts"
        label="selectedTexts"
        multiple
        :disabled="disabled"
        :options="optionText"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedTexts"
          :valueToSet="[optionText[0], optionText[1]]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Multi selection from the list of objects"
      :modelValue="selectedObjects1"
    >
      <NatSelect
        v-model="selectedObjects1"
        label="selectedObjects1"
        multiple
        :disabled="disabled"
        :options="optionsObject"
        optionText="textField"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedObjects1"
          :valueToSet="[optionsObject[0], optionsObject[1]]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Multi selection from the list of objects with grouping and allowSelectGroups groupsHorisontal"
      :modelValue="selectedObjects1"
    >
      <NatSelect
        v-model="selectedObjects1"
        label="selectedObjects1"
        multiple
        :disabled="disabled"
        :options="optionsObject"
        optionText="textField"
        grouping
        optionGroupKey="groupId"
        optionGroupText="groupName"
        allowSelectGroups
        groupsHorisontal
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedObjects1"
          :valueToSet="[optionsObject[0], optionsObject[1]]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Tagging [multiple] [tagging] (only lists of strings are possible)"
      :modelValue="selectedTags"
    >
      <NatSelect
        v-model="selectedTags"
        label="selectedTags"
        multiple
        tagging
        css="form-control"
        :disabled="disabled"
        :options="optionText"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedTags"
          :valueToSet="[optionText[0], optionText[1]]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Selection using asynchronous string search"
      :modelValue="selectedAsyncText1"
    >
      <NatSelect
        v-model="selectedAsyncText1"
        label="selectedAsyncText1"
        :disabled="disabled"
        :fetch="fetchTextOptions"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedAsyncText1"
          :valueToSet="typedOptions[typedOptions.length - 1]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Selection using asynchronous object search"
      :modelValue="selectedObject3"
    >
      <NatSelect
        v-model="selectedObject3"
        label="selectedObject3"
        :disabled="disabled"
        :fetch="fetchObjectOptions"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedObject3"
          :valueToSet="typedObjectOptions[typedOptions.length - 1]"
        />
      </template>
    </UiInputField>
    <UiInputField
      label="Multi-selection using asynchronous object search"
      :modelValue="selectedAsyncObject2"
    >
      <NatSelect
        v-model="selectedAsyncObject2"
        label="selectedAsyncObject2"
        multiple
        :disabled="disabled"
        :fetch="fetchObjectOptions"
      />
      <template #controls>
        <UiSelectControls
          v-model="selectedAsyncObject2"
          :valueToSet="[typedObjectOptions[4]]"
        />
      </template>
    </UiInputField>
    <div class="space-y-2">
      <ViewValue :modelValue="boolean1" />
      <NatCheckbox
        v-model="boolean1"
        label="Boolean field"
        placeholder="text"
      />
      <ViewValue :modelValue="boolean1" />
      <NatCheckbox
        v-model="boolean1"
        disabled
        label="Boolean field"
        placeholder="text"
      />
    </div>
  </NatForm>
</template>
