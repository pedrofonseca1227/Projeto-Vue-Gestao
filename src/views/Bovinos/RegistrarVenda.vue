<template>
  <div class="container mt-5">
    <h2 class="text-center fw-bold mb-4">📦 Registrar Venda de Lote</h2>

    <div class="card p-4 shadow-sm mb-5">
      <div
        v-for="(vendaLote, index) in lotesParaVenda"
        :key="index"
        class="row g-3 mb-3 border p-3 rounded"
      >
        <div class="col-md-4">
          <label class="form-label">Lote Selecionado</label>
          <select v-model="vendaLote.docId" class="form-select" required>
            <option disabled value="">Escolha um lote</option>
            <option v-for="l in lotesElegiveis" :key="l.docId" :value="l.docId">
              {{ l.id }} - {{ l.quantidadeAtual }} cabeças - Linha {{ l.linha || "-" }}
            </option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label">Qtde a Vender</label>
          <input
            v-model.number="vendaLote.quantidadeVendida"
            type="number"
            class="form-control"
            min="1"
            :max="getQuantidadeDisponivelLinha(vendaLote.docId, index)"
            required
          />
        </div>

        <div class="col-md-3">
          <label class="form-label">Peso Final Total (kg)</label>
          <input
            v-model.number="vendaLote.pesoFinalTotal"
            type="number"
            step="0.01"
            class="form-control"
            min="0.01"
            required
          />
        </div>

        <div class="col-md-2">
          <label class="form-label">Rend. (%)</label>
          <select v-model.number="vendaLote.rendimentoCarcaca" class="form-select" required>
            <option disabled value="">%</option>
            <option v-for="p in [50, 52, 53, 54, 55, 56, 57]" :key="p" :value="p">
              {{ p }}%
            </option>
          </select>
        </div>

        <div class="col-md-1 d-flex align-items-end">
          <button @click="removerLote(index)" class="btn btn-danger btn-sm w-100">-</button>
        </div>

        <div class="col-12" v-if="buscarLote(vendaLote.docId)">
          <div class="alert alert-light border mb-0">
            <small>
              <strong>Custo unitário atual:</strong>
              R$ {{ formatarValor(getCustoUnitarioAtual(buscarLote(vendaLote.docId))) }}
              |
              <strong>Disponível:</strong>
              {{ buscarLote(vendaLote.docId).quantidadeAtual }}
              |
              <strong>Linha:</strong>
              {{ buscarLote(vendaLote.docId).linha || "-" }}
            </small>
          </div>
        </div>
      </div>

      <div class="d-grid gap-2 mb-3">
        <button @click="adicionarLote" class="btn btn-outline-primary">
          + Adicionar outro Lote
        </button>
      </div>

      <div class="mb-3">
        <label class="form-label">Data da Venda</label>
        <input v-model="dataVendaSelecionada" type="date" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Valor Total da Venda (R$)</label>
        <MoneyInput v-model="valorTotalVenda" class="form-control" required />
      </div>

      <div class="alert alert-info">
        <p><strong>Arrobas Totais Estimadas:</strong> {{ formatarValor(totalArrobasEstimadas) }} @</p>
        <p><strong>Receita Total Informada:</strong> R$ {{ formatarValor(receitaEstimada) }}</p>
        <p><strong>Custo Total Estimado:</strong> R$ {{ formatarValor(custoEstimado) }}</p>
        <p><strong>Lucro Total Estimado:</strong> R$ {{ formatarValor(lucroEstimado) }}</p>
      </div>

      <button class="btn btn-success w-100" @click="registrarVenda" :disabled="salvando">
        {{ salvando ? "Salvando venda..." : "✅ Registrar Venda" }}
      </button>
    </div>

    <div
      v-if="mensagem"
      class="alert text-center"
      :class="mensagem.startsWith('✅') ? 'alert-success' : 'alert-danger'"
    >
      {{ mensagem }}
    </div>

    <div class="d-flex justify-content-end mb-3">
      <button
        class="btn btn-outline-success"
        @click="exportarDatasetCSV"
        :disabled="exportandoCsv"
      >
        {{ exportandoCsv ? "Exportando..." : "📤 Exportar Dataset CSV" }}
      </button>
    </div>

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
            <td>{{ v.quantidadeTotal }}</td>
            <td>R$ {{ formatarValor(v.receitaTotal) }}</td>
            <td>R$ {{ formatarValor(v.custoTotal) }}</td>
            <td>R$ {{ formatarValor(v.lucroTotal) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-muted text-center">
        Nenhuma venda registrada ainda.
      </div>
    </div>

    <div
      class="modal fade"
      tabindex="-1"
      aria-hidden="true"
      :class="{ 'd-block show': vendaSelecionada }"
      v-if="vendaSelecionada"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Detalhes da Venda - {{ formatarData(vendaSelecionada.dataVenda) }}
            </h5>
            <button type="button" class="btn-close" @click="fecharDetalhes"></button>
          </div>

          <div class="modal-body">
            <p><strong>Valor Total da Venda:</strong> R$ {{ formatarValor(vendaSelecionada.valorTotalVenda) }}</p>
            <p><strong>Receita Total:</strong> R$ {{ formatarValor(vendaSelecionada.receitaTotal) }}</p>
            <p><strong>Custo Total:</strong> R$ {{ formatarValor(vendaSelecionada.custoTotal) }}</p>
            <p><strong>Lucro Total:</strong> R$ {{ formatarValor(vendaSelecionada.lucroTotal) }}</p>

            <h6 class="mt-4">Lotes Vendidos</h6>
            <table class="table table-sm table-striped">
              <thead class="table-info">
                <tr>
                  <th>ID Lote</th>
                  <th>Categoria</th>
                  <th>Raça</th>
                  <th>Linha</th>
                  <th>Qtde Vendida</th>
                  <th>Peso Total</th>
                  <th>Peso Médio</th>
                  <th>Arrobas</th>
                  <th>Receita</th>
                  <th>Custo</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detalhe, i) in vendaSelecionada.detalhes" :key="i">
                  <td>{{ detalhe.loteId || "-" }}</td>
                  <td>{{ detalhe.categoria || "-" }}</td>
                  <td>{{ detalhe.raca || "-" }}</td>
                  <td>{{ detalhe.linha || "-" }}</td>
                  <td>{{ detalhe.quantidadeVendida }}</td>
                  <td>{{ detalhe.pesoFinalTotalKg?.toFixed(2) || "-" }}</td>
                  <td>{{ detalhe.pesoMedioFinalKg?.toFixed(2) || "-" }}</td>
                  <td>{{ detalhe.arrobasTotais?.toFixed(2) || "-" }}</td>
                  <td>R$ {{ formatarValor(detalhe.receita) }}</td>
                  <td>R$ {{ formatarValor(detalhe.custo) }}</td>
                  <td>R$ {{ formatarValor(detalhe.lucro) }}</td>
                </tr>
              </tbody>
            </table>

            <div v-if="vendaSelecionada.detalhes?.length" class="mt-4">
              <h6>Rateio de ciclos</h6>
              <div
                v-for="(detalhe, idx) in vendaSelecionada.detalhes"
                :key="`rateio-${idx}`"
                class="mb-3"
              >
                <strong>{{ detalhe.loteId }}</strong>
                <div v-if="detalhe.ciclosUtilizados?.length" class="table-responsive mt-2">
                  <table class="table table-sm table-bordered">
                    <thead>
                      <tr>
                        <th>Ano</th>
                        <th>Semestre</th>
                        <th>Dias no ciclo</th>
                        <th>Dias do ciclo</th>
                        <th>Fração</th>
                        <th>Custo/Cabeça</th>
                        <th>Parcela/Cabeça</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(c, cIdx) in detalhe.ciclosUtilizados" :key="cIdx">
                        <td>{{ c.ano }}</td>
                        <td>{{ c.semestre }}º</td>
                        <td>{{ c.diasNoCiclo }}</td>
                        <td>{{ c.diasTotaisCiclo }}</td>
                        <td>{{ c.fracaoDoCiclo.toFixed(4) }}</td>
                        <td>R$ {{ formatarValor(c.custoPorCabeca) }}</td>
                        <td>R$ {{ formatarValor(c.parcelaCustoPorCabeca) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-muted">Nenhum ciclo utilizado.</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="fecharDetalhes">
              Fechar
            </button>
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
  query,
  orderBy,
  Timestamp,
  runTransaction,
} from "firebase/firestore";

export default {
  name: "RegistrarVendas",
  setup() {
    const lotesParaVenda = ref([
      { docId: "", quantidadeVendida: null, pesoFinalTotal: null, rendimentoCarcaca: null },
    ]);

    const valorTotalVenda = ref(null);
    const lotes = ref([]);
    const ciclos = ref([]);
    const historico = ref([]);
    const mensagem = ref("");
    const vendaSelecionada = ref(null);
    const dataVendaSelecionada = ref("");
    const salvando = ref(false);
    const exportandoCsv = ref(false);

    const adicionarLote = () => {
      lotesParaVenda.value.push({
        docId: "",
        quantidadeVendida: null,
        pesoFinalTotal: null,
        rendimentoCarcaca: null,
      });
    };

    const removerLote = (i) => {
      if (lotesParaVenda.value.length > 1) {
        lotesParaVenda.value.splice(i, 1);
      }
    };

    const buscarLote = (docId) => {
      return lotes.value.find((l) => l.docId === docId) || null;
    };

    const normalizarData = (valor) => {
      const data = valor?.toDate ? valor.toDate() : new Date(valor);
      data.setHours(0, 0, 0, 0);
      return data;
    };

    const calcularDiasEntre = (inicio, fim) => {
      const inicioNorm = normalizarData(inicio);
      const fimNorm = normalizarData(fim);
      return Math.floor((fimNorm - inicioNorm) / (1000 * 60 * 60 * 24)) + 1;
    };

    const calcularDiasConfinamento = (dataEntrada, dataVenda = null) => {
      const entrada = normalizarData(dataEntrada);
      const fim = dataVenda ? normalizarData(dataVenda) : normalizarData(new Date());
      return Math.floor((fim - entrada) / (1000 * 60 * 60 * 24));
    };

    const carregarLotes = async () => {
      const snap = await getDocs(collection(db, "LotesConfinamento"));
      lotes.value = snap.docs
        .map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }))
        .filter(
          (l) => (l.status || "ATIVO") === "ATIVO" && Number(l.quantidadeAtual || 0) > 0
        );
    };

    const carregarCiclos = async () => {
      const q = query(collection(db, "CiclosGastos"), orderBy("inicio", "asc"));
      const snap = await getDocs(q);
      ciclos.value = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        total: Number(d.data().total || 0),
        totalAnimais: Number(d.data().totalAnimais || 0),
        custoPorCabeca: Number(d.data().custoPorCabeca || 0),
      }));
    };

    const carregarHistorico = async () => {
      const q = query(collection(db, "RegistroVendasLotes"), orderBy("dataVenda", "desc"));
      const snap = await getDocs(q);
      historico.value = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    };

    const getCustoUnitarioAtual = (lote) => {
      const quantidade = Number(lote?.quantidadeAtual || 0);
      const custo = Number(lote?.custoAtual || 0);
      if (!quantidade || quantidade <= 0) return 0;
      return custo / quantidade;
    };

    const dataVendaObj = computed(() => {
      if (!dataVendaSelecionada.value) return new Date();
      return new Date(`${dataVendaSelecionada.value}T00:00:00`);
    });

    const ehProntoVenda = (lote) => {
      const categoria = lote.categoria?.toUpperCase().trim();
      const dias = calcularDiasConfinamento(lote.dataEntrada, dataVendaObj.value);

      if (categoria === "FEMEA") return dias >= 60;
      if (categoria === "MACHO") return dias >= 90;
      return true;
    };

    const lotesElegiveis = computed(() =>
      lotes.value.filter((l) => {
        return (l.status || "ATIVO") === "ATIVO" && Number(l.quantidadeAtual || 0) > 0;
      })
    );

    const getQuantidadeJaUsadaMesmoLote = (docId, indexAtual) => {
      return lotesParaVenda.value.reduce((total, item, index) => {
        if (index === indexAtual) return total;
        if (item.docId === docId) {
          return total + Number(item.quantidadeVendida || 0);
        }
        return total;
      }, 0);
    };

    const getQuantidadeDisponivelLinha = (docId, indexAtual) => {
      const lote = buscarLote(docId);
      if (!lote) return null;
      const usada = getQuantidadeJaUsadaMesmoLote(docId, indexAtual);
      const disponivel = Number(lote.quantidadeAtual || 0) - usada;
      return disponivel > 0 ? disponivel : 0;
    };

    const obterInterseccaoCiclos = (dataEntrada, dataVenda) => {
      const inicioLote = normalizarData(dataEntrada);
      const fimLote = normalizarData(dataVenda);

      return ciclos.value
        .map((ciclo) => {
          const inicioCiclo = normalizarData(ciclo.inicio);
          const fimCiclo = normalizarData(ciclo.fim);

          const inicioInterseccao = inicioLote > inicioCiclo ? inicioLote : inicioCiclo;
          const fimInterseccao = fimLote < fimCiclo ? fimLote : fimCiclo;

          if (inicioInterseccao > fimInterseccao) return null;

          const diasNoCiclo = calcularDiasEntre(inicioInterseccao, fimInterseccao);
          const diasTotaisCiclo = calcularDiasEntre(inicioCiclo, fimCiclo);
          const fracaoDoCiclo = diasNoCiclo / diasTotaisCiclo;
          const custoPorCabeca = Number(ciclo.custoPorCabeca || 0);
          const parcelaCustoPorCabeca = custoPorCabeca * fracaoDoCiclo;

          return {
            cicloId: ciclo.id,
            ano: ciclo.ano || null,
            semestre: ciclo.semestre || null,
            inicio: ciclo.inicio,
            fim: ciclo.fim,
            diasNoCiclo,
            diasTotaisCiclo,
            fracaoDoCiclo,
            custoPorCabeca,
            parcelaCustoPorCabeca,
            status: ciclo.status || null,
          };
        })
        .filter(Boolean);
    };

    const calcularArrobasLote = (vendaLote) => {
      if (
        !vendaLote?.pesoFinalTotal ||
        !vendaLote?.quantidadeVendida ||
        !vendaLote?.rendimentoCarcaca
      ) {
        return 0;
      }

      const quantidadeVendida = Number(vendaLote.quantidadeVendida);
      const pesoFinalTotalKg = Number(vendaLote.pesoFinalTotal);
      const pesoMedioFinalKg = pesoFinalTotalKg / quantidadeVendida;
      const pesoCarcacaKgCabeca = pesoMedioFinalKg * (Number(vendaLote.rendimentoCarcaca) / 100);
      const arrobasCabeca = pesoCarcacaKgCabeca / 15;
      return arrobasCabeca * quantidadeVendida;
    };

    const totalArrobasEstimadas = computed(() =>
      lotesParaVenda.value.reduce((sum, item) => sum + calcularArrobasLote(item), 0)
    );

    const calcularReceitaRateada = (arrobasTotaisLote) => {
      const valorTotal = Number(valorTotalVenda.value || 0);
      const totalArrobas = Number(totalArrobasEstimadas.value || 0);

      if (valorTotal <= 0 || totalArrobas <= 0 || arrobasTotaisLote <= 0) return 0;
      return valorTotal * (arrobasTotaisLote / totalArrobas);
    };

    const calcularDetalhesLote = (vendaLote) => {
      const lote = buscarLote(vendaLote.docId);

      if (
        !lote ||
        !valorTotalVenda.value ||
        !vendaLote.pesoFinalTotal ||
        !vendaLote.quantidadeVendida ||
        !vendaLote.rendimentoCarcaca ||
        !dataVendaSelecionada.value
      ) {
        return null;
      }

      const quantidadeVendida = Number(vendaLote.quantidadeVendida);
      const pesoFinalTotalKg = Number(vendaLote.pesoFinalTotal);
      const pesoMedioFinalKg = pesoFinalTotalKg / quantidadeVendida;

      const pesoCarcacaKgCabeca = pesoMedioFinalKg * (Number(vendaLote.rendimentoCarcaca) / 100);
      const arrobasCabeca = pesoCarcacaKgCabeca / 15;
      const arrobasTotais = arrobasCabeca * quantidadeVendida;

      const receita = calcularReceitaRateada(arrobasTotais);

      const custoDiretoUnitario = getCustoUnitarioAtual(lote);
      const custoDireto = custoDiretoUnitario * quantidadeVendida;

      const ciclosUtilizados = obterInterseccaoCiclos(lote.dataEntrada, dataVendaObj.value);
      const custoIndiretoUnitario = ciclosUtilizados.reduce(
        (sum, c) => sum + Number(c.parcelaCustoPorCabeca || 0),
        0
      );

      const custoIndireto = custoIndiretoUnitario * quantidadeVendida;
      const custo = custoDireto + custoIndireto;
      const lucro = receita - custo;

      const diasConfinamento = calcularDiasConfinamento(lote.dataEntrada, dataVendaObj.value);

      return {
        loteDocId: lote.docId,
        loteId: lote.id || lote.docId,
        linha: lote.linha || null,
        categoria: lote.categoria || null,
        raca: lote.raca || null,
        quantidadeVendida,
        pesoFinalTotalKg,
        pesoMedioFinalKg,
        pesoCarcacaKgCabeca,
        arrobasCabeca,
        arrobasTotais,
        rendimentoCarcaca: Number(vendaLote.rendimentoCarcaca),
        valorTotalVendaInformado: Number(valorTotalVenda.value),
        receita,
        custoDiretoUnitario,
        custoDireto,
        custoIndiretoUnitario,
        custoIndireto,
        custo,
        lucro,
        diasConfinamento,
        prontoParaVenda: ehProntoVenda(lote),
        ciclosUtilizados,
        snapshotLote: {
          id: lote.id || null,
          linha: lote.linha || null,
          quantidadeInicial: lote.quantidadeInicial ?? null,
          quantidadeAtualAntesVenda: lote.quantidadeAtual ?? null,
          custoCompraInicial: lote.custoCompraInicial ?? null,
          custoAtualAntesVenda: lote.custoAtual ?? null,
          custoUnitarioCompra: lote.custoUnitarioCompra ?? null,
          dataEntrada: lote.dataEntrada || null,
          pesoInicial: lote.pesoInicial ?? null,
          raca: lote.raca ?? null,
          categoria: lote.categoria ?? null,
          gpd: lote.gpd ?? null,
          lotePaiId: lote.lotePaiId ?? null,
          cicloEntradaId: lote.cicloEntradaId ?? null,
          status: lote.status ?? null,
        },
      };
    };

    const receitaEstimada = computed(() => Number(valorTotalVenda.value || 0));

    const custoEstimado = computed(() =>
      lotesParaVenda.value.reduce((total, item) => {
        const det = calcularDetalhesLote(item);
        return total + (det ? det.custo : 0);
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

    const formatarDataISO = (valor) => {
      if (!valor) return "";
      const data = valor?.toDate ? valor.toDate() : new Date(valor);
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    };

    const montarRegistroDataset = (detalhe, vendaId, dataVenda) => {
      const pesoInicialKg = Number(detalhe.snapshotLote?.pesoInicial || 0);
      const pesoMedioFinalKg = Number(detalhe.pesoMedioFinalKg || 0);
      const ganhoPesoKg = pesoMedioFinalKg - pesoInicialKg;

      return {
        vendaId,
        loteDocId: detalhe.loteDocId,
        loteId: detalhe.loteId,

        dataEntrada: detalhe.snapshotLote?.dataEntrada || null,
        dataVenda,
        dataEntradaISO: formatarDataISO(detalhe.snapshotLote?.dataEntrada),
        dataVendaISO: formatarDataISO(dataVenda),

        linha: detalhe.linha || null,
        categoria: detalhe.categoria || null,
        raca: detalhe.raca || null,

        quantidadeVendida: Number(detalhe.quantidadeVendida || 0),
        diasConfinamento: Number(detalhe.diasConfinamento || 0),

        pesoInicialKg: Number(pesoInicialKg.toFixed(2)),
        pesoFinalTotalKg: Number((detalhe.pesoFinalTotalKg || 0).toFixed(2)),
        pesoMedioFinalKg: Number(pesoMedioFinalKg.toFixed(2)),
        ganhoPesoKg: Number(ganhoPesoKg.toFixed(2)),

        rendimentoCarcaca: Number(detalhe.rendimentoCarcaca || 0),
        arrobasTotais: Number((detalhe.arrobasTotais || 0).toFixed(2)),
        valorTotalVendaInformado: Number(detalhe.valorTotalVendaInformado || 0),

        custoDiretoUnitario: Number((detalhe.custoDiretoUnitario || 0).toFixed(2)),
        custoDiretoTotal: Number((detalhe.custoDireto || 0).toFixed(2)),
        custoIndiretoUnitario: Number((detalhe.custoIndiretoUnitario || 0).toFixed(2)),
        custoIndiretoTotal: Number((detalhe.custoIndireto || 0).toFixed(2)),
        custoTotal: Number((detalhe.custo || 0).toFixed(2)),

        receitaTotal: Number((detalhe.receita || 0).toFixed(2)),
        lucroTotal: Number((detalhe.lucro || 0).toFixed(2)),
        lucroPorCabeca: Number(
          ((detalhe.lucro || 0) / Number(detalhe.quantidadeVendida || 1)).toFixed(2)
        ),
        teveLucro: Number(detalhe.lucro || 0) > 0,

        gpdPrevisto: Number(detalhe.snapshotLote?.gpd || 0),
        prontoParaVenda: !!detalhe.prontoParaVenda,

        quantidadeInicialLote: detalhe.snapshotLote?.quantidadeInicial ?? null,
        quantidadeAtualAntesVenda: detalhe.snapshotLote?.quantidadeAtualAntesVenda ?? null,
        custoCompraInicialLote: detalhe.snapshotLote?.custoCompraInicial ?? null,
        custoAtualAntesVenda: detalhe.snapshotLote?.custoAtualAntesVenda ?? null,
        custoUnitarioCompraLote: detalhe.snapshotLote?.custoUnitarioCompra ?? null,
        lotePaiId: detalhe.snapshotLote?.lotePaiId ?? null,
        cicloEntradaId: detalhe.snapshotLote?.cicloEntradaId ?? null,

        ciclosUtilizados: (detalhe.ciclosUtilizados || []).map((c) => ({
          cicloId: c.cicloId,
          ano: c.ano,
          semestre: c.semestre,
          diasNoCiclo: c.diasNoCiclo,
          diasTotaisCiclo: c.diasTotaisCiclo,
          fracaoDoCiclo: Number((c.fracaoDoCiclo || 0).toFixed(6)),
          custoPorCabeca: Number((c.custoPorCabeca || 0).toFixed(2)),
          parcelaCustoPorCabeca: Number((c.parcelaCustoPorCabeca || 0).toFixed(2)),
        })),

        semestresUtilizados: (detalhe.ciclosUtilizados || [])
          .map((c) => `${c.ano}-S${c.semestre}`)
          .join(" | "),

        createdAt: Timestamp.now(),
      };
    };

    const abrirDetalhes = (v) => {
      vendaSelecionada.value = v;
    };

    const fecharDetalhes = () => {
      vendaSelecionada.value = null;
    };

    const validarFormulario = () => {
      if (!valorTotalVenda.value || Number(valorTotalVenda.value) <= 0) {
        return "Informe um valor total de venda válido.";
      }

      if (!dataVendaSelecionada.value) {
        return "Informe a data da venda.";
      }

      if (!lotesParaVenda.value.length) {
        return "Adicione ao menos um lote.";
      }

      if (!ciclos.value.length) {
        return "Cadastre ao menos um ciclo antes de vender.";
      }

      for (const item of lotesParaVenda.value) {
        if (!item.docId) return "Selecione todos os lotes.";
        if (!item.quantidadeVendida || Number(item.quantidadeVendida) <= 0) {
          return "Informe uma quantidade vendida válida.";
        }
        if (!item.pesoFinalTotal || Number(item.pesoFinalTotal) <= 0) {
          return "Informe o peso final total corretamente.";
        }
        if (!item.rendimentoCarcaca || Number(item.rendimentoCarcaca) <= 0) {
          return "Informe o rendimento de carcaça.";
        }

        const lote = buscarLote(item.docId);
        if (lote && normalizarData(dataVendaObj.value) < normalizarData(lote.dataEntrada)) {
          return `A data da venda não pode ser anterior à entrada do lote ${lote.id}.`;
        }
      }

      if (Number(totalArrobasEstimadas.value) <= 0) {
        return "Não foi possível calcular as arrobas totais para ratear a receita.";
      }

      for (let i = 0; i < lotesParaVenda.value.length; i++) {
        const item = lotesParaVenda.value[i];
        const maxDisponivel = getQuantidadeDisponivelLinha(item.docId, i);
        if (Number(item.quantidadeVendida) > maxDisponivel) {
          return "Há lote com quantidade vendida maior que a disponível.";
        }
      }

      return null;
    };

    const registrarVenda = async () => {
      const erro = validarFormulario();
      if (erro) {
        mensagem.value = `❌ ${erro}`;
        setTimeout(() => (mensagem.value = ""), 4000);
        return;
      }

      salvando.value = true;
      mensagem.value = "";

      try {
        const detalhes = lotesParaVenda.value.map(calcularDetalhesLote).filter(Boolean);

        if (!detalhes.length) {
          throw new Error("Não foi possível calcular os detalhes da venda.");
        }

        const quantidadeTotal = detalhes.reduce((sum, d) => sum + Number(d.quantidadeVendida || 0), 0);
        const receitaTotal = Number(valorTotalVenda.value || 0);
        const custoTotal = detalhes.reduce((sum, d) => sum + Number(d.custo || 0), 0);
        const lucroTotal = receitaTotal - custoTotal;

        const dataVenda = Timestamp.fromDate(new Date(`${dataVendaSelecionada.value}T00:00:00`));

        await runTransaction(db, async (transaction) => {
          const lotesRefs = detalhes.map((d) => doc(db, "LotesConfinamento", d.loteDocId));
          const lotesSnaps = await Promise.all(lotesRefs.map((refLote) => transaction.get(refLote)));

          const snapMap = {};
          lotesSnaps.forEach((snap) => {
            if (snap.exists()) {
              snapMap[snap.id] = snap;
            }
          });

          for (const detalhe of detalhes) {
            const snap = snapMap[detalhe.loteDocId];

            if (!snap || !snap.exists()) {
              throw new Error(`Lote ${detalhe.loteId} não encontrado no momento da venda.`);
            }

            const loteAtual = snap.data();
            const quantidadeAtual = Number(loteAtual.quantidadeAtual || 0);
            const custoAtual = Number(loteAtual.custoAtual || 0);

            if (detalhe.quantidadeVendida > quantidadeAtual) {
              throw new Error(`Quantidade insuficiente no lote ${detalhe.loteId}.`);
            }

            const custoUnitarioAtual = quantidadeAtual > 0 ? custoAtual / quantidadeAtual : 0;
            const custoDiretoVendaReal = custoUnitarioAtual * detalhe.quantidadeVendida;

            const novaQuantidade = quantidadeAtual - detalhe.quantidadeVendida;
            const novoCusto = custoAtual - custoDiretoVendaReal;

            transaction.update(doc(db, "LotesConfinamento", detalhe.loteDocId), {
              quantidadeAtual: novaQuantidade,
              custoAtual: Number(Math.max(novoCusto, 0).toFixed(2)),
              status: novaQuantidade <= 0 ? "ENCERRADO" : "ATIVO",
              updatedAt: Timestamp.now(),
            });

            const movRef = doc(collection(db, "MovimentacoesLotes"));
            transaction.set(movRef, {
              tipo: "VENDA",
              loteOrigemDocId: detalhe.loteDocId,
              loteDestinoDocId: null,
              loteOrigemId: detalhe.loteId,
              loteDestinoId: null,
              linhaOrigem: detalhe.linha || null,
              linhaDestino: null,
              quantidade: detalhe.quantidadeVendida,
              custoUnitario: Number(custoUnitarioAtual.toFixed(2)),
              custoTotal: Number(custoDiretoVendaReal.toFixed(2)),
              dataMovimentacao: dataVenda,
              observacao: "Venda registrada",
              ciclosRateados: detalhe.ciclosUtilizados.map((c) => ({
                cicloId: c.cicloId,
                ano: c.ano,
                semestre: c.semestre,
                diasNoCiclo: c.diasNoCiclo,
                diasTotaisCiclo: c.diasTotaisCiclo,
                fracaoDoCiclo: Number(c.fracaoDoCiclo.toFixed(6)),
                custoPorCabeca: Number(c.custoPorCabeca.toFixed(2)),
                parcelaCustoPorCabeca: Number(c.parcelaCustoPorCabeca.toFixed(2)),
              })),
              createdAt: Timestamp.now(),
            });
          }

          const vendaRef = doc(collection(db, "RegistroVendasLotes"));
          transaction.set(vendaRef, {
            dataVenda,
            valorTotalVenda: Number(valorTotalVenda.value),
            quantidadeTotal,
            receitaTotal: Number(receitaTotal.toFixed(2)),
            custoTotal: Number(custoTotal.toFixed(2)),
            lucroTotal: Number(lucroTotal.toFixed(2)),
            detalhes: detalhes.map((d) => ({
              ...d,
              valorTotalVendaInformado: Number(d.valorTotalVendaInformado.toFixed(2)),
              receita: Number(d.receita.toFixed(2)),
              custo: Number(d.custo.toFixed(2)),
              lucro: Number(d.lucro.toFixed(2)),
              custoDireto: Number(d.custoDireto.toFixed(2)),
              custoIndireto: Number(d.custoIndireto.toFixed(2)),
              custoDiretoUnitario: Number(d.custoDiretoUnitario.toFixed(2)),
              custoIndiretoUnitario: Number(d.custoIndiretoUnitario.toFixed(2)),
              pesoFinalTotalKg: Number(d.pesoFinalTotalKg.toFixed(2)),
              pesoMedioFinalKg: Number(d.pesoMedioFinalKg.toFixed(2)),
              pesoCarcacaKgCabeca: Number(d.pesoCarcacaKgCabeca.toFixed(2)),
              arrobasCabeca: Number(d.arrobasCabeca.toFixed(2)),
              arrobasTotais: Number(d.arrobasTotais.toFixed(2)),
              ciclosUtilizados: d.ciclosUtilizados.map((c) => ({
                cicloId: c.cicloId,
                ano: c.ano,
                semestre: c.semestre,
                diasNoCiclo: c.diasNoCiclo,
                diasTotaisCiclo: c.diasTotaisCiclo,
                fracaoDoCiclo: Number(c.fracaoDoCiclo.toFixed(6)),
                custoPorCabeca: Number(c.custoPorCabeca.toFixed(2)),
                parcelaCustoPorCabeca: Number(c.parcelaCustoPorCabeca.toFixed(2)),
              })),
            })),
            createdAt: Timestamp.now(),
          });

          for (const detalhe of detalhes) {
            const datasetRef = doc(collection(db, "DatasetAnaliseVendas"));
            const datasetRegistro = montarRegistroDataset(detalhe, vendaRef.id, dataVenda);
            transaction.set(datasetRef, datasetRegistro);
          }
        });

        mensagem.value = "✅ Venda registrada com sucesso!";

        lotesParaVenda.value = [
          { docId: "", quantidadeVendida: null, pesoFinalTotal: null, rendimentoCarcaca: null },
        ];
        valorTotalVenda.value = null;
        dataVendaSelecionada.value = "";

        await carregarLotes();
        await carregarHistorico();

        setTimeout(() => (mensagem.value = ""), 4000);
      } catch (error) {
        console.error("Erro ao registrar venda:", error);
        mensagem.value = `❌ ${error.message || "Erro ao registrar venda."}`;
        setTimeout(() => (mensagem.value = ""), 5000);
      } finally {
        salvando.value = false;
      }
    };

    const escaparCsv = (valor) => {
      if (valor === null || valor === undefined) return "";
      const texto = String(valor).replace(/"/g, '""');
      return /[",;\n]/.test(texto) ? `"${texto}"` : texto;
    };

    const exportarDatasetCSV = async () => {
      exportandoCsv.value = true;

      try {
        const q = query(collection(db, "DatasetAnaliseVendas"), orderBy("dataVenda", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
          mensagem.value = "❌ Nenhum dado encontrado em DatasetAnaliseVendas.";
          setTimeout(() => (mensagem.value = ""), 4000);
          return;
        }

        const linhas = snap.docs.map((docSnap) => {
          const d = docSnap.data();

          return {
            id: docSnap.id,
            vendaId: d.vendaId || "",
            loteId: d.loteId || "",
            loteDocId: d.loteDocId || "",
            dataEntrada: d.dataEntradaISO || formatarDataISO(d.dataEntrada),
            dataVenda: d.dataVendaISO || formatarDataISO(d.dataVenda),
            linha: d.linha || "",
            categoria: d.categoria || "",
            raca: d.raca || "",
            quantidadeVendida: d.quantidadeVendida ?? "",
            diasConfinamento: d.diasConfinamento ?? "",
            pesoInicialKg: d.pesoInicialKg ?? "",
            pesoFinalTotalKg: d.pesoFinalTotalKg ?? "",
            pesoMedioFinalKg: d.pesoMedioFinalKg ?? "",
            ganhoPesoKg: d.ganhoPesoKg ?? "",
            rendimentoCarcaca: d.rendimentoCarcaca ?? "",
            arrobasTotais: d.arrobasTotais ?? "",
            valorTotalVendaInformado: d.valorTotalVendaInformado ?? "",
            custoDiretoUnitario: d.custoDiretoUnitario ?? "",
            custoDiretoTotal: d.custoDiretoTotal ?? "",
            custoIndiretoUnitario: d.custoIndiretoUnitario ?? "",
            custoIndiretoTotal: d.custoIndiretoTotal ?? "",
            custoTotal: d.custoTotal ?? "",
            receitaTotal: d.receitaTotal ?? "",
            lucroTotal: d.lucroTotal ?? "",
            lucroPorCabeca: d.lucroPorCabeca ?? "",
            teveLucro: d.teveLucro ? 1 : 0,
            gpdPrevisto: d.gpdPrevisto ?? "",
            prontoParaVenda: d.prontoParaVenda ? 1 : 0,
            quantidadeInicialLote: d.quantidadeInicialLote ?? "",
            quantidadeAtualAntesVenda: d.quantidadeAtualAntesVenda ?? "",
            custoCompraInicialLote: d.custoCompraInicialLote ?? "",
            custoAtualAntesVenda: d.custoAtualAntesVenda ?? "",
            custoUnitarioCompraLote: d.custoUnitarioCompraLote ?? "",
            lotePaiId: d.lotePaiId ?? "",
            cicloEntradaId: d.cicloEntradaId ?? "",
            semestresUtilizados: d.semestresUtilizados || "",
          };
        });

        const colunas = Object.keys(linhas[0]);
        const csv = [
          colunas.join(";"),
          ...linhas.map((linha) =>
            colunas.map((coluna) => escaparCsv(linha[coluna])).join(";")
          ),
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csv], {
          type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `dataset_analise_vendas_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        mensagem.value = "✅ CSV exportado com sucesso!";
        setTimeout(() => (mensagem.value = ""), 4000);
      } catch (error) {
        console.error("Erro ao exportar CSV:", error);
        mensagem.value = "❌ Erro ao exportar CSV.";
        setTimeout(() => (mensagem.value = ""), 4000);
      } finally {
        exportandoCsv.value = false;
      }
    };

    onMounted(async () => {
      await carregarLotes();
      await carregarCiclos();
      await carregarHistorico();
    });

    return {
      lotesParaVenda,
      valorTotalVenda,
      lotesElegiveis,
      ciclos,
      historico,
      totalArrobasEstimadas,
      receitaEstimada,
      custoEstimado,
      lucroEstimado,
      adicionarLote,
      removerLote,
      registrarVenda,
      formatarData,
      formatarValor,
      mensagem,
      vendaSelecionada,
      abrirDetalhes,
      fecharDetalhes,
      dataVendaSelecionada,
      buscarLote,
      getCustoUnitarioAtual,
      getQuantidadeDisponivelLinha,
      salvando,
      exportandoCsv,
      exportarDatasetCSV,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1000px;
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

.alert-success,
.alert-danger {
  border-radius: 8px;
  font-weight: 500;
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