<template>
  <div class="container mt-5">
    <h2 class="fw-bold text-center mb-4">📆 Cadastro de Gastos por Ciclo</h2>

    <form @submit.prevent="registrarCiclo" class="card p-4 shadow-sm mb-4">
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Início do Ciclo</label>
          <input type="date" v-model="form.inicio" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label">Fim do Ciclo</label>
          <input type="date" v-model="form.fim" class="form-control" required />
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-4">
          <label class="form-label">Média de Animais no Ciclo</label>
          <input type="number" v-model.number="form.totalAnimais" class="form-control" required />
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-4" v-for="campo in camposGasto" :key="campo.nome">
          <label class="form-label">{{ campo.label }} (R$)</label>
          <input type="number" step="0.01" v-model.number="form[campo.nome]" class="form-control" required />
        </div>
      </div>

      <div class="mt-3">
        <label class="form-label">Observações (opcional)</label>
        <textarea v-model="form.observacoes" class="form-control" rows="2"></textarea>
      </div>

      <div class="alert alert-info mt-3">
        <strong>Média Total de Gastos:</strong> R$ {{ totalGasto.toFixed(2) }}
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-primary">💾 Registrar Ciclo</button>
      </div>
    </form>

    <div v-if="mensagem" class="alert alert-success text-center">
      {{ mensagem }}
    </div>

    <div class="card p-3 mt-4">
      <h5 class="fw-bold mb-3">📁 Ciclos Registrados</h5>
      <table class="table table-bordered table-striped" v-if="ciclos.length">
        <thead class="table-dark">
          <tr>
            <th>Início</th>
            <th>Fim</th>
            <th>Animais</th>
            <th>Total (R$)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ciclo in ciclos" :key="ciclo.id">
            <td>{{ formatarData(ciclo.inicio) }}</td>
            <td>{{ formatarData(ciclo.fim) }}</td>
            <td>{{ ciclo.totalAnimais }}</td>
            <td>R$ {{ ciclo.total.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-muted">Nenhum ciclo registrado ainda.</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase/firebase'
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  query
} from 'firebase/firestore'

export default {
  setup() {
    const form = ref({
      inicio: '',
      fim: '',
      totalAnimais: 0,
      racao: 0,
      energia: 0,
      funcionario: 0,
      diesel: 0,
      manutencao: 0,
      outros: 0,
      observacoes: ''
    })

    const camposGasto = [
      { nome: 'racao', label: 'Racão' },
      { nome: 'energia', label: 'Energia' },
      { nome: 'funcionario', label: 'Funcionário' },
      { nome: 'diesel', label: 'Diesel' },
      { nome: 'manutencao', label: 'Manutenção' },
      { nome: 'outros', label: 'Outros' }
    ]

    const totalGasto = computed(() => {
      return camposGasto.reduce((total, campo) => total + (form.value[campo.nome] || 0), 0)
    })

    const mensagem = ref('')
    const ciclos = ref([])

    const registrarCiclo = async () => {
      const dados = {
        ...form.value,
        total: totalGasto.value,
        inicio: Timestamp.fromDate(new Date(form.value.inicio)),
        fim: Timestamp.fromDate(new Date(form.value.fim)),
        createdAt: Timestamp.now()
      }

      await addDoc(collection(db, 'CiclosGastos'), dados)
      mensagem.value = '✅ Ciclo de gastos registrado com sucesso!'
      await carregarCiclos()

      form.value = {
        inicio: '', fim: '', totalAnimais: 0,
        racao: 0, energia: 0, funcionario: 0,
        diesel: 0, manutencao: 0, outros: 0,
        observacoes: ''
      }

      setTimeout(() => (mensagem.value = ''), 4000)
    }

    const carregarCiclos = async () => {
      const q = query(collection(db, 'CiclosGastos'), orderBy('inicio', 'desc'))
      const snapshot = await getDocs(q)
      ciclos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    const formatarData = (timestamp) => {
      return timestamp?.toDate().toLocaleDateString('pt-BR')
    }

    onMounted(() => carregarCiclos())

    return {
      form,
      camposGasto,
      totalGasto,
      registrarCiclo,
      mensagem,
      ciclos,
      formatarData
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

input,
textarea,
select {
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
  font-size: 1rem;
}

.alert-success {
  border-radius: 8px;
  font-weight: 500;
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