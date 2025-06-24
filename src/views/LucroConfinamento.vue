<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-bold text-center">Calculadora de Lucro por Animal Confinado</h2>

    <form @submit.prevent class="card p-4 shadow-sm">
      <!-- Quantidade de Animais -->
      <div class="mb-3">
        <label class="form-label">Quantidade de Animais</label>
        <input v-model.number="form.quantidadeAnimais" type="number" class="form-control" required />
      </div>

      <!-- Rações -->
      <div class="mb-3">
        <label class="form-label">Nota Ração - Mês 1 (R$)</label>
        <input v-model.number="form.racaoMes1" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Nota Ração - Mês 2 (R$)</label>
        <input v-model.number="form.racaoMes2" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Nota Ração - Mês 3 (R$)</label>
        <input v-model.number="form.racaoMes3" type="number" step="0.01" class="form-control" required />
      </div>

      <!-- Compra dos animais -->
      <div class="mb-3">
        <label class="form-label">Custo Total Compra dos Animais (R$)</label>
        <input v-model.number="form.custoCompra" type="number" step="0.01" class="form-control" required />
      </div>

      <!-- Gastos operacionais -->
      <div class="mb-3">
        <label class="form-label">Funcionários (R$)</label>
        <input v-model.number="form.funcionarios" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Diesel (R$)</label>
        <input v-model.number="form.diesel" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Energia (R$)</label>
        <input v-model.number="form.energia" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Água (R$)</label>
        <input v-model.number="form.agua" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Manutenção (R$)</label>
        <input v-model.number="form.manutencao" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Frete (R$)</label>
        <input v-model.number="form.frete" type="number" step="0.01" class="form-control" required />
      </div>

      <!-- Venda -->
      <div class="mb-3">
        <label class="form-label">Arrobas por Animal</label>
        <input v-model.number="form.arrobasPorAnimal" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Preço da Arroba (R$)</label>
        <input v-model.number="form.precoArroba" type="number" step="0.01" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Imposto sobre Venda (%)</label>
        <input v-model.number="form.imposto" type="number" step="0.01" class="form-control" required />
      </div>
    </form>

    <!-- Resultados -->
    <div class="mt-4 card p-4">
      <h4 class="mb-3">Resultados</h4>
      <p><strong>Custo Total de Ração:</strong> R$ {{ custoTotalRacao.toFixed(2) }}</p>
      <p><strong>Custo de Ração por Animal:</strong> R$ {{ custoRacaoPorAnimal.toFixed(2) }}</p>
      <p><strong>Custo de Compra por Animal:</strong> R$ {{ custoCompraPorAnimal.toFixed(2) }}</p>
      <p><strong>Custo Operacional por Animal:</strong> R$ {{ custoOperacionalPorAnimal.toFixed(2) }}</p>
      <p><strong>Receita Bruta por Animal:</strong> R$ {{ receitaBruta.toFixed(2) }}</p>
      <p><strong>Imposto por Animal:</strong> R$ {{ impostoVenda.toFixed(2) }}</p>
      <p><strong>Receita Líquida por Animal:</strong> R$ {{ receitaLiquida.toFixed(2) }}</p>
      <p><strong>Custo Total por Animal:</strong> R$ {{ custoTotalPorAnimal.toFixed(2) }}</p>
      <p><strong>Lucro por Animal:</strong> R$ {{ lucroPorAnimal.toFixed(2) }}</p>
      <p><strong>Lucro Total do Lote:</strong> R$ {{ lucroTotalLote.toFixed(2) }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const form = ref({
      quantidadeAnimais: null,
      racaoMes1: 0,
      racaoMes2: 0,
      racaoMes3: 0,
      custoCompra: 0,
      funcionarios: 0,
      diesel: 0,
      energia: 0,
      agua: 0,
      manutencao: 0,
      frete: 0,
      arrobasPorAnimal: 0,
      precoArroba: 0,
      imposto: 0
    })

    const custoTotalRacao = computed(() => form.value.racaoMes1 + form.value.racaoMes2 + form.value.racaoMes3)
    const custoRacaoPorAnimal = computed(() => custoTotalRacao.value / form.value.quantidadeAnimais)
    const custoCompraPorAnimal = computed(() => form.value.custoCompra / form.value.quantidadeAnimais)
    const custoOperacionalTotal = computed(() => form.value.funcionarios + form.value.diesel + form.value.energia + form.value.agua + form.value.manutencao + form.value.frete)
    const custoOperacionalPorAnimal = computed(() => custoOperacionalTotal.value / form.value.quantidadeAnimais)

    const receitaBruta = computed(() => form.value.arrobasPorAnimal * form.value.precoArroba)
    const impostoVenda = computed(() => receitaBruta.value * (form.value.imposto / 100))
    const receitaLiquida = computed(() => receitaBruta.value - impostoVenda.value)

    const custoTotalPorAnimal = computed(() => custoRacaoPorAnimal.value + custoCompraPorAnimal.value + custoOperacionalPorAnimal.value)
    const lucroPorAnimal = computed(() => receitaLiquida.value - custoTotalPorAnimal.value)
    const lucroTotalLote = computed(() => lucroPorAnimal.value * form.value.quantidadeAnimais)

    return {
      form,
      custoTotalRacao,
      custoRacaoPorAnimal,
      custoCompraPorAnimal,
      custoOperacionalPorAnimal,
      receitaBruta,
      impostoVenda,
      receitaLiquida,
      custoTotalPorAnimal,
      lucroPorAnimal,
      lucroTotalLote
    }
  }
}
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #ddd;
}
.form-label {
  font-weight: 500;
}
</style>
