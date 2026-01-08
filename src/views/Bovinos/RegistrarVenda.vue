<template>
  <div class="container mt-5">
    <h2 class="text-center fw-bold mb-4">📦 Registrar Venda de Lote</h2>

    <!-- FORMULÁRIO DE VENDA -->
    <div class="card p-4 shadow-sm mb-5">
      <div
        v-for="(vendaLote, index) in lotesParaVenda"
        :key="index"
        class="row g-3 mb-3 border p-3 rounded"
      >
        <!-- Lote Selecionado -->
        <div class="col-md-4">
          <label class="form-label">Lote Selecionado</label>
          <select v-model="vendaLote.docId" class="form-select" required>
            <option disabled value="">Escolha um lote</option>
            <option v-for="l in lotesElegiveis" :key="l.docId" :value="l.docId">
              {{ l.id }} - {{ l.quantidade }} cabeças
            </option>
          </select>
        </div>

        <!-- Quantidade -->
        <div class="col-md-3">
          <label class="form-label">Quantidade a Vender</label>
          <input
            v-model.number="vendaLote.quantidadeVendida"
            type="number"
            class="form-control"
            min="1"
            :max="getQuantidadeOriginal(vendaLote.docId)"
            required
          />
        </div>

        <!-- Peso -->
        <div class="col-md-3">
          <label class="form-label">Peso Final Total (kg)</label>
          <input
            v-model.number="vendaLote.pesoFinalTotal"
            type="number"
            step="0.01"
            class="form-control"
            required
          />
        </div>

        <!-- Rendimento -->
        <div class="col-md-2 d-flex align-items-end">
          <select v-model.number="vendaLote.rendimentoCarcaca" class="form-select" required>
            <option disabled value="">Rendimento (%)</option>
            <option v-for="p in [55, 56, 50]" :key="p" :value="p">{{ p }}%</option>
          </select>
        </div>

        <div class="col-md-1 d-flex align-items-end">
          <button @click="removerLote(index)" class="btn btn-danger btn-sm w-100">-</button>
        </div>
      </div>

      <div class="d-grid gap-2 mb-3">
        <button @click="adicionarLote" class="btn btn-outline-primary">
          + Adicionar outro Lote
        </button>
      </div>

      <!-- Seleção de Ciclo -->
      <div class="mb-3">
        <label class="form-label">Selecione o ciclo de gastos</label>
        <select v-model="cicloSelecionadoId" class="form-select" required>
          <option disabled value="">Escolha um ciclo</option>
          <option v-for="ciclo in ciclos" :key="ciclo.id" :value="ciclo.id">
            {{ formatarData(ciclo.inicio) }} a {{ formatarData(ciclo.fim) }} -
            R$ {{ formatarValor(ciclo.total) }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Data da Venda</label>
        <input v-model="dataVendaSelecionada" type="date" class="form-control" required />
      </div>

      <!-- Campo de Preço Arroba -->
      <div class="mb-3">
        <label class="form-label">Preço da Arroba (R$)</label>
        <input
          v-model.number="precoArroba"
          type="number"
          step="0.01"
          class="form-control"
          placeholder="Ex: 290.00"
          required
        />
      </div>

      <!-- Resumo -->
      <div class="alert alert-info">
        <p><strong>Receita Total Estimada:</strong> R$ {{ formatarValor(receitaEstimada) }}</p>
        <p><strong>Custo Total Estimado:</strong> R$ {{ formatarValor(custoEstimado) }}</p>
        <p><strong>Lucro Total Estimado:</strong> R$ {{ formatarValor(lucroEstimado) }}</p>
      </div>

      <button class="btn btn-success w-100" @click="registrarVenda">✅ Registrar Venda</button>
    </div>

    <!-- MENSAGEM DE SUCESSO -->
    <div v-if="mensagem" class="alert alert-success text-center">{{ mensagem }}</div>

    <!-- HISTÓRICO DE VENDAS -->
    <div class="mt-5">
      <h5 class="fw-bold mb-3 text-center">📄 Histórico de Vendas</h5>
      <table class="table table-bordered" v-if="historico.length">
        <thead class="table-dark">
          <tr>
            <th>Data</th>
            <th>Qtde Total</th>
            <th>Receita</th>
            <th>Custo</th>
            <th>Lucro</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="v in historico"
            :key="v.id"
            @click="abrirDetalhes(v)"
            class="cursor-pointer"
          >
            <td>{{ formatarData(v.dataVenda) }}</td>
            <td>{{ v.quantidade }}</td>
            <td>R$ {{ formatarValor(v.receita) }}</td>
            <td>R$ {{ formatarValor(v.custo) }}</td>
            <td>R$ {{ formatarValor(v.lucro) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DETALHES -->
    <div
      class="modal fade"
      id="detalheVendaModal"
      tabindex="-1"
      aria-labelledby="detalheVendaLabel"
      aria-hidden="true"
      :class="{ 'd-block show': vendaSelecionada }"
      v-if="vendaSelecionada"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="detalheVendaLabel">
              Detalhes da Venda - {{ formatarData(vendaSelecionada.dataVenda) }}
            </h5>
            <button type="button" class="btn-close" @click="fecharDetalhes" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <h6>Resumo Financeiro da Transação</h6>
            <p><strong>ID Ciclo de Gasto:</strong> {{ vendaSelecionada.cicloId }}</p>
            <hr />
            <p><strong>Receita Total:</strong> R$ {{ formatarValor(vendaSelecionada?.receita) }}</p>
            <p><strong>Custo Total:</strong> R$ {{ formatarValor(vendaSelecionada?.custo) }}</p>
            <p><strong>Lucro Total:</strong> R$ {{ formatarValor(vendaSelecionada?.lucro) }}</p>

            <h6 class="mt-4">Lotes Vendidos Individualmente</h6>
            <table class="table table-sm table-striped">
              <thead class="table-info">
                <tr>
                  <th>ID Lote</th>
                  <th>Categoria</th>
                  <th>Raça</th>
                  <th>Linha</th>
                  <th>Qtde Vendida</th>
                  <th>Peso Total (kg)</th>
                  <th>Peso Médio (kg)</th>
                  <th>Arrobas Totais</th>
                  <th>Receita (R$)</th>
                  <th>Custo (R$)</th>
                  <th>Lucro (R$)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detalhe, i) in vendaSelecionada.detalhes" :key="i">
                  <td>{{ detalhe.id || 'N/A' }}</td>
                  <td>{{ detalhe.categoria || '-' }}</td>
                  <td>{{ detalhe.raca || '-' }}</td>
                  <td>{{ detalhe.linha || '-' }}</td>
                  <td>{{ detalhe.quantidadeVendida }}</td>
                  <td>{{ detalhe.pesoFinalTotalKg != null ? detalhe.pesoFinalTotalKg.toFixed(2) : '-' }}</td>
                  <td>{{ detalhe.pesoMedioFinalKg != null ? detalhe.pesoMedioFinalKg.toFixed(2) : '-' }}</td>
                  <td>{{ detalhe.arrobasTotais != null ? detalhe.arrobasTotais.toFixed(2) : '-' }}</td>
                  <td>{{ formatarValor(detalhe.receita) }}</td>
                  <td>{{ formatarValor(detalhe.custo) }}</td>
                  <td>{{ formatarValor(detalhe.lucro) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="fecharDetalhes">Fechar</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="vendaSelecionada" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "@/firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";

export default {
  setup() {
    const lotesParaVenda = ref([
      { docId: "", quantidadeVendida: null, pesoFinalTotal: null, rendimentoCarcaca: null },
    ]);

    const cicloSelecionadoId = ref("");
    const precoArroba = ref(null);
    const lotes = ref([]);
    const ciclos = ref([]);
    const historico = ref([]);
    const mensagem = ref("");
    const vendaSelecionada = ref(null);
    const dataVendaSelecionada = ref("");

    const adicionarLote = () =>
      lotesParaVenda.value.push({
        docId: "",
        quantidadeVendida: null,
        pesoFinalTotal: null,
        rendimentoCarcaca: null,
      });

    const removerLote = (i) => lotesParaVenda.value.length > 1 && lotesParaVenda.value.splice(i, 1);

    const getQuantidadeOriginal = (id) => lotes.value.find((l) => l.docId === id)?.quantidade || null;

    const calcularDiasConfinamento = (dataEntrada) => {
      const entrada = dataEntrada?.toDate ? dataEntrada.toDate() : new Date(dataEntrada);
      const hoje = new Date();
      entrada.setHours(0, 0, 0, 0);
      hoje.setHours(0, 0, 0, 0);
      return Math.floor((hoje - entrada) / (1000 * 60 * 60 * 24));
    };

    const carregarLotes = async () => {
      const snap = await getDocs(collection(db, "LotesConfinamento"));
      lotes.value = snap.docs.map((docSnap) => ({
        docId: docSnap.id,
        ...docSnap.data(),
        diasConfinamento: calcularDiasConfinamento(docSnap.data().dataEntrada),
      }));
    };

    const carregarCiclos = async () => {
      const snap = await getDocs(collection(db, "CiclosGastos"));
      ciclos.value = snap.docs.map((d) => ({ id: d.id, ...d.data(), total: d.data().total || 0 }));
    };

    const carregarHistorico = async () => {
      const q = query(collection(db, "RegistroVendasLotes"), orderBy("dataVenda", "desc"));
      const snap = await getDocs(q);
      historico.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    };

    // ✅ Detalhe do lote: agora salva PESO + snapshot do lote
    const calcularDetalhesLote = (venda) => {
      const lote = lotes.value.find((l) => l.docId === venda.docId);
      const ciclo = ciclos.value.find((c) => c.id === cicloSelecionadoId.value);

      if (
        !lote ||
        !ciclo ||
        !precoArroba.value ||
        !venda.pesoFinalTotal ||
        !venda.quantidadeVendida ||
        !venda.rendimentoCarcaca
      )
        return null;

      // custo por cabeça (ciclo + compra)
      const custoIndireto = ciclo.total / (ciclo.totalAnimais || 1);
      const custoDireto = (lote.custoCompraGado || 0) / (lote.quantidade || 1);
      const custoTotalCabeca = custoIndireto + custoDireto;
      const custoLote = venda.quantidadeVendida * custoTotalCabeca;

      // ✅ peso real informado
      const pesoFinalTotalKg = Number(venda.pesoFinalTotal);
      const pesoMedioFinalKg = pesoFinalTotalKg / venda.quantidadeVendida;

      // carcaça por cabeça e arrobas
      const pesoCarcacaKgCabeca = pesoMedioFinalKg * (venda.rendimentoCarcaca / 100);
      const arrobasCabeca = pesoCarcacaKgCabeca / 15;
      const arrobasTotais = arrobasCabeca * venda.quantidadeVendida;

      // receita
      const receitaLote = arrobasTotais * precoArroba.value;

      return {
        // identificadores
        id: lote.id || lote.docId,
        docId: lote.docId,

        // venda
        quantidadeVendida: venda.quantidadeVendida,
        rendimentoCarcaca: venda.rendimentoCarcaca,
        precoArroba: precoArroba.value,

        // pesos
        pesoFinalTotalKg,
        pesoMedioFinalKg,
        pesoCarcacaKgCabeca,
        arrobasCabeca,
        arrobasTotais,

        // financeiros
        receita: receitaLote,
        custo: custoLote,
        lucro: receitaLote - custoLote,

        // snapshot do lote (para análise/ML)
        categoria: lote.categoria || null,
        raca: lote.raca || null,
        linha: lote.linha || null,
        pesoInicial: lote.pesoInicial ?? null,
        gpd: lote.gpd ?? null,
        dataEntrada: lote.dataEntrada || null,
        quantidadeLoteAntes: lote.quantidade ?? null,
        custoCompraGadoAntes: lote.custoCompraGado ?? 0,
        createdAt: lote.createdAt || null,
      };
    };

    const lotesElegiveis = computed(() =>
      lotes.value.filter((l) => {
        const categoria = l.categoria?.toUpperCase().trim();
        if (categoria === "FEMEA") return l.diasConfinamento >= 60;
        if (categoria === "MACHO") return l.diasConfinamento >= 90;
        return l.diasConfinamento >= 90;
      })
    );

    const receitaEstimada = computed(() =>
      lotesParaVenda.value.reduce((t, l) => {
        const det = calcularDetalhesLote(l);
        return t + (det ? det.receita : 0);
      }, 0)
    );

    const custoEstimado = computed(() =>
      lotesParaVenda.value.reduce((t, l) => {
        const det = calcularDetalhesLote(l);
        return t + (det ? det.custo : 0);
      }, 0)
    );

    const lucroEstimado = computed(() => receitaEstimada.value - custoEstimado.value);

    const formatarData = (d) => {
      const data = d?.toDate?.() || new Date(d);
      return data.toLocaleDateString("pt-BR");
    };

    const formatarValor = (valor) => {
      const num = parseFloat(valor);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const abrirDetalhes = (v) => (vendaSelecionada.value = v);
    const fecharDetalhes = () => (vendaSelecionada.value = null);

    const registrarVenda = async () => {
      if (
        !lotesParaVenda.value.every(
          (l) => l.docId && l.quantidadeVendida > 0 && l.pesoFinalTotal > 0 && l.rendimentoCarcaca > 0
        ) ||
        !cicloSelecionadoId.value ||
        !precoArroba.value
      ) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
      }

      const detalhes = lotesParaVenda.value.map(calcularDetalhesLote).filter((d) => d);

      const venda = {
        quantidade: lotesParaVenda.value.reduce((t, l) => t + (l.quantidadeVendida || 0), 0),
        receita: receitaEstimada.value,
        custo: custoEstimado.value,
        lucro: lucroEstimado.value,
        dataVenda: dataVendaSelecionada.value
          ? Timestamp.fromDate(new Date(dataVendaSelecionada.value))
          : Timestamp.now(),
        detalhes,
        precoArroba: precoArroba.value,
        cicloId: cicloSelecionadoId.value,
      };

      // SALVAR A VENDA NO HISTÓRICO
      await addDoc(collection(db, "RegistroVendasLotes"), venda);

      // ATUALIZAR LOTES (reduzir ou deletar)
      for (const l of lotesParaVenda.value) {
        const loteRef = doc(db, "LotesConfinamento", l.docId);
        const snap = await getDoc(loteRef);

        if (snap.exists()) {
          const dadosLote = snap.data();
          const quantidadeAntes = dadosLote.quantidade;
          const quantidadeVendida = l.quantidadeVendida;
          const custoTotalAntes = dadosLote.custoCompraGado;
          const novaQuantidade = quantidadeAntes - quantidadeVendida;

          if (novaQuantidade <= 0) {
            await deleteDoc(loteRef);
          } else {
            const custoPorCabeca = custoTotalAntes / quantidadeAntes;
            const novoCusto = custoPorCabeca * novaQuantidade;

            await updateDoc(loteRef, {
              quantidade: novaQuantidade,
              custoCompraGado: novoCusto,
            });
          }
        }
      }

      mensagem.value = "✅ Venda registrada com sucesso!";
      lotesParaVenda.value = [{ docId: "", quantidadeVendida: null, pesoFinalTotal: null, rendimentoCarcaca: null }];
      cicloSelecionadoId.value = "";
      precoArroba.value = null;
      dataVendaSelecionada.value = "";

      await carregarLotes();
      await carregarHistorico();

      setTimeout(() => (mensagem.value = ""), 4000);
    };

    onMounted(() => {
      carregarLotes();
      carregarCiclos();
      carregarHistorico();
    });

    return {
      lotesParaVenda,
      cicloSelecionadoId,
      precoArroba,
      lotesElegiveis,
      ciclos,
      historico,
      receitaEstimada,
      custoEstimado,
      lucroEstimado,
      adicionarLote,
      removerLote,
      getQuantidadeOriginal,
      registrarVenda,
      formatarData,
      formatarValor,
      mensagem,
      vendaSelecionada,
      abrirDetalhes,
      fecharDetalhes,
      dataVendaSelecionada,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
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
.btn-success {
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
  font-size: 0.95rem;
}
.table th,
.table td {
  vertical-align: middle;
  text-align: center;
}
.cursor-pointer:hover {
  background-color: #f0f8ff;
  cursor: pointer;
}
.modal-backdrop {
  z-index: 1040;
}
.modal {
  z-index: 1050;
}
</style>
