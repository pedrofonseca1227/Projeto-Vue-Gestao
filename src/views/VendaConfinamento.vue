<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4 fw-bold">📄 Registrar Venda de Gado</h2>

    <!-- Formulário de registro -->
    <form @submit.prevent="registrarVenda" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="quantidade" class="form-label">Quantidade vendida</label>
        <input
          type="number"
          id="quantidade"
          v-model.number="form.quantidade"
          class="form-control"
          placeholder="Ex: 15"
          required
        />
      </div>

      <div class="mb-3">
        <label for="precoArroba" class="form-label">Preço da arroba (R$)</label>
        <input
          type="number"
          step="0.01"
          id="precoArroba"
          v-model.number="form.precoArroba"
          class="form-control"
          placeholder="Ex: 270.50"
          required
        />
      </div>

      <div class="mb-3">
        <label for="categoria" class="form-label">Categoria</label>
        <input
          type="text"
          id="categoria"
          v-model="form.categoria"
          class="form-control"
          placeholder="Ex: Gado de Corte"
          required />
      </div>

      <div class="mb-3">
        <label for="data" class="form-label">Data da venda</label>
        <input
          type="date"
          id="data"
          v-model="form.dataVenda"
          class="form-control"
          required
        />
      </div>

      <div class="mb-3">
        <label for="comprador" class="form-label">Comprador</label>
        <input
          type="text"
          id="comprador"
          v-model="form.comprador"
          class="form-control"
          placeholder="Ex: Agropecuária Silva"
          required
        />
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-success">Registrar Venda</button>
      </div>
    </form>

    <!-- Mensagem de sucesso -->
    <div v-if="mensagemSucesso" class="alert alert-success mt-4 text-center">
      {{ mensagemSucesso }}
    </div>

    <!-- Tabela de vendas -->
    <div class="mt-5">
      <h4 class="fw-bold mb-3">📊 Relatório de Vendas Registradas</h4>
      <div v-if="vendas.length === 0" class="text-muted">Nenhuma venda registrada ainda.</div>
      <table v-else class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Data</th>
            <th>Categoria</th>
            <th>Quantidade</th>
            <th>Preço Arroba (R$)</th>
            <th>Comprador</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venda in vendas" :key="venda.id">
            <td>{{ formatarData(venda.dataVenda) }}</td>
            <td>{{ venda.categoria }}</td>
            <td>{{ venda.quantidade }}</td>
            <td>R$ {{ venda.precoArroba.toFixed(2) }}</td>
            <td>{{ venda.comprador }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

export default {
  setup() {
    const form = ref({
      quantidade: null,
      precoArroba: null,
      categoria: '',
      dataVenda: '',
      comprador: ''
    })

    const mensagemSucesso = ref('')
    const vendas = ref([])

    const carregarVendas = async () => {
      try {
        const q = query(collection(db, 'VendasGado'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        vendas.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Erro ao carregar vendas:', error)
      }
    }

    const registrarVenda = async () => {
      try {
        await addDoc(collection(db, 'VendasGado'), {
          ...form.value,
          createdAt: serverTimestamp()
        })
        mensagemSucesso.value = '✅ Venda registrada com sucesso!'
        form.value = {
          quantidade: null,
          precoArroba: null,
          categoria: '',
          dataVenda: '',
          comprador: ''
        }
        await carregarVendas()
        setTimeout(() => (mensagemSucesso.value = ''), 4000)
      } catch (error) {
        console.error('Erro ao registrar venda:', error)
      }
    }

    const formatarData = (dataStr) => {
      const data = new Date(dataStr)
      return data.toLocaleDateString('pt-BR')
    }

    onMounted(() => {
      carregarVendas()
    })

    return {
      form,
      registrarVenda,
      mensagemSucesso,
      vendas,
      formatarData
    }
  }
}
</script>

<style scoped>
form input,
form select {
  border-radius: 8px;
}
.btn {
  font-weight: bold;
}
.table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}
th,
td {
  vertical-align: middle;
}
</style>
