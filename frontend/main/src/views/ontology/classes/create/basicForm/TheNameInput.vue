<template>
  <Form ref="formRef" :model="formState" :rules="rules">
    <Form.Item label="" name="name">
      <Input
        autocomplete="off"
        v-model:value="formState.name"
        :placeholder="t('business.ontology.createHolder')"
        @blur="handleBlur"
        @change="handleNameChange"
        allow-clear
      />
    </Form.Item>
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, watch, onMounted } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import emitter from 'tiny-emitter/instance';
  import {
    validateClassificationNameApi,
    validateClassNameApi,
  } from '/@/api/business/datasetOntology';
  import { ValidateNameParams } from '/@/api/business/model/datasetOntologyModel';
  import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';

  const { t } = useI18n();

  const props = defineProps<{
    name: string | undefined;
    activeTab: ClassTypeEnum;
    datasetId?: string | number;
    isCenter?: boolean;
    baseFormName: string;
  }>();
  const emits = defineEmits(['update:name', 'valid']);

  watch(
    () => props.name,
    () => {
      formState.name = props.name;
    },
  );

  const formRef = ref();
  const formState: { name: string | undefined } = reactive({
    name: undefined,
  });
  watch(
    () => formState.name,
    () => {
      emits('update:name', formState.name);
    },
  );
  onMounted(() => {
    console.log('name input');
  });

  /** Validate Name */
  const validateName = async (_rule: RuleObject, value: string) => {
    if (!value) {
      afterValid(false);
      return Promise.reject(t('business.ontology.modal.nameRequired'));
    } else {
      // OntologyCenter | DatasetOntology
      if (!props.isCenter) {
        if (value === props.baseFormName) {
          // name has not changed, no duplicate name verification
          afterValid(true, value);
          return Promise.resolve();
        }

        const params: ValidateNameParams = {
          name: formState.name ?? '',
          datasetId: props.datasetId as number,
        };
        if (props.activeTab == ClassTypeEnum.CLASS) {
          try {
            const res = await validateClassNameApi(params);
            if (!res) {
              afterValid(true, value);
              return Promise.resolve();
            } else {
              emits('valid', true);
              const text =
                t('business.class.class') +
                ` "${params.name}" ` +
                t('business.ontology.modal.alreadyExits') +
                t('business.ontology.modal.enterNewName');
              return Promise.reject(text);
            }
          } catch {}
        } else {
          try {
            const res = await validateClassificationNameApi(params);
            if (!res) {
              afterValid(true, value);
              return Promise.resolve();
            } else {
              emits('valid', true);
              const text =
                t('business.class.classification') +
                ` "${params.name}" ` +
                t('business.ontology.modal.alreadyExits') +
                t('business.ontology.modal.enterNewName');
              return Promise.reject(text);
            }
          } catch {}
        }
      } else {
        // DatasetOntology
        // -- no duplicate name verification
        afterValid(true, value);
        return Promise.resolve();
      }
    }
  };
  // method after verification
  const afterValid = (isValid: boolean, newName?: string) => {
    if (isValid) {
      emits('valid', false); // Pass validation, submit to formModal , control buttons are disabled
      emitter.emit('changeRootName', newName); // Change the root node of tree
    } else {
      emits('valid', true);
    }
  };

  const rules = {
    name: [
      { required: true, validator: validateName, trigger: 'blur' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };

  const handleBlur = () => {
    formRef.value.validate();
  };
  const handleNameChange = () => {
    if (!formState.name) emits('valid', true);
    else emits('valid', false);
  };
  // const handleBlur = (newValue) => {
  //   console.log('blur: ', newValue);
  //   validateName({}, newValue);
  // };
  // const handleNameChange = () => {
  //   if (!name.value) emits('valid', true);
  //   else emits('valid', false);
  // };
</script>
<style lang="less" scoped></style>
