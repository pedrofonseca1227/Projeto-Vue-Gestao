<template>
  <div class="dashboard">
    <h1 class="titulo">📊 Dashboard do Confinamento</h1>

    <div class="cards-container">
      <CardIndicador titulo="Lotes Ativos" :valor="totalLotes" />
      <CardIndicador titulo="Total de Bois" :valor="totalAnimais" />
      <CardIndicador titulo="Receita Total" prefixo="R$ " :valor="formatarValor(receitaTotal)" />
      <CardIndicador titulo="Custo Total" prefixo="R$ " :valor="formatarValor(custoTotal)" />
      <CardIndicador titulo="Lucro Total" prefixo="R$ " :valor="formatarValor(lucroTotal)" destaque />
    </div>

    <GraficoLucro :dados="dadosLucro" class="mb-4" />
    <GraficoPeso :dados="dadosPeso" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from "@/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import CardIndicador from "@/components/dashboard/CardIndicador.vue";
import GraficoLucro from "@/components/dashboard/GraficoLucro.vue";
import GraficoPeso from "@/components/dashboard/GraficoPeso.vue";

export default {
  components: { CardIndicador, GraficoLucro, GraficoPeso },
  setup() {
    const totalLotes = ref(0);
    const totalAnimais = ref(0);
    const receitaTotal = ref(0);
    const custoTotal = ref(0);
    const lucroTotal = ref(0);
    const dadosLucro = ref([]);
    const dadosPeso = ref([]);

    const formatarValor = (valor) => parseFloat(valor || 0).toFixed(2);

    const carregarDados = async () => {
      const snapLotes = await getDocs(collection(db, "LotesConfinamento"));
      totalLotes.value = snapLotes.size;
      totalAnimais.value = snapLotes.docs.reduce((t, d) => t + (d.data().quantidade || 0), 0);
      dadosPeso.value = snapLotes.docs.map(d => ({
        label: d.data().id || "Sem ID",
        peso: d.data().pesoInicial || 0
      }));

      const snapVendas = await getDocs(collection(db, "RegistroVendasLotes"));
      const vendas = snapVendas.docs.map(d => d.data());
      receitaTotal.value = vendas.reduce((t, v) => t + (v.receita || 0), 0);
      custoTotal.value = vendas.reduce((t, v) => t + (v.custo || 0), 0);
      lucroTotal.value = vendas.reduce((t, v) => t + (v.lucro || 0), 0);
      dadosLucro.value = vendas.map(v => ({
        label: v.dataVenda?.toDate?.().toLocaleDateString("pt-BR") || "Sem Data",
        lucro: v.lucro || 0
      }));
    };

    onMounted(carregarDados);

    return { totalLotes, totalAnimais, receitaTotal, custoTotal, lucroTotal, formatarValor, dadosLucro, dadosPeso };
  }
};
</script>

<style scoped>
.dashboard {
  padding: 30px;
  background: #f9f9f9;
  min-height: 100vh;
}
.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}
</style>
