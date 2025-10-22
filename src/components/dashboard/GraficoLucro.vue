<template>
  <div class="grafico-container">
    <canvas ref="graficoLucro"></canvas>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import Chart from "chart.js/auto";

export default {
  props: { dados: Array },
  setup(props) {
    const graficoLucro = ref(null);
    let chartInstance = null;

    const desenharGrafico = () => {
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(graficoLucro.value, {
        type: "bar",
        data: {
          labels: props.dados.map(d => d.label),
          datasets: [
            {
              label: "Lucro por Venda (R$)",
              data: props.dados.map(d => d.lucro),
              borderWidth: 1,
              backgroundColor: "rgba(255, 99, 132, 0.6)"
            }
          ]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    };

    onMounted(desenharGrafico);
    watch(() => props.dados, desenharGrafico);

    return { graficoLucro };
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
