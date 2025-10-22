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

    const desenhar = () => {
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(graficoLucro.value, {
        type: "line",
        data: {
          labels: props.dados.map(d => d.mes),
          datasets: [{
            label: "Lucro Mensal (R$)",
            data: props.dados.map(d => d.lucro),
            borderColor: "#28a745",
            backgroundColor: "rgba(40, 167, 69, 0.2)",
            tension: 0.3,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "top" } },
          scales: { y: { beginAtZero: true } },
        },
      });
    };

    onMounted(desenhar);
    watch(() => props.dados, desenhar);

    return { graficoLucro };
  }
};
</script>

<style scoped>
.grafico-container {
  background: #fff;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
