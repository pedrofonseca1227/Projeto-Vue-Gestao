<template>
  <div class="grafico-container">
    <canvas ref="graficoDistribuicao"></canvas>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import Chart from "chart.js/auto";

export default {
  props: { dados: Array },
  setup(props) {
    const graficoDistribuicao = ref(null);
    let chartInstance = null;

    const desenhar = () => {
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(graficoDistribuicao.value, {
        type: "doughnut",
        data: {
          labels: props.dados.map(d => d.label),
          datasets: [{
            data: props.dados.map(d => d.valor),
            backgroundColor: ["#dc3545", "#28a745", "#ffc107"],
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        },
      });
    };

    onMounted(desenhar);
    watch(() => props.dados, desenhar);

    return { graficoDistribuicao };
  }
};
</script>

<style scoped>
.grafico-container {
  background: #fff;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}
</style>
