<template>
  <div>
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default {
  name: 'PieChart',
  components: {
    Pie,
  },
  data() {
    return {
      chartData: {
        labels: ['Pasto', 'Confinamento'],
        datasets: [
          {
            label: 'Quantidade de Bovinos',
            backgroundColor: ['#007bff', '#17a2b8'],
            data: [120, 80], // Dados fictícios, adapte depois
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: false,
          },
        },
      },
    };
  },
};
</script>

<style scoped>
div {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
