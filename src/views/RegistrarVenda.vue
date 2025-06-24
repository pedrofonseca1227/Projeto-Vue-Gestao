<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-bold text-center">Finalizar Lotes e Calcular Lucro</h2>

    <!-- Seleção do lote pronto para venda -->
    <div class="mb-4">
      <label class="form-label">Selecione um lote (>= 90 dias)</label>
      <select v-model="loteSelecionadoId" class="form-select">
        <option disabled value="">-- Escolha o lote --</option>
        <option v-for="lote in lotesProntos" :key="lote.id" :value="lote.id">
          {{ lote.id }} - {{ lote.quantidade }} animais
        </option>
      </select>
    </div>

    <!-- Formulário de gastos e peso final -->
    <form v-if="loteSelecionado" @submit.prevent class="card p-4 shadow-sm">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Peso Final Estimado (kg)</label>
          <input v-model.number="form.pesoFinal" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Preço da Arroba (R$)</label>
          <input v-model.number="form.precoArroba" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Custo com Ração (R$)</label>
          <input v-model.number="form.racao" type="number" class="form-control" required />
        </div>

        <div class="col-md-4">
          <label class="form-label">Custo de Compra (R$)</label>
          <input v-model.number="form.compra" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Funcionários (R$)</label>
          <input v-model.number="form.funcionarios" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Diesel (R$)</label>
          <input v-model.number="form.diesel" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Energia (R$)</label>
          <input v-model.number="form.energia" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Água (R$)</label>
          <input v-model.number="form.agua" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Manutenção (R$)</label>
          <input v-model.number="form.manutencao" type="number" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Frete (R$)</label>
          <input v-model.number="form.frete" type="number" class="form-control" required />
        </div>
      </div>
    </form>

    <!-- Resultado -->
    <div v-if="loteSelecionado" class="card mt-4 p-4">
      <h5 class="mb-3">Resultado Financeiro</h5>
      <p><strong>Arrobas por animal:</strong> {{ arrobasPorAnimal.toFixed(2) }}</p>
      <p><strong>Receita por animal:</strong> R$ {{ receitaPorAnimal.toFixed(2) }}</p>
      <p><strong>Custo total por animal:</strong> R$ {{ custoPorAnimal.toFixed(2) }}</p>
      <p><strong>Lucro por animal:</strong> R$ {{ lucroPorAnimal.toFixed(2) }}</p>
      <p><strong>Lucro total do lote:</strong> R$ {{ lucroTotalLote.toFixed(2) }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default {
  setup() {
    const loteSelecionadoId = ref('')
    const lotes = ref([])

    const form = ref({
      pesoFinal: null,
      precoArroba: null,
      racao: null,
      compra: null,
      funcionarios: null,
      diesel: null,
      energia: null,
      agua: null,
      manutencao: null,
      frete: null
    })

    const carregarLotes = async () => {
      const snapshot = await getDocs(collection(db, 'LotesConfinamento'))
      lotes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    const loteSelecionado = computed(() => {
      return lotes.value.find(l => l.id === loteSelecionadoId.value)
    })

    const lotesProntos = computed(() => {
      return lotes.value.filter(l => l.diasConfinamento >= 90)
    })

    const arrobasPorAnimal = computed(() => {
      return loteSelecionado.value ? form.value.pesoFinal / 15 : 0
    })

    const receitaPorAnimal = computed(() => {
      return arrobasPorAnimal.value * form.value.precoArroba
    })

    const custoPorAnimal = computed(() => {
      const total = form.value.racao + form.value.compra + form.value.funcionarios +
        form.value.diesel + form.value.energia + form.value.agua + form.value.manutencao + form.value.frete
      return total / loteSelecionado.value.quantidade
    })

    const lucroPorAnimal = computed(() => receitaPorAnimal.value - custoPorAnimal.value)
    const lucroTotalLote = computed(() => lucroPorAnimal.value * loteSelecionado.value.quantidade)

    onMounted(() => {
      carregarLotes()
    })

    return {
      loteSelecionadoId,
      loteSelecionado,
      lotesProntos,
      form,
      arrobasPorAnimal,
      receitaPorAnimal,
      custoPorAnimal,
      lucroPorAnimal,
      lucroTotalLote
    }
  }
}
</script>

<style scoped>
label {
  font-weight: 500;
}
</style>
