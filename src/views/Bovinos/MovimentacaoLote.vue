<template>
  <div class="container mt-5">
    <h2 class="fw-bold text-center mb-4 text-primary">
      🔄 Movimentação de Lote
    </h2>

    <div class="card p-4 shadow-sm mb-4">
      <h5 class="mb-3 text-primary border-bottom pb-2">Transferir animais entre linhas/lotes</h5>

      <form @submit.prevent="registrarMovimentacao">
        <div class="row g-3">
          <!-- Lote de origem -->
          <div class="col-md-6">
            <label class="form-label">Lote de Origem</label>
            <select v-model="form.loteOrigemDocId" class="form-select" required @change="aoSelecionarLote">
              <option disabled value="">Selecione um lote</option>
              <option
                v-for="lote in lotesAtivos"
                :key="lote.docId"
                :value="lote.docId"
              >
                {{ lote.id }} | Linha: {{ lote.linha || '-' }} | Qtde: {{ getQuantidadeAtual(lote) }}
              </option>
            </select>
          </div>

          <!-- Linha destino -->
          <div class="col-md-3">
            <label class="form-label">Linha Destino</label>
            <input
              v-model="form.linhaDestino"
              class="form-control"
              placeholder="Ex: B2"
              required
            />
          </div>

          <!-- Quantidade -->
          <div class="col-md-3">
            <label class="form-label">Quantidade Transferida</label>
            <input
              v-model.number="form.quantidadeTransferida"
              type="number"
              min="1"
              :max="quantidadeMaxima"
              class="form-control"
              required
            />
          </div>

          <!-- Data -->
          <div class="col-md-4">
            <label class="form-label">Data da Movimentação</label>
            <input
              v-model="form.dataMovimentacao"
              type="date"
              class="form-control"
              required
            />
          </div>

          <!-- Observação -->
          <div class="col-md-8">
            <label class="form-label">Observação</label>
            <input
              v-model="form.observacao"
              class="form-control"
              placeholder="Ex: Remanejo interno por separação de lote"
            />
          </div>
        </div>

        <div v-if="loteSelecionado" class="alert alert-info mt-4">
          <p class="mb-1"><strong>Lote selecionado:</strong> {{ loteSelecionado.id }}</p>
          <p class="mb-1"><strong>Linha atual:</strong> {{ loteSelecionado.linha || '-' }}</p>
          <p class="mb-1"><strong>Quantidade atual:</strong> {{ quantidadeAtualSelecionada }}</p>
          <p class="mb-1"><strong>Custo atual:</strong> R$ {{ formatarValor(custoAtualSelecionado) }}</p>
          <p class="mb-1"><strong>Custo unitário atual:</strong> R$ {{ formatarValor(custoUnitarioAtual) }}</p>
          <p class="mb-0">
            <strong>Custo estimado transferido:</strong>
            R$ {{ formatarValor(custoTransferidoEstimado) }}
          </p>
        </div>

        <div class="d-grid mt-4">
          <button class="btn btn-primary" :disabled="salvando">
            {{ salvando ? 'Salvando movimentação...' : '✅ Registrar Movimentação' }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="mensagem"
      class="alert text-center"
      :class="mensagem.startsWith('✅') ? 'alert-success' : 'alert-danger'"
    >
      {{ mensagem }}
    </div>

    <!-- Histórico recente -->
    <div class="card p-3 shadow-sm mt-4">
      <h5 class="fw-bold mb-3">📜 Últimas Movimentações</h5>

      <div class="table-responsive" v-if="movimentacoes.length">
        <table class="table table-bordered table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Lote Origem</th>
              <th>Lote Destino</th>
              <th>Linha Origem</th>
              <th>Linha Destino</th>
              <th>Qtde</th>
              <th>Custo Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mov in movimentacoes" :key="mov.docId">
              <td>{{ formatarData(mov.dataMovimentacao) }}</td>
              <td>{{ mov.tipo }}</td>
              <td>{{ mov.loteOrigemId || '-' }}</td>
              <td>{{ mov.loteDestinoId || '-' }}</td>
              <td>{{ mov.linhaOrigem || '-' }}</td>
              <td>{{ mov.linhaDestino || '-' }}</td>
              <td>{{ mov.quantidade }}</td>
              <td>R$ {{ formatarValor(mov.custoTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-muted">
        Nenhuma movimentação registrada ainda.
      </div>
    </div>
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
  limit,
  doc,
  Timestamp,
  runTransaction,
} from "firebase/firestore";

export default {
  name: "MovimentacaoLote",
  setup() {
    const lotes = ref([]);
    const movimentacoes = ref([]);
    const mensagem = ref("");
    const salvando = ref(false);

    const formPadrao = () => ({
      loteOrigemDocId: "",
      linhaDestino: "",
      quantidadeTransferida: null,
      dataMovimentacao: new Date().toISOString().split("T")[0],
      observacao: "",
    });

    const form = ref(formPadrao());

    const carregarLotes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "LotesConfinamento"));
        lotes.value = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
      } catch (error) {
        console.error("Erro ao carregar lotes:", error);
        mensagem.value = "❌ Erro ao carregar lotes.";
      }
    };

    const carregarMovimentacoes = async () => {
      try {
        const q = query(
          collection(db, "MovimentacoesLotes"),
          orderBy("dataMovimentacao", "desc"),
          limit(15)
        );

        const snapshot = await getDocs(q);
        movimentacoes.value = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);
      }
    };

    const getQuantidadeAtual = (lote) => {
      return lote.quantidadeAtual ?? lote.quantidade ?? 0;
    };

    const getCustoAtual = (lote) => {
      return lote.custoAtual ?? lote.custoCompraGado ?? 0;
    };

    const lotesAtivos = computed(() =>
      lotes.value.filter((lote) => {
        const quantidade = getQuantidadeAtual(lote);
        const status = lote.status || "ATIVO";
        return quantidade > 0 && status !== "ENCERRADO";
      })
    );

    const loteSelecionado = computed(() =>
      lotesAtivos.value.find((l) => l.docId === form.value.loteOrigemDocId) || null
    );

    const quantidadeAtualSelecionada = computed(() =>
      loteSelecionado.value ? getQuantidadeAtual(loteSelecionado.value) : 0
    );

    const custoAtualSelecionado = computed(() =>
      loteSelecionado.value ? getCustoAtual(loteSelecionado.value) : 0
    );

    const custoUnitarioAtual = computed(() => {
      if (!loteSelecionado.value) return 0;
      const quantidade = getQuantidadeAtual(loteSelecionado.value);
      const custo = getCustoAtual(loteSelecionado.value);
      return quantidade > 0 ? custo / quantidade : 0;
    });

    const custoTransferidoEstimado = computed(() => {
      const qtde = Number(form.value.quantidadeTransferida || 0);
      return qtde > 0 ? qtde * custoUnitarioAtual.value : 0;
    });

    const quantidadeMaxima = computed(() => quantidadeAtualSelecionada.value || null);

    const aoSelecionarLote = () => {
      form.value.quantidadeTransferida = null;
    };

    const gerarIdNovoLote = (loteOrigem, linhaDestino) => {
      const base = loteOrigem.id || "LOTE";
      const linha = (linhaDestino || "SEM-LINHA").trim().toUpperCase().replace(/\s+/g, "-");
      const sufixo = Date.now();
      return `${base}-${linha}-${sufixo}`;
    };

    const formatarData = (valor) => {
      if (!valor) return "-";
      const data = valor?.toDate?.() || new Date(valor);
      return data.toLocaleDateString("pt-BR");
    };

    const formatarValor = (valor) => {
      const num = Number(valor || 0);
      return num.toFixed(2);
    };

    const registrarMovimentacao = async () => {
      if (!form.value.loteOrigemDocId || !form.value.linhaDestino || !form.value.quantidadeTransferida) {
        mensagem.value = "❌ Preencha todos os campos obrigatórios.";
        return;
      }

      const loteOrigem = lotesAtivos.value.find((l) => l.docId === form.value.loteOrigemDocId);

      if (!loteOrigem) {
        mensagem.value = "❌ Lote de origem não encontrado.";
        return;
      }

      const quantidadeOrigem = getQuantidadeAtual(loteOrigem);
      const quantidadeTransferida = Number(form.value.quantidadeTransferida);

      if (quantidadeTransferida <= 0) {
        mensagem.value = "❌ A quantidade transferida deve ser maior que zero.";
        return;
      }

      if (quantidadeTransferida > quantidadeOrigem) {
        mensagem.value = "❌ A quantidade transferida não pode ser maior que a disponível.";
        return;
      }

      if ((form.value.linhaDestino || "").trim().toUpperCase() === (loteOrigem.linha || "").trim().toUpperCase()) {
        mensagem.value = "❌ A linha destino deve ser diferente da linha atual.";
        return;
      }

      salvando.value = true;
      mensagem.value = "";

      try {
        const loteOrigemRef = doc(db, "LotesConfinamento", loteOrigem.docId);
        const lotesCollectionRef = collection(db, "LotesConfinamento");
        const movimentacoesCollectionRef = collection(db, "MovimentacoesLotes");

        await runTransaction(db, async (transaction) => {
          const origemSnap = await transaction.get(loteOrigemRef);

          if (!origemSnap.exists()) {
            throw new Error("Lote de origem não existe mais.");
          }

          const origemData = origemSnap.data();

          const quantidadeAtualBanco = origemData.quantidadeAtual ?? origemData.quantidade ?? 0;
          const custoAtualBanco = origemData.custoAtual ?? origemData.custoCompraGado ?? 0;

          if (quantidadeTransferida > quantidadeAtualBanco) {
            throw new Error("Quantidade insuficiente no lote de origem.");
          }

          const custoUnitario = quantidadeAtualBanco > 0 ? custoAtualBanco / quantidadeAtualBanco : 0;
          const custoTransferido = custoUnitario * quantidadeTransferida;

          const novaQuantidadeOrigem = quantidadeAtualBanco - quantidadeTransferida;
          const novoCustoOrigem = custoAtualBanco - custoTransferido;

          const novoLoteRef = doc(lotesCollectionRef);
          const novoLoteId = gerarIdNovoLote(origemData, form.value.linhaDestino);

          const dataMovimentacao = form.value.dataMovimentacao
            ? Timestamp.fromDate(new Date(`${form.value.dataMovimentacao}T00:00:00`))
            : Timestamp.now();

          const novoLote = {
            id: novoLoteId,
            linha: form.value.linhaDestino.trim().toUpperCase(),
            quantidadeInicial: quantidadeTransferida,
            quantidadeAtual: quantidadeTransferida,
            custoCompraInicial: custoTransferido,
            custoAtual: custoTransferido,
            custoUnitarioCompra: custoUnitario,
            dataEntrada: origemData.dataEntrada || dataMovimentacao,
            pesoInicial: origemData.pesoInicial ?? null,
            raca: origemData.raca ?? "",
            categoria: origemData.categoria ?? "",
            gpd: origemData.gpd ?? null,
            status: "ATIVO",
            lotePaiId: origemSnap.id,
            cicloEntradaId: origemData.cicloEntradaId ?? null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          transaction.set(novoLoteRef, novoLote);

          transaction.update(loteOrigemRef, {
            quantidadeAtual: novaQuantidadeOrigem,
            custoAtual: Number(novoCustoOrigem.toFixed(2)),
            status: novaQuantidadeOrigem <= 0 ? "ENCERRADO" : (origemData.status || "ATIVO"),
            updatedAt: Timestamp.now(),
          });

          const movRef = doc(movimentacoesCollectionRef);

          transaction.set(movRef, {
            tipo: "TRANSFERENCIA",
            loteOrigemDocId: origemSnap.id,
            loteDestinoDocId: novoLoteRef.id,
            loteOrigemId: origemData.id || origemSnap.id,
            loteDestinoId: novoLoteId,
            linhaOrigem: origemData.linha || null,
            linhaDestino: form.value.linhaDestino.trim().toUpperCase(),
            quantidade: quantidadeTransferida,
            custoUnitario: Number(custoUnitario.toFixed(2)),
            custoTotal: Number(custoTransferido.toFixed(2)),
            dataMovimentacao,
            observacao: form.value.observacao || "Transferência interna de lote",
            cicloId: origemData.cicloEntradaId ?? null,
            createdAt: Timestamp.now(),
          });
        });

        mensagem.value = "✅ Movimentação registrada com sucesso!";
        form.value = formPadrao();

        await carregarLotes();
        await carregarMovimentacoes();
      } catch (error) {
        console.error("Erro ao registrar movimentação:", error);
        mensagem.value = `❌ ${error.message || "Erro ao registrar movimentação."}`;
      } finally {
        salvando.value = false;
        setTimeout(() => {
          mensagem.value = "";
        }, 5000);
      }
    };

    onMounted(async () => {
      await carregarLotes();
      await carregarMovimentacoes();
    });

    return {
      form,
      mensagem,
      salvando,
      lotesAtivos,
      movimentacoes,
      loteSelecionado,
      quantidadeAtualSelecionada,
      custoAtualSelecionado,
      custoUnitarioAtual,
      custoTransferidoEstimado,
      quantidadeMaxima,
      getQuantidadeAtual,
      registrarMovimentacao,
      formatarData,
      formatarValor,
      aoSelecionarLote,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1100px;
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
select,
textarea {
  border-radius: 8px;
}

.btn-primary {
  font-weight: bold;
  border-radius: 8px;
  padding: 10px;
  font-size: 1rem;
}

.alert-info {
  border-radius: 10px;
  background-color: #eaf4ff;
  border: 1px solid #b3daff;
  color: #004080;
}

.alert-success,
.alert-danger {
  border-radius: 8px;
  font-weight: 500;
}

.table {
  font-size: 0.92rem;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}
</style>