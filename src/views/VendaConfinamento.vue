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

    <!-- Filtros -->
    <div class="row mt-5 mb-4">
      <div class="col-md-3">
        <label for="mes" class="form-label">Mês</label>
        <select v-model="filtro.mes" class="form-select">
          <option value="">Todos</option>
          <option v-for="(mes, index) in meses" :key="index" :value="index + 1">{{ mes }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="ano" class="form-label">Ano</label>
        <input type="number" v-model="filtro.ano" class="form-control" placeholder="Ex: 2025" />
      </div>
      <div class="col-md-3 align-self-end">
        <button @click="gerarPDF" class="btn btn-danger w-100">📄 Exportar PDF</button>
      </div>
    </div>

    <!-- Tabela de vendas -->
    <div>
      <h4 class="fw-bold mb-3">📊 Relatório de Vendas Registradas</h4>
      <div v-if="vendasFiltradas.length === 0" class="text-muted">Nenhuma venda encontrada.</div>
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
          <tr v-for="venda in vendasFiltradas" :key="venda.id">
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
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

    const filtro = ref({
      mes: '',
      ano: ''
    })

    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    const carregarVendas = async () => {
      try {
        const q = query(collection(db, 'VendasGado'), orderBy('dataVenda', 'desc'))
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
        const [ano, mes, dia] = form.value.dataVenda.split('-').map(Number)
        const dataComHoraCorrigida = new Date(ano, mes - 1, dia, 12, 0, 0) // Corrige o fuso
      
        await addDoc(collection(db, 'VendasGado'), {
          ...form.value,
          dataVenda: Timestamp.fromDate(dataComHoraCorrigida),
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
      const data = dataStr?.toDate?.() || new Date(dataStr)
      return data.toLocaleDateString('pt-BR')
    }

    const vendasFiltradas = computed(() => {
      return vendas.value.filter(venda => {
        const data = venda.dataVenda?.toDate?.() || new Date(venda.dataVenda)
        const mes = data.getMonth() + 1
        const ano = data.getFullYear()

        const filtroMes = !filtro.value.mes || mes === filtro.value.mes
        const filtroAno = !filtro.value.ano || ano === Number(filtro.value.ano)

        return filtroMes && filtroAno
      })
    })

    const gerarPDF = () => {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Relatório de Vendas de Gado', 14, 20)

      const linhas = vendasFiltradas.value.map(venda => [
        formatarData(venda.dataVenda),
        venda.categoria,
        venda.quantidade,
        `R$ ${venda.precoArroba.toFixed(2)}`,
        venda.comprador
      ])

      autoTable(doc, {
        head: [['Data', 'Categoria', 'Quantidade', 'Preço Arroba', 'Comprador']],
        body: linhas,
        startY: 30
      })

      doc.save('relatorio-vendas.pdf')
    }

    onMounted(() => {
      carregarVendas()
    })

    return {
      form,
      registrarVenda,
      mensagemSucesso,
      vendas,
      formatarData,
      filtro,
      meses,
      vendasFiltradas,
      gerarPDF
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