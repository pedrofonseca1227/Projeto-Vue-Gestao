<template>
  <div class="container mt-5">
    <h2 class="text-center fw-bold mb-4">📦 Registrar Venda de Lote</h2>

    <div class="card p-4 shadow-sm mb-5">
      <div class="mb-3">
        <label class="form-label">Selecione um lote (>= 90 dias)</label>
        <select v-model="loteSelecionadoId" class="form-select" required>
          <option disabled value="">Escolha um lote</option>
          <option v-for="l in lotesElegiveis" :key="l.id" :value="l.id">
            {{ l.id }} - {{ l.quantidade }} cabeças - Entrada: {{ formatarData(l.dataEntrada) }}
          </option>
        </select>
      </div>

      <div v-if="loteSelecionado" class="mt-3">
        <p><strong>Raça:</strong> {{ loteSelecionado.raca }}</p>
        <p><strong>Categoria:</strong> {{ loteSelecionado.categoria }}</p>
        <p><strong>Quantidade:</strong> {{ loteSelecionado.quantidade }}</p>
        <p><strong>Data de Entrada:</strong> {{ formatarData(loteSelecionado.dataEntrada) }}</p>

        <div class="mb-3">
          <label class="form-label">Selecione o ciclo de gastos</label>
          <select v-model="cicloSelecionadoId" class="form-select" required>
            <option disabled value="">Escolha um ciclo</option>
            <option v-for="ciclo in ciclos" :key="ciclo.id" :value="ciclo.id">
              {{ formatarData(ciclo.inicio) }} a {{ formatarData(ciclo.fim) }} - R$ {{ ciclo.total.toFixed(2) }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Preço acordado da arroba (R$)</label>
          <input v-model.number="precoArroba" type="number" step="0.01" class="form-control" required />
        </div>

        <div class="alert alert-info">
          <p><strong>Receita Estimada:</strong> R$ {{ receitaEstimada.toFixed(2) }}</p>
          <p><strong>Custo Estimado:</strong> R$ {{ custoEstimado.toFixed(2) }}</p>
          <p><strong>Lucro Estimado:</strong> R$ {{ lucroEstimado.toFixed(2) }}</p>
        </div>

        <button class="btn btn-success w-100" @click="registrarVenda">✅ Registrar Venda</button>
      </div>
    </div>

    <div v-if="mensagem" class="alert alert-success text-center">{{ mensagem }}</div>

    <div class="mt-5">
      <h5 class="fw-bold mb-3 text-center">📄 Histórico de Vendas</h5>
      <table class="table table-bordered" v-if="historico.length">
        <thead class="table-dark">
          <tr>
            <th>Data</th>
            <th>Lote</th>
            <th>Qtde</th>
            <th>Receita</th>
            <th>Custo</th>
            <th>Lucro</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in historico" :key="v.id">
            <td>{{ formatarData(v.dataVenda) }}</td>
            <td>{{ v.lote }}</td>
            <td>{{ v.quantidade }}</td>
            <td>R$ {{ v.receita.toFixed(2) }}</td>
            <td>R$ {{ v.custo.toFixed(2) }}</td>
            <td>R$ {{ v.lucro.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>    
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase/firebase'
import {
  collection, getDocs, doc, deleteDoc, addDoc, Timestamp, query, orderBy
} from 'firebase/firestore'

export default {
    setup() {
    const loteSelecionadoId = ref('')
    const cicloSelecionadoId = ref('')
    const precoArroba = ref(null)
    const lotes = ref([])
    const ciclos = ref([])
    const historico = ref([])
    const mensagem = ref('')
    
    // Função para calcular dias de confinamento
    const calcularDiasConfinamento = (dataEntrada) => {
      const entrada = dataEntrada.toDate ? dataEntrada.toDate() : new Date(dataEntrada)
      const hoje = new Date()
      entrada.setHours(0, 0, 0, 0)
      hoje.setHours(0, 0, 0, 0)
      return Math.floor((hoje - entrada) / (1000 * 60 * 60 * 24))
    }
  
    // Carregar lotes do Firestore e calcular dias de confinamento
    const carregarLotes = async () => {
      const snap = await getDocs(collection(db, 'LotesConfinamento'))
      lotes.value = snap.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          diasConfinamento: calcularDiasConfinamento(data.dataEntrada)
        }
      })
    }
  
    // Carregar ciclos de gastos trimestrais
    const carregarCiclos = async () => {
      const snap = await getDocs(collection(db, 'CiclosGastos'))
      ciclos.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }
  
    // Carregar histórico de vendas
    const carregarHistorico = async () => {
      const q = query(collection(db, 'RegistroVendasLotes'), orderBy('dataVenda', 'desc'))
      const snap = await getDocs(q)
      historico.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }
  
    // Computeds
    const loteSelecionado = computed(() =>
      lotes.value.find(l => l.id === loteSelecionadoId.value)
    )
  
    const cicloSelecionado = computed(() =>
      ciclos.value.find(c => c.id === cicloSelecionadoId.value)
    )
  
    const lotesElegiveis = computed(() =>
      lotes.value.filter(l => l.diasConfinamento >= 90)
    )
  
    const receitaEstimada = computed(() => {
      if (!loteSelecionado.value || !precoArroba.value) return 0
      const pesoFinal = loteSelecionado.value.pesoInicial + (loteSelecionado.value.gpd * loteSelecionado.value.diasConfinamento)
      const pesoTotal = pesoFinal * loteSelecionado.value.quantidade
      const arrobas = pesoTotal / 15
      return arrobas * precoArroba.value
    })
  
    const custoEstimado = computed(() => {
      if (!cicloSelecionado.value || !loteSelecionado.value) return 0
      const custoPorAnimal = cicloSelecionado.value.total / cicloSelecionado.value.totalAnimais
      return loteSelecionado.value.quantidade * custoPorAnimal
    })
  
    const lucroEstimado = computed(() => receitaEstimada.value - custoEstimado.value)
  
    // Formatar data
    const formatarData = (d) => {
      const data = d?.toDate?.() || new Date(d)
      return data.toLocaleDateString('pt-BR')
    }
  
    // Registrar venda
    const registrarVenda = async () => {
      if (!loteSelecionado.value || !cicloSelecionado.value || !precoArroba.value) return
    
      const venda = {
        lote: loteSelecionado.value.id,
        quantidade: loteSelecionado.value.quantidade,
        receita: receitaEstimada.value,
        custo: custoEstimado.value,
        lucro: lucroEstimado.value,
        dataVenda: Timestamp.now()
      }
    
      await addDoc(collection(db, 'RegistroVendasLotes'), venda)
      await deleteDoc(doc(db, 'LotesConfinamento', loteSelecionado.value.id))
    
      mensagem.value = '✅ Venda registrada com sucesso!'
      loteSelecionadoId.value = ''
      cicloSelecionadoId.value = ''
      precoArroba.value = null
    
      await carregarLotes()
      await carregarHistorico()
    
      setTimeout(() => (mensagem.value = ''), 4000)
    }
  
    onMounted(() => {
      carregarLotes()
      carregarCiclos()
      carregarHistorico()
    })
  
    return {
      loteSelecionadoId,
      cicloSelecionadoId,
      precoArroba,
      lotesElegiveis,
      loteSelecionado,
      cicloSelecionado,
      receitaEstimada,
      custoEstimado,
      lucroEstimado,
      registrarVenda,
      formatarData,
      historico,
      mensagem,
      ciclos
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
}

h2, h5 {
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

.table {
  font-size: 0.9rem;
  border-radius: 10px;
  overflow: hidden;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}

.table th {
  background-color: #004080;
  color: white;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: #f8f9fa;
}

.table-bordered {
  border-radius: 8px;
}
</style>
