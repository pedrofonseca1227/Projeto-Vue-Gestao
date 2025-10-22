<template>
  <div class="grafico-container">
    <canvas ref="graficoPeso"></canvas>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import Chart from "chart.js/auto";

export default {
  props: { dados: Array },
  setup(props) {
    const graficoPeso = ref(null);
    let chartInstance = null;

    const desenharGrafico = () => {
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(graficoPeso.value, {
        type: "line",
        data: {
          labels: props.dados.map(d => d.label),
          datasets: [
            {
              label: "Peso Médio (kg)",
              data: props.dados.map(d => d.peso),
              fill: false,
              borderColor: "#007bff",
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: false } }
        }
      });
    };

    onMounted(desenharGrafico);
    watch(() => props.dados, desenharGrafico);

    return { graficoPeso };
  }
};
</script>

<style scoped>
.grafico-container {
  background: #fff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
