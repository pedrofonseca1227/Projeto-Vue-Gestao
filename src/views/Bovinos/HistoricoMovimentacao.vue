<template>
  <div class="container mt-5">
    <h2 class="fw-bold text-center mb-4 text-primary">
      📜 Histórico de Movimentações
    </h2>

    <!-- RESUMO -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">Total de Registros</h6>
          <h3 class="fw-bold text-primary">{{ movimentacoesFiltradas.length }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">Quantidade Movimentada</h6>
          <h3 class="fw-bold text-success">{{ quantidadeTotalMovimentada }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">Custo Total</h6>
          <h3 class="fw-bold text-warning">R$ {{ formatarValor(custoTotalMovimentado) }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">Último Registro</h6>
          <h6 class="fw-bold text-dark">{{ ultimaDataMovimentacao }}</h6>
        </div>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="card p-4 shadow-sm mb-4">
      <h5 class="text-primary border-bottom pb-2 mb-3">🔎 Filtros</h5>

      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Tipo</label>
          <select v-model="filtros.tipo" class="form-select">
            <option value="">Todos</option>
            <option value="ENTRADA">ENTRADA</option>
            <option value="TRANSFERENCIA">TRANSFERENCIA</option>
            <option value="VENDA">VENDA</option>
            <option value="AJUSTE">AJUSTE</option>
            <option value="MORTE">MORTE</option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Lote</label>
          <input
            v-model="filtros.lote"
            class="form-control"
            placeholder="Buscar por ID do lote"
          />
        </div>

        <div class="col-md-2">
          <label class="form-label">Linha</label>
          <input
            v-model="filtros.linha"
            class="form-control"
            placeholder="Ex: A1"
          />
        </div>

        <div class="col-md-2">
          <label class="form-label">Data inicial</label>
          <input v-model="filtros.dataInicio" type="date" class="form-control" />
        </div>

        <div class="col-md-2">
          <label class="form-label">Data final</label>
          <input v-model="filtros.dataFim" type="date" class="form-control" />
        </div>
      </div>

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" @click="limparFiltros">
          Limpar filtros
        </button>
        <button class="btn btn-outline-primary" @click="carregarMovimentacoes">
          Atualizar
        </button>
      </div>
    </div>

    <div
      v-if="mensagem"
      class="alert text-center"
      :class="mensagem.startsWith('✅') ? 'alert-success' : 'alert-danger'"
    >
      {{ mensagem }}
    </div>

    <!-- TABELA -->
    <div class="card p-3 shadow-sm">
      <h5 class="fw-bold mb-3">📁 Registros</h5>

      <div v-if="carregando" class="text-center text-muted py-4">
        Carregando movimentações...
      </div>

      <div v-else-if="movimentacoesFiltradas.length" class="table-responsive">
        <table class="table table-bordered table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Lote Origem</th>
              <th>Lote Destino</th>
              <th>Linha Origem</th>
              <th>Linha Destino</th>
              <th>Quantidade</th>
              <th>Custo Unit.</th>
              <th>Custo Total</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="mov in movimentacoesFiltradas" :key="mov.docId">
              <td>{{ formatarData(mov.dataMovimentacao) }}</td>
              <td>
                <span class="badge" :class="getBadgeClass(mov.tipo)">
                  {{ mov.tipo }}
                </span>
              </td>
              <td>{{ mov.loteOrigemId || "-" }}</td>
              <td>{{ mov.loteDestinoId || "-" }}</td>
              <td>{{ mov.linhaOrigem || "-" }}</td>
              <td>{{ mov.linhaDestino || "-" }}</td>
              <td>{{ mov.quantidade ?? "-" }}</td>
              <td>R$ {{ formatarValor(mov.custoUnitario) }}</td>
              <td>R$ {{ formatarValor(mov.custoTotal) }}</td>
              <td>
                <button class="btn btn-sm btn-primary" @click="abrirDetalhes(mov)">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center text-muted py-4">
        Nenhuma movimentação encontrada.
      </div>
    </div>

    <!-- MODAL -->
    <div
      class="modal fade"
      tabindex="-1"
      aria-hidden="true"
      :class="{ 'd-block show': movimentacaoSelecionada }"
      v-if="movimentacaoSelecionada"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Detalhes da Movimentação
            </h5>
            <button type="button" class="btn-close" @click="fecharDetalhes"></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <p><strong>Tipo:</strong> {{ movimentacaoSelecionada.tipo || "-" }}</p>
                <p><strong>Data:</strong> {{ formatarData(movimentacaoSelecionada.dataMovimentacao) }}</p>
                <p><strong>Quantidade:</strong> {{ movimentacaoSelecionada.quantidade ?? "-" }}</p>
                <p><strong>Custo Unitário:</strong> R$ {{ formatarValor(movimentacaoSelecionada.custoUnitario) }}</p>
                <p><strong>Custo Total:</strong> R$ {{ formatarValor(movimentacaoSelecionada.custoTotal) }}</p>
              </div>

              <div class="col-md-6">
                <p><strong>Lote Origem:</strong> {{ movimentacaoSelecionada.loteOrigemId || "-" }}</p>
                <p><strong>Lote Destino:</strong> {{ movimentacaoSelecionada.loteDestinoId || "-" }}</p>
                <p><strong>Linha Origem:</strong> {{ movimentacaoSelecionada.linhaOrigem || "-" }}</p>
                <p><strong>Linha Destino:</strong> {{ movimentacaoSelecionada.linhaDestino || "-" }}</p>
                <p><strong>Ciclo:</strong> {{ movimentacaoSelecionada.cicloId || "-" }}</p>
              </div>

              <div class="col-12">
                <p><strong>Observação:</strong></p>
                <div class="observacao-box">
                  {{ movimentacaoSelecionada.observacao || "Sem observação." }}
                </div>
              </div>

              <div class="col-12">
                <p><strong>ID do Documento:</strong> {{ movimentacaoSelecionada.docId }}</p>
                <p><strong>Criado em:</strong> {{ formatarDataHora(movimentacaoSelecionada.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="fecharDetalhes">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="movimentacaoSelecionada" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "@/firebase/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

export default {
  name: "HistoricoMovimentacao",
  setup() {
    const movimentacoes = ref([]);
    const carregando = ref(false);
    const mensagem = ref("");
    const movimentacaoSelecionada = ref(null);

    const filtros = ref({
      tipo: "",
      lote: "",
      linha: "",
      dataInicio: "",
      dataFim: "",
    });

    const carregarMovimentacoes = async () => {
      carregando.value = true;
      mensagem.value = "";

      try {
        const q = query(
          collection(db, "MovimentacoesLotes"),
          orderBy("dataMovimentacao", "desc")
        );

        const snapshot = await getDocs(q);

        movimentacoes.value = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);
        mensagem.value = "❌ Erro ao carregar movimentações.";
      } finally {
        carregando.value = false;
      }
    };

    const normalizarTexto = (valor) =>
      String(valor || "")
        .trim()
        .toUpperCase();

    const movimentacoesFiltradas = computed(() => {
      return movimentacoes.value.filter((mov) => {
        const tipoOk =
          !filtros.value.tipo ||
          normalizarTexto(mov.tipo) === normalizarTexto(filtros.value.tipo);

        const loteBusca = normalizarTexto(filtros.value.lote);
        const loteOrigem = normalizarTexto(mov.loteOrigemId);
        const loteDestino = normalizarTexto(mov.loteDestinoId);

        const loteOk =
          !loteBusca ||
          loteOrigem.includes(loteBusca) ||
          loteDestino.includes(loteBusca);

        const linhaBusca = normalizarTexto(filtros.value.linha);
        const linhaOrigem = normalizarTexto(mov.linhaOrigem);
        const linhaDestino = normalizarTexto(mov.linhaDestino);

        const linhaOk =
          !linhaBusca ||
          linhaOrigem.includes(linhaBusca) ||
          linhaDestino.includes(linhaBusca);

        let dataOk = true;
        const dataMov = mov.dataMovimentacao?.toDate
          ? mov.dataMovimentacao.toDate()
          : mov.dataMovimentacao
          ? new Date(mov.dataMovimentacao)
          : null;

        if (dataMov && filtros.value.dataInicio) {
          const inicio = new Date(`${filtros.value.dataInicio}T00:00:00`);
          dataOk = dataOk && dataMov >= inicio;
        }

        if (dataMov && filtros.value.dataFim) {
          const fim = new Date(`${filtros.value.dataFim}T23:59:59`);
          dataOk = dataOk && dataMov <= fim;
        }

        return tipoOk && loteOk && linhaOk && dataOk;
      });
    });

    const quantidadeTotalMovimentada = computed(() =>
      movimentacoesFiltradas.value.reduce(
        (total, mov) => total + Number(mov.quantidade || 0),
        0
      )
    );

    const custoTotalMovimentado = computed(() =>
      movimentacoesFiltradas.value.reduce(
        (total, mov) => total + Number(mov.custoTotal || 0),
        0
      )
    );

    const ultimaDataMovimentacao = computed(() => {
      if (!movimentacoesFiltradas.value.length) return "-";
      return formatarData(movimentacoesFiltradas.value[0].dataMovimentacao);
    });

    const formatarData = (valor) => {
      if (!valor) return "-";
      const data = valor?.toDate?.() || new Date(valor);
      return data.toLocaleDateString("pt-BR");
    };

    const formatarDataHora = (valor) => {
      if (!valor) return "-";
      const data = valor?.toDate?.() || new Date(valor);
      return data.toLocaleString("pt-BR");
    };

    const formatarValor = (valor) => {
      const num = Number(valor || 0);
      return num.toFixed(2);
    };

    const limparFiltros = () => {
      filtros.value = {
        tipo: "",
        lote: "",
        linha: "",
        dataInicio: "",
        dataFim: "",
      };
    };

    const abrirDetalhes = (mov) => {
      movimentacaoSelecionada.value = mov;
    };

    const fecharDetalhes = () => {
      movimentacaoSelecionada.value = null;
    };

    const getBadgeClass = (tipo) => {
      const t = normalizarTexto(tipo);

      if (t === "ENTRADA") return "bg-success";
      if (t === "TRANSFERENCIA") return "bg-primary";
      if (t === "VENDA") return "bg-warning text-dark";
      if (t === "AJUSTE") return "bg-secondary";
      if (t === "MORTE") return "bg-danger";

      return "bg-dark";
    };

    onMounted(() => {
      carregarMovimentacoes();
    });

    return {
      movimentacoes,
      movimentacoesFiltradas,
      carregando,
      mensagem,
      filtros,
      quantidadeTotalMovimentada,
      custoTotalMovimentado,
      ultimaDataMovimentacao,
      movimentacaoSelecionada,
      carregarMovimentacoes,
      formatarData,
      formatarDataHora,
      formatarValor,
      limparFiltros,
      abrirDetalhes,
      fecharDetalhes,
      getBadgeClass,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

h2,
h5 {
  color: #004080;
}

.card {
  border-radius: 12px;
  border: 1px solid #dfe3e6;
}

.form-label {
  font-weight: 600;
  color: #333;
}

input,
select {
  border-radius: 8px;
}

.table {
  font-size: 0.92rem;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}

.cursor-pointer:hover {
  background-color: #f0f8ff;
  cursor: pointer;
}

.alert-success,
.alert-danger {
  border-radius: 8px;
  font-weight: 500;
}

.modal-backdrop {
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

.observacao-box {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  min-height: 60px;
}
</style>