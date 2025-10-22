<template>
  <div class="grafico-container">
    <canvas ref="graficoRendimento"></canvas>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import Chart from "chart.js/auto";

export default {
  props: { dados: Array },
  setup(props) {
    const graficoRendimento = ref(null);
    let chartInstance = null;

    const desenhar = () => {
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(graficoRendimento.value, {
        type: "bar",
        data: {
          labels: props.dados.map(d => d.label),
          datasets: [{
            label: "Rendimento (%)",
            data: props.dados.map(d => d.rendimento),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
          }],
        },
        options: {
          responsive: true,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, max: 100 } },
        },
      });
    };

    onMounted(desenhar);
    watch(() => props.dados, desenhar);

    return { graficoRendimento };
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
