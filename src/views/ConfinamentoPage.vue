<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-bold text-center">Cadastro de Lotes Confinados</h2>

    <!-- Formulário de novo lote -->
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
          <label class="form-label">Dias no Confinamento</label>
          <input v-model.number="form.diasConfinamento" type="number" class="form-control" required />
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

    <!-- Listagem de lotes cadastrados -->
    <div v-if="lotes.length" class="card p-3">
      <h5 class="mb-3">Lotes Ativos</h5>
      <table class="table table-bordered table-striped">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Entrada</th>
            <th>Qtde</th>
            <th>Peso Inicial</th>
            <th>GPD</th>
            <th>Dias</th>
            <th>Categoria</th>
            <th>Raça</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lote in lotes" :key="lote.id">
            <td>{{ lote.id }}</td>
            <td>{{ lote.dataEntrada }}</td>
            <td>{{ lote.quantidade }}</td>
            <td>{{ lote.pesoInicial }} kg</td>
            <td>{{ lote.gpd }}</td>
            <td>{{ lote.diasConfinamento }}</td>
            <td>{{ lote.categoria }}</td>
            <td>{{ lote.raca }}</td>
            <td>
              <span class="badge" :class="lote.diasConfinamento >= 90 ? 'bg-success' : 'bg-warning'">
                {{ lote.diasConfinamento >= 90 ? 'Pronto p/ Venda' : 'Em Confinamento' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

export default {
  setup() {
    const form = ref({
      id: '',
      quantidade: null,
      dataEntrada: '',
      pesoInicial: null,
      raca: '',
      categoria: '',
      gpd: null,
      diasConfinamento: null,
      linha: ''
    })

    const lotes = ref([])

    const carregarLotes = async () => {
      const snapshot = await getDocs(collection(db, 'LotesConfinamento'))
      lotes.value = snapshot.docs.map(doc => doc.data())
    }

    const cadastrarLote = async () => {
      await addDoc(collection(db, 'LotesConfinamento'), form.value)
      await carregarLotes()
      form.value = {
        id: '', quantidade: null, dataEntrada: '', pesoInicial: null,
        raca: '', categoria: '', gpd: null, diasConfinamento: null, linha: ''
      }
    }

    onMounted(() => {
      carregarLotes()
    })

    return { form, cadastrarLote, lotes }
  }
}
</script>

<style scoped>
.table td, .table th {
  vertical-align: middle;
  text-align: center;
}
</style>
