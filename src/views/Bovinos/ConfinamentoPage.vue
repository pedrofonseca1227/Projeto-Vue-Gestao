<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-bold text-center text-primary">Cadastro de Lotes Confinados</h2>

    <!-- Formulário de novo lote -->
    <h4 class="text-primary border-bottom pb-2 mb-3">📋 Novo Lote</h4>
    <form @submit.prevent="cadastrarLote" class="card p-4 shadow-sm mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">ID do Lote</label>
          <input v-model="form.id" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Quantidade de Animais</label>
          <input v-model.number="form.quantidade" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Custo de Compra do Lote (R$)</label>
          <input v-model.number="form.custoCompraGado" type="number" step="0.01" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Data de Entrada</label>
          <input v-model="form.dataEntrada" type="date" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Peso Inicial (kg)</label>
          <input v-model.number="form.pesoInicial" type="number" step="0.1" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Raça</label>
          <input v-model="form.raca" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Categoria</label>
          <input v-model="form.categoria" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">GPD (kg/dia)</label>
          <input v-model.number="form.gpd" type="number" step="0.01" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Linha (opcional)</label>
          <input v-model="form.linha" class="form-control" />
        </div>
      </div>

      <div class="d-grid mt-4">
        <button class="btn btn-success">Cadastrar Lote</button>
      </div>
    </form>

    <!-- Mensagem -->
    <div v-if="mensagem" class="alert alert-success text-center mt-3">
      {{ mensagem }}
    </div>

    <!-- Estatísticas -->
    <div class="row mb-4" v-if="lotes.length">
      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">🐂 Total de Lotes</h6>
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

    <!-- Listagem -->
    <h4 class="text-primary border-bottom pb-2 mb-3 mt-5">📦 Lotes Ativos</h4>
    <div v-if="lotes.length" class="card p-3">
      <div class="table-responsive">
        <table class="table table-bordered table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Entrada</th>
              <th>Dias</th>
              <th>Qtde</th>
              <th>P. Inicial</th>
              <th>P. Final Est.</th>
              <th>GPD</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lote in lotes" :key="lote.id">
              <td>{{ lote.id }}</td>
              <td>{{ formatarData(lote.dataEntrada) }}</td>
              <td>{{ calcularDiasConfinamento(lote.dataEntrada) }}</td>
              <td>{{ lote.quantidade }}</td>
              <td>{{ lote.pesoInicial }} kg</td>
              <td>{{ calcularPesoFinal(lote) }} kg</td>
              <td>{{ lote.gpd }}</td>
              <td>
                <span class="badge" :class="calcularDiasConfinamento(lote.dataEntrada) >= 90 ? 'bg-success' : 'bg-warning'">
                  {{ calcularDiasConfinamento(lote.dataEntrada) >= 90 ? 'Pronto p/ Venda' : 'Em Confinamento' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase/firebase'
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore'

export default {
  setup() {
    const form = ref({
      id: '',
      quantidade: null,
      custoCompraGado: null,
      dataEntrada: '',
      pesoInicial: null,
      raca: '',
      categoria: '',
      gpd: null,
      linha: ''
    })

    const lotes = ref([])
    const mensagem = ref('')

    const carregarLotes = async () => {
      const snapshot = await getDocs(collection(db, 'LotesConfinamento'))
      lotes.value = snapshot.docs.map(doc => doc.data())
    }

    const cadastrarLote = async () => {
      const [ano, mes, dia] = form.value.dataEntrada.split('-').map(Number)
      const dataCorrigida = new Date(ano, mes - 1, dia, 12, 0, 0)

      const doc = {
        ...form.value,
        dataEntrada: Timestamp.fromDate(dataCorrigida),
        createdAt: Timestamp.now()
      }

      await addDoc(collection(db, 'LotesConfinamento'), doc)
      await carregarLotes()

      form.value = {
        id: '', quantidade: null, custoCompraGado: null, dataEntrada: '', pesoInicial: null, raca: '', categoria: '', gpd: null, linha: ''
      }

      mensagem.value = '✅ Lote cadastrado com sucesso!'
      setTimeout(() => mensagem.value = '', 4000)
    }

    const calcularDiasConfinamento = (dataEntrada) => {
      const entrada = dataEntrada.toDate ? dataEntrada.toDate() : new Date(dataEntrada)
      const hoje = new Date()
      return Math.floor((hoje - entrada) / (1000 * 60 * 60 * 24))
    }

    const calcularPesoFinal = (lote) => {
      const dias = calcularDiasConfinamento(lote.dataEntrada)
      return (parseFloat(lote.pesoInicial || 0) + (dias * parseFloat(lote.gpd || 0))).toFixed(1)
    }

    const formatarData = (timestamp) => {
      const data = timestamp?.toDate?.() || new Date(timestamp)
      const dataLocal = new Date(data.getTime() + data.getTimezoneOffset() * 60000)
      return dataLocal.toLocaleDateString('pt-BR')
    }

    // Estatísticas (totais)
    const totalAnimais = computed(() =>
      lotes.value.reduce((acc, lote) => acc + (lote.quantidade || 0), 0)
    )

    const pesoMedioFinal = computed(() => {
      if (!lotes.value.length) return 0
      const somaPesos = lotes.value.reduce((acc, lote) => acc + parseFloat(calcularPesoFinal(lote)), 0)
      return somaPesos / lotes.value.length
    })

    onMounted(() => {
      carregarLotes()
    })

    return {
      form,
      cadastrarLote,
      lotes,
      calcularDiasConfinamento,
      calcularPesoFinal,
      formatarData,
      mensagem,
      totalAnimais,
      pesoMedioFinal
    }
  }
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}

.table {
  min-width: 900px;
}

.table td, .table th {
  vertical-align: middle;
  text-align: center;
}

.table th {
  background-color: #004080;
  color: white;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4em 0.6em;
  border-radius: 12px;
}

.form-control {
  border-radius: 8px;
  box-shadow: none;
}

.btn-success {
  font-weight: bold;
  border-radius: 8px;
  background-color: #28a745;
  border: none;
}

h2, h4 {
  color: #004080;
}

.card h6 {
  font-size: 0.85rem;
}

.card h3 {
  margin: 0;
}
</style>