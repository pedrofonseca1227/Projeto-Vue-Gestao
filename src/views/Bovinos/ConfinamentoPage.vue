<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-bold text-center text-primary">
      Cadastro de Lotes Confinados
    </h2>

    <h4 class="text-primary border-bottom pb-2 mb-3">📋 Novo Lote</h4>

    <form @submit.prevent="cadastrarLote" class="card p-4 shadow-sm mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">ID do Lote</label>
          <input v-model="form.id" class="form-control" required />
        </div>

        <div class="col-md-4">
          <label class="form-label">Linha</label>
          <input v-model="form.linha" class="form-control" required />
        </div>

        <div class="col-md-4">
          <label class="form-label">Quantidade de Animais</label>
          <input
            v-model.number="form.quantidadeInicial"
            type="number"
            class="form-control"
            min="1"
            required
          />
        </div>

        <div class="input-group">
          <span class="input-group-text">R$ Custo de Compra Lote</span>
          <MoneyInput
            v-model="form.custoCompraInicial"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Data de Entrada</label>
          <input
            v-model="form.dataEntrada"
            type="date"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Peso Inicial (kg)</label>
          <input
            v-model.number="form.pesoInicial"
            type="number"
            step="0.1"
            class="form-control"
            min="0"
            required
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Raça</label>
          <input v-model="form.raca" class="form-control" required />
        </div>

        <div class="col-md-4">
          <label class="form-label">Categoria</label>
          <select v-model="form.categoria" class="form-select" required>
            <option disabled value="">Selecione</option>
            <option value="MACHO">MACHO</option>
            <option value="FEMEA">FEMEA</option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">GPD (kg/dia)</label>
          <input
            v-model.number="form.gpd"
            type="number"
            step="0.01"
            class="form-control"
            min="0"
            required
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Ciclo de Entrada (opcional)</label>
          <select v-model="form.cicloEntradaId" class="form-select">
            <option value="">Sem vínculo</option>
            <option v-for="ciclo in ciclos" :key="ciclo.id" :value="ciclo.id">
              {{ formatarData(ciclo.inicio) }} a {{ formatarData(ciclo.fim) }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Custo Unitário</label>
          <input
            :value="formatarValor(custoUnitarioPreview)"
            class="form-control bg-light"
            disabled
          />
        </div>
      </div>

      <div class="d-grid mt-4">
        <button class="btn btn-success" :disabled="salvando">
          {{ salvando ? "Salvando..." : "Cadastrar Lote" }}
        </button>
      </div>
    </form>

    <div
      v-if="mensagem"
      class="alert text-center mt-3"
      :class="mensagem.startsWith('✅') ? 'alert-success' : 'alert-danger'"
    >
      {{ mensagem }}
    </div>

    <div class="row mb-4" v-if="lotes.length">
      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">🐂 Total de Lotes Ativos</h6>
          <h3 class="fw-bold text-primary">{{ lotes.length }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">👥 Total de Animais</h6>
          <h3 class="fw-bold text-success">{{ totalAnimais }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">⚖️ Peso Médio Final</h6>
          <h3 class="fw-bold text-warning">{{ pesoMedioFinal.toFixed(1) }} kg</h3>
        </div>
      </div>
    </div>

    <h4 class="text-primary border-bottom pb-2 mb-3 mt-5">📦 Lotes Ativos</h4>

    <div v-if="lotes.length" class="card p-3">
      <div class="table-responsive">
        <table class="table table-bordered table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Linha</th>
              <th>Entrada</th>
              <th>Dias</th>
              <th>Qtde Atual</th>
              <th>Custo Atual</th>
              <th>Custo Unit.</th>
              <th>P. Inicial</th>
              <th>P. Final Est.</th>
              <th>GPD</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="lote in lotes" :key="lote.docId">
              <td>{{ lote.id }}</td>

              <td>
                <input
                  v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId"
                  v-model="formEdicao.linha"
                  class="form-control form-control-sm"
                />
                <span v-else>{{ lote.linha }}</span>
              </td>

              <td>{{ formatarData(lote.dataEntrada) }}</td>
              <td>{{ calcularDiasConfinamento(lote.dataEntrada) }}</td>

              <td>{{ lote.quantidadeAtual }}</td>

              <td>R$ {{ formatarValor(lote.custoAtual) }}</td>

              <td>R$ {{ formatarValor(getCustoUnitarioLote(lote)) }}</td>

              <td>
                <input
                  v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId"
                  v-model.number="formEdicao.pesoInicial"
                  type="number"
                  step="0.1"
                  class="form-control form-control-sm"
                />
                <span v-else>{{ lote.pesoInicial }} kg</span>
              </td>

              <td>{{ calcularPesoFinal(lote) }} kg</td>

              <td>
                <input
                  v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId"
                  v-model.number="formEdicao.gpd"
                  type="number"
                  step="0.01"
                  class="form-control form-control-sm"
                />
                <span v-else>{{ lote.gpd }}</span>
              </td>

              <td>
                <span
                  class="badge"
                  :class="ehProntoVenda(lote) ? 'bg-success' : 'bg-warning'"
                >
                  {{ ehProntoVenda(lote) ? 'Pronto p/ Venda' : 'Em Confinamento' }}
                </span>
              </td>

              <td>
                <div
                  v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId"
                  class="d-flex gap-1 justify-content-center"
                >
                  <button @click="salvarEdicao(lote.docId)" class="btn btn-primary btn-sm">
                    💾 Salvar
                  </button>
                  <button @click="fecharEdicao" class="btn btn-secondary btn-sm">
                    ❌ Cancelar
                  </button>
                </div>

                <div v-else class="d-flex gap-1 justify-content-center">
                  <button @click="abrirEdicao(lote)" class="btn btn-warning btn-sm">
                    ✏️ Editar
                  </button>
                  <button @click="encerrarLote(lote.docId)" class="btn btn-danger btn-sm">
                    ⛔ Encerrar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="text-muted text-center mt-4">
      Nenhum lote ativo encontrado.
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { db } from "@/firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  runTransaction,
} from "firebase/firestore";

export default {
  name: "CadastroLotes",
  setup() {
    const lotes = ref([]);
    const ciclos = ref([]);
    const mensagem = ref("");
    const loteEmEdicao = ref(null);
    const salvando = ref(false);

    const formPadrao = () => ({
      id: "",
      linha: "",
      quantidadeInicial: null,
      custoCompraInicial: null,
      dataEntrada: "",
      pesoInicial: null,
      raca: "",
      categoria: "",
      gpd: null,
      cicloEntradaId: "",
    });

    const form = ref(formPadrao());
    const formEdicao = ref({});

    const custoUnitarioPreview = computed(() => {
      const quantidade = Number(form.value.quantidadeInicial || 0);
      const custo = Number(form.value.custoCompraInicial || 0);
      if (!quantidade || quantidade <= 0) return 0;
      return custo / quantidade;
    });

    const extrairPartesLinha = (linha) => {
      const valor = String(linha || "").trim().toUpperCase();

      const letra = valor.match(/[A-Z]+/)?.[0] || "";
      const numero = parseInt(valor.match(/\d+/)?.[0] || "0", 10);

      return { letra, numero };
    };

    const compararLinhas = (a, b) => {
      const linhaA = extrairPartesLinha(a?.linha);
      const linhaB = extrairPartesLinha(b?.linha);

      if (linhaA.letra !== linhaB.letra) {
        return linhaA.letra.localeCompare(linhaB.letra, "pt-BR");
      }

      return linhaA.numero - linhaB.numero;
    };

    const calcularDiasConfinamento = (dataEntrada) => {
      const entrada = dataEntrada?.toDate ? dataEntrada.toDate() : new Date(dataEntrada);
      const hoje = new Date();
      entrada.setHours(0, 0, 0, 0);
      hoje.setHours(0, 0, 0, 0);
      return Math.floor((hoje - entrada) / (1000 * 60 * 60 * 24));
    };

    const calcularPesoFinal = (lote) => {
      const dias = calcularDiasConfinamento(lote.dataEntrada);
      return parseFloat(
        (Number(lote.pesoInicial || 0) + dias * Number(lote.gpd || 0)).toFixed(1)
      );
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

    const getCustoUnitarioLote = (lote) => {
      const quantidade = Number(lote.quantidadeAtual || 0);
      const custo = Number(lote.custoAtual || 0);
      if (!quantidade || quantidade <= 0) return 0;
      return custo / quantidade;
    };

    const totalAnimais = computed(() =>
      lotes.value.reduce((sum, lote) => sum + Number(lote.quantidadeAtual || 0), 0)
    );

    const pesoMedioFinal = computed(() => {
      if (!lotes.value.length || !totalAnimais.value) return 0;

      const pesoTotal = lotes.value.reduce((sum, lote) => {
        return sum + calcularPesoFinal(lote) * Number(lote.quantidadeAtual || 0);
      }, 0);

      return pesoTotal / totalAnimais.value;
    });

    const ehProntoVenda = (lote) => {
      const dias = calcularDiasConfinamento(lote.dataEntrada);
      const categoria = lote.categoria?.toUpperCase().trim();

      if (categoria === "FEMEA") return dias >= 60;
      if (categoria === "MACHO") return dias >= 90;
      return dias >= 90;
    };

    const carregarLotes = async () => {
      try {
        const q = query(collection(db, "LotesConfinamento"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        lotes.value = snapshot.docs
          .map((docSnap) => ({
            docId: docSnap.id,
            ...docSnap.data(),
          }))
          .filter(
            (lote) =>
              (lote.status || "ATIVO") === "ATIVO" &&
              Number(lote.quantidadeAtual || 0) > 0
          )
          .sort(compararLinhas);
      } catch (error) {
        console.error("Erro ao carregar lotes:", error);
        mensagem.value = "❌ Erro ao carregar lotes.";
      }
    };

    const carregarCiclos = async () => {
      try {
        const q = query(collection(db, "CiclosGastos"), orderBy("inicio", "desc"));
        const snapshot = await getDocs(q);
        ciclos.value = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      } catch (error) {
        console.error("Erro ao carregar ciclos:", error);
      }
    };

    const cadastrarLote = async () => {
      const quantidadeInicial = Number(form.value.quantidadeInicial || 0);
      const custoCompraInicial = Number(form.value.custoCompraInicial || 0);

      if (quantidadeInicial <= 0) {
        mensagem.value = "❌ A quantidade inicial deve ser maior que zero.";
        return;
      }

      if (custoCompraInicial < 0) {
        mensagem.value = "❌ O custo de compra não pode ser negativo.";
        return;
      }

      salvando.value = true;
      mensagem.value = "";

      try {
        const lotesRef = collection(db, "LotesConfinamento");
        const movimentacoesRef = collection(db, "MovimentacoesLotes");

        await runTransaction(db, async (transaction) => {
          const novoLoteRef = doc(lotesRef);
          const custoUnitarioCompra = custoCompraInicial / quantidadeInicial;
          const dataEntrada = Timestamp.fromDate(
            new Date(`${form.value.dataEntrada}T00:00:00`)
          );

          const novoLote = {
            id: form.value.id.trim(),
            linha: form.value.linha.trim().toUpperCase(),
            quantidadeInicial,
            quantidadeAtual: quantidadeInicial,
            custoCompraInicial,
            custoAtual: Number(custoCompraInicial.toFixed(2)),
            custoUnitarioCompra: Number(custoUnitarioCompra.toFixed(2)),
            dataEntrada,
            pesoInicial: Number(form.value.pesoInicial),
            raca: form.value.raca.trim().toUpperCase(),
            categoria: form.value.categoria.trim().toUpperCase(),
            gpd: Number(form.value.gpd),
            status: "ATIVO",
            lotePaiId: null,
            cicloEntradaId: form.value.cicloEntradaId || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          transaction.set(novoLoteRef, novoLote);

          const movRef = doc(movimentacoesRef);
          transaction.set(movRef, {
            tipo: "ENTRADA",
            loteOrigemDocId: null,
            loteDestinoDocId: novoLoteRef.id,
            loteOrigemId: null,
            loteDestinoId: novoLote.id,
            linhaOrigem: null,
            linhaDestino: novoLote.linha,
            quantidade: quantidadeInicial,
            custoUnitario: Number(custoUnitarioCompra.toFixed(2)),
            custoTotal: Number(custoCompraInicial.toFixed(2)),
            dataMovimentacao: dataEntrada,
            observacao: "Cadastro inicial do lote",
            cicloId: form.value.cicloEntradaId || null,
            createdAt: Timestamp.now(),
          });
        });

        mensagem.value = "✅ Lote cadastrado com sucesso!";
        form.value = formPadrao();

        await carregarLotes();
      } catch (error) {
        console.error("Erro ao cadastrar lote:", error);
        mensagem.value = "❌ Erro ao cadastrar lote.";
      } finally {
        salvando.value = false;
        setTimeout(() => {
          mensagem.value = "";
        }, 4000);
      }
    };

    const abrirEdicao = (lote) => {
      loteEmEdicao.value = { ...lote };
      formEdicao.value = {
        linha: lote.linha,
        pesoInicial: lote.pesoInicial,
        gpd: lote.gpd,
      };
    };

    const fecharEdicao = () => {
      loteEmEdicao.value = null;
      formEdicao.value = {};
    };

    const salvarEdicao = async (loteDocId) => {
      try {
        const loteRef = doc(db, "LotesConfinamento", loteDocId);

        await updateDoc(loteRef, {
          linha: formEdicao.value.linha?.trim().toUpperCase() || "",
          pesoInicial: Number(formEdicao.value.pesoInicial || 0),
          gpd: Number(formEdicao.value.gpd || 0),
          updatedAt: Timestamp.now(),
        });

        mensagem.value = "✅ Lote atualizado com sucesso!";
        await carregarLotes();
        fecharEdicao();
      } catch (error) {
        console.error("Erro ao salvar edição:", error);
        mensagem.value = "❌ Erro ao salvar edição do lote.";
      }

      setTimeout(() => {
        mensagem.value = "";
      }, 4000);
    };

    const encerrarLote = async (loteDocId) => {
      const lote = lotes.value.find((l) => l.docId === loteDocId);
      if (!lote) return;

      const confirmar = confirm(
        `Tem certeza que deseja encerrar o lote ${lote.id}? Essa ação não apaga o histórico.`
      );

      if (!confirmar) return;

      try {
        const loteRef = doc(db, "LotesConfinamento", loteDocId);

        await updateDoc(loteRef, {
          status: "ENCERRADO",
          updatedAt: Timestamp.now(),
        });

        mensagem.value = `✅ Lote ${lote.id} encerrado com sucesso!`;
        await carregarLotes();
      } catch (error) {
        console.error("Erro ao encerrar lote:", error);
        mensagem.value = "❌ Erro ao encerrar lote.";
      }

      setTimeout(() => {
        mensagem.value = "";
      }, 4000);
    };

    onMounted(async () => {
      await carregarLotes();
      await carregarCiclos();
    });

    return {
      form,
      ciclos,
      lotes,
      mensagem,
      salvando,
      loteEmEdicao,
      formEdicao,
      custoUnitarioPreview,
      totalAnimais,
      pesoMedioFinal,
      cadastrarLote,
      formatarData,
      formatarValor,
      calcularDiasConfinamento,
      calcularPesoFinal,
      ehProntoVenda,
      abrirEdicao,
      fecharEdicao,
      salvarEdicao,
      encerrarLote,
      getCustoUnitarioLote,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

h2,
h4 {
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
textarea,
select {
  border-radius: 8px;
}

.btn-success,
.btn-primary,
.btn-warning,
.btn-danger,
.btn-secondary {
  font-weight: 600;
  border-radius: 8px;
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

.badge {
  font-size: 0.82rem;
}
</style>