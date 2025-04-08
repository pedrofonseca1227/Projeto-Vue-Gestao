<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Relatórios de Movimentação de Estoque</h2>

    <!-- Filtros do relatório -->
    <div class="row mb-3">
      <div class="col-md-4">
        <label for="produtoFiltro" class="form-label">Produto</label>
        <input v-model="filtro.produto" type="text" class="form-control" id="produtoFiltro" placeholder="Filtrar por produto" />
      </div>

      <div class="col-md-4">
        <label for="dataInicio" class="form-label">Data Inicial</label>
        <input v-model="filtro.dataInicio" type="date" class="form-control" id="dataInicio" />
      </div>

      <div class="col-md-4">
        <label for="dataFim" class="form-label">Data Final</label>
        <input v-model="filtro.dataFim" type="date" class="form-control" id="dataFim" />
      </div>
    </div>

    <div class="text-center mb-3">
      <button @click="limparFiltros" class="btn btn-secondary me-2">Limpar Filtros</button>
      <button @click="aplicarFiltros" class="btn btn-primary">Aplicar Filtros</button>
    </div>

    <!-- Tabela de Histórico -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Localização</th>
            <th>Funcionário</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mov in movimentacoesFiltradas" :key="mov.id">
            <td>{{ mov.produto || "N/A" }}</td>
            <td>{{ mov.quantidade || 0 }}</td>
            <td>{{ mov.tipo || "N/A" }}</td>
            <td>{{ mov.descricao || "Sem descrição" }}</td>
            <td>{{ mov.localizacao || "Desconhecida" }}</td>
            <td>{{ mov.funcionario || "Desconhecido" }}</td>
            <td>{{ formatarData(mov.data) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      movimentacoes: [],
      filtro: {
        produto: "",
        dataInicio: "",
        dataFim: "",
      },
    };
  },
  async created() {
    try {
      const querySnapshot = await getDocs(collection(db, "movimentacao_estoque"));
      this.movimentacoes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
      alert("Erro ao carregar movimentações. Tente novamente.");
    }
  },
  computed: {
    movimentacoesFiltradas() {
      return this.movimentacoes.filter(mov => {
        const dataMov = mov.data ? new Date(mov.data) : null;
        const dataInicio = this.filtro.dataInicio ? new Date(this.filtro.dataInicio) : null;
        const dataFim = this.filtro.dataFim ? new Date(this.filtro.dataFim) : null;

        const produtoMatch = mov.produto?.toLowerCase().includes(this.filtro.produto.toLowerCase() || "");
        const dataMatch = (!dataMov || (!dataInicio || dataMov >= dataInicio) && (!dataFim || dataMov <= dataFim));

        return produtoMatch && dataMatch;
      });
    },
  },
  methods: {
    formatarData(data) {
      if (!data) return "Sem data";
      const d = new Date(data);
      return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    },
    aplicarFiltros() {
      // Lógica para aplicar filtros
    },
    limparFiltros() {
      this.filtro.produto = "";
      this.filtro.dataInicio = "";
      this.filtro.dataFim = "";
    },
  },
};
</script>

<style scoped>
.table th, .table td {
  text-align: center;
}
.table th {
  background-color: #f8f9fa;
  color: #495057;
}
.table td {
  font-size: 0.9rem;
}
.text-center {
  text-align: center;
}
</style>
