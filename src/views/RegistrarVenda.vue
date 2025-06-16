<template>
  <div class="container mt-5">
    <h2 class="fw-bold text-center mb-4">📦 Registrar Venda de Lote</h2>

    <!-- Registro de venda -->
    <div class="card p-4 shadow-sm mb-5">
      <div class="mb-3">
        <label class="form-label">Selecione um lote disponível</label>
        <select v-model="loteSelecionadoId" class="form-select" required>
          <option value="" disabled>Escolha um lote</option>
          <option v-for="lote in lotesElegiveis" :key="lote.id" :value="lote.id">
            {{ lote.Lote }} - Curral {{ lote.Curral }} ({{ lote.Quantidade }} cabeças)
          </option>
        </select>
      </div>

      <div v-if="loteSelecionado" class="mt-3">
        <p><strong>Curral:</strong> {{ loteSelecionado.Curral }}</p>
        <p><strong>Raça:</strong> {{ loteSelecionado.Raca }}</p>
        <p><strong>Quantidade:</strong> {{ loteSelecionado.Quantidade }}</p>
        <p><strong>Peso Médio (kg):</strong> {{ loteSelecionado.Peso_Hoje }}</p>
        <p><strong>Dias em Confinamento:</strong> {{ loteSelecionado.Dias_Confinamento }}</p>

        <div class="mb-3 mt-4">
          <label class="form-label">Preço acordado da arroba (R$)</label>
          <input
            type="number"
            step="0.01"
            v-model.number="precoArroba"
            class="form-control"
            placeholder="Ex: 270.50"
            required
          />
        </div>

        <div v-if="precoArroba > 0" class="alert alert-info mt-3">
          <p><strong>Receita estimada:</strong> R$ {{ receitaEstimada.toFixed(2) }}</p>
          <p><strong>Custo estimado:</strong> R$ {{ custoEstimado.toFixed(2) }}</p>
          <p><strong>Lucro estimado:</strong> <strong>R$ {{ lucroEstimada.toFixed(2) }}</strong></p>
        </div>

        <button
          class="btn btn-success w-100"
          @click="registrarVenda"
          :disabled="!precoArroba || precoArroba <= 0"
        >
          ✅ Registrar Venda
        </button>
      </div>
    </div>

    <!-- Mensagem -->
    <div v-if="mensagem" class="alert alert-success text-center">
      {{ mensagem }}
    </div>

    <!-- Histórico de vendas -->
    <div class="mt-5">
      <h4 class="fw-bold text-center mb-3">📜 Histórico de Vendas</h4>
      <div v-if="historicoVendas.length === 0" class="text-muted text-center">
        Nenhuma venda registrada ainda.
      </div>
      <div v-else class="table-responsive">
        <table class="table table-bordered table-striped table-sm">
          <thead class="table-dark text-center">
            <tr>
              <th>Data</th>
              <th>Lote</th>
              <th>Quantidade</th>
              <th>Receita (R$)</th>
              <th>Custo (R$)</th>
              <th>Lucro (R$)</th>
            </tr>
          </thead>
          <tbody class="text-center">
            <tr v-for="venda in historicoVendas" :key="venda.id">
              <td>{{ formatarData(venda.dataVenda) }}</td>
              <td>{{ venda.lote }}</td>
              <td>{{ venda.quantidade }}</td>
              <td>R$ {{ (venda.receita ?? 0).toFixed(2) }}</td>
              <td>R$ {{ (venda.custo ?? 0).toFixed(2) }}</td>
              <td>R$ {{ (venda.lucro ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore'
import { app } from '@/firebase/firebase'

export default {
  name: 'RegistrarVenda',
  setup() {
    const db = getFirestore(app)
    const lotes = ref([])
    const loteSelecionadoId = ref('')
    const precoArroba = ref(null)
    const mensagem = ref('')
    const historicoVendas = ref([])

    const carregarLotes = async () => {
      const snapshot = await getDocs(collection(db, 'ConfinamentoGado'))
      lotes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }

    const carregarHistorico = async () => {
      const q = query(collection(db, 'VendasGado'), orderBy('dataVenda', 'desc'))
      const snapshot = await getDocs(q)
      historicoVendas.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }

    const lotesElegiveis = computed(() =>
      lotes.value.filter(l => l.Dias_Confinamento >= 90)
    )

    const loteSelecionado = computed(() =>
      lotes.value.find(l => l.id === loteSelecionadoId.value)
    )

    const receitaEstimada = computed(() => {
      if (!loteSelecionado.value || !precoArroba.value || precoArroba.value <= 0) return 0
      const pesoTotal = loteSelecionado.value.Peso_Hoje * loteSelecionado.value.Quantidade
      const arrobas = pesoTotal / 15
      return arrobas * precoArroba.value
    })

    const custoEstimado = computed(() => {
      if (!loteSelecionado.value) return 0
      return loteSelecionado.value.Quantidade * loteSelecionado.value.Dias_Confinamento * 17
    })

    const lucroEstimada = computed(() => receitaEstimada.value - custoEstimado.value)

    const formatarData = (dataStr) => {
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-BR')
    }

    const registrarVenda = async () => {
      if (!loteSelecionado.value || !precoArroba.value || precoArroba.value <= 0) {
        alert('Preencha corretamente o preço da arroba.')
        return
      }

      const venda = {
        lote: loteSelecionado.value.Lote,
        curral: loteSelecionado.value.Curral,
        quantidade: loteSelecionado.value.Quantidade,
        pesoHoje: loteSelecionado.value.Peso_Hoje,
        diasConfinamento: loteSelecionado.value.Dias_Confinamento,
        precoArroba: precoArroba.value,
        receita: receitaEstimada.value,
        custo: custoEstimado.value,
        lucro: lucroEstimada.value,
        dataVenda: new Date().toISOString()
      }

      await addDoc(collection(db, 'VendasGado'), venda)
      await deleteDoc(doc(db, 'ConfinamentoGado', loteSelecionado.value.id))

      mensagem.value = '✅ Venda registrada com sucesso e lote removido do confinamento.'
      loteSelecionadoId.value = ''
      precoArroba.value = null
      await carregarLotes()
      await carregarHistorico()

      setTimeout(() => (mensagem.value = ''), 5000)
    }

    onMounted(() => {
      carregarLotes()
      carregarHistorico()
    })

    return {
      lotesElegiveis,
      loteSelecionadoId,
      loteSelecionado,
      precoArroba,
      receitaEstimada,
      custoEstimado,
      lucroEstimada,
      registrarVenda,
      mensagem,
      historicoVendas,
      formatarData
    }
  }
}
</script>

<style scoped>
select,
input {
  border-radius: 8px;
}
.btn {
  font-weight: bold;
}
.alert-info p {
  margin: 0;
}
.table {
  background-color: white;
  border-radius: 8px;
  margin-top: 20px;
  overflow: hidden;
}
th,
td {
  vertical-align: middle;
  text-align: center;
}
</style>
