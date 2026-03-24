<template>
  <input
    type="text"
    class="form-control"
    :value="displayValue"
    @input="onInput"
    @blur="onBlur"
    @focus="onFocus"
    v-bind="$attrs"
  />
</template>

<script>
import { computed } from "vue";

export default {
  name: "MoneyInput",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Number, String],
      default: 0,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const formatarMoeda = (valor) => {
      const numero = Number(valor || 0);
      if (isNaN(numero)) return "";

      return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const parseMoeda = (valor) => {
      if (!valor) return 0;

      const valorLimpo = String(valor)
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

      const numero = parseFloat(valorLimpo);
      return isNaN(numero) ? 0 : numero;
    };

    const displayValue = computed(() => formatarMoeda(props.modelValue));

    const onInput = (event) => {
      const valor = event.target.value;
      const numero = parseMoeda(valor);
      emit("update:modelValue", numero);
    };

    const onBlur = (event) => {
      event.target.value = formatarMoeda(props.modelValue);
    };

    const onFocus = (event) => {
      const numero = Number(props.modelValue || 0);
      event.target.value = numero ? String(numero).replace(".", ",") : "";
    };

    return {
      displayValue,
      onInput,
      onBlur,
      onFocus,
    };
  },
};
</script>