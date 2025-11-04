<template>
  <div class="relatorios">
    <h1 class="titulo">📈 Relatórios Analíticos do Confinamento</h1>

    <div class="cards-container">
      <CardResumo titulo="Lucro Médio por Mês" prefixo="R$ " :valor="formatarValor(lucroMedioMensal)" />
      <CardResumo titulo="Custo Médio por Lote" prefixo="R$ " :valor="formatarValor(custoMedioLote)" />
      <CardResumo titulo="Receita Média por Lote" prefixo="R$ " :valor="formatarValor(receitaMediaLote)" />
      <CardResumo titulo="Rendimento Médio" :valor="rendimentoMedio.toFixed(1) + '%'" />
    </div>

    <GraficoLucroMensal :dados="dadosLucroMensal" class="mb-4" />
    <GraficoDistribuicao :dados="dadosDistribuicao" class="mb-4" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from "@/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import CardResumo from "@/components/relatorios/CardResumo.vue";
import GraficoLucroMensal from "@/components/relatorios/GraficoLucroMensal.vue";
import GraficoDistribuicao from "@/components/relatorios/GraficoDistribuicao.vue";

export default {
  components: { CardResumo, GraficoLucroMensal, GraficoDistribuicao  },
  setup() {
    const dadosLucroMensal = ref([]);
    const dadosDistribuicao = ref([]);
    const dadosRendimento = ref([]);
    const lucroMedioMensal = ref(0);
    const custoMedioLote = ref(0);
    const receitaMediaLote = ref(0);
    const rendimentoMedio = ref(0);

    const formatarValor = (v) => parseFloat(v || 0).toFixed(2);

    const carregarDados = async () => {
      const snap = await getDocs(collection(db, "RegistroVendasLotes"));
      const vendas = snap.docs.map((d) => d.data());

      // Agrupar lucro por mês
      const lucroPorMes = {};
      vendas.forEach((v) => {
        const data = v.dataVenda?.toDate?.() || new Date();
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
        if (!lucroPorMes[chave]) lucroPorMes[chave] = 0;
        lucroPorMes[chave] += v.lucro || 0;
      });
      dadosLucroMensal.value = Object.entries(lucroPorMes).map(([mes, lucro]) => ({ mes, lucro }));

      // Médias
      lucroMedioMensal.value = Object.values(lucroPorMes).reduce((a, b) => a + b, 0) / Object.keys(lucroPorMes).length || 0;
      custoMedioLote.value = vendas.reduce((a, v) => a + (v.custo || 0), 0) / vendas.length || 0;
      receitaMediaLote.value = vendas.reduce((a, v) => a + (v.receita || 0), 0) / vendas.length || 0;

      // Distribuição de custos x receitas
      const totalCusto = vendas.reduce((a, v) => a + (v.custo || 0), 0);
      const totalLucro = vendas.reduce((a, v) => a + (v.lucro || 0), 0);
      const totalReceita = vendas.reduce((a, v) => a + (v.receita || 0), 0);
      dadosDistribuicao.value = [
        { label: "Custo", valor: totalCusto },
        { label: "Lucro", valor: totalLucro },
        { label: "Receita", valor: totalReceita },
      ];

      // Rendimento médio
      const detalhes = vendas.flatMap((v) => v.detalhes || []);
      rendimentoMedio.value = detalhes.reduce((a, d) => a + (d.rendimento || 0), 0) / (detalhes.length || 1);

      // Rendimento por lote
      dadosRendimento.value = detalhes.map((d) => ({
        label: d.id,
        rendimento: d.rendimento || 0,
      }));
    };

    onMounted(carregarDados);

    return {
      dadosLucroMensal,
      dadosDistribuicao,
      dadosRendimento,
      lucroMedioMensal,
      custoMedioLote,
      receitaMediaLote,
      rendimentoMedio,
      formatarValor,
    };
  },
};
</script>

<style scoped>
.relatorios {
  padding: 30px;
  background: #f9f9f9;
  min-height: 100vh;
}
.titulo {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
}
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}
</style>
