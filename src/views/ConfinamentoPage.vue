<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">📋 Gado Confinamento</h2>
      <router-link to="/adicionarconfinamento" class="btn btn-success">
        ➕ Adicionar Gado
      </router-link>
    </div>

    <!-- Tabela de registros -->
    <div v-if="registros.length" class="mt-4">
      <div class="alert alert-success text-center fw-bold">
        🐂 Total no Confinamento: {{ totalGado }} cabeças
      </div>
      <h5 class="mb-3">📊 Registros Feed Manager</h5>
      <div class="table-responsive">
        <table class="table table-bordered table-striped table-sm">
          <thead class="table-dark text-center">
            <tr>
              <th>Lote</th>
              <th>Curral</th>
              <th>Raça</th>
              <th>Sexo</th>
              <th>Origem</th>
              <th>Qtd</th>
              <th>Data Entrada</th>
              <th>Dias Conf.</th>
              <th>Peso Entrada</th>
              <th>Peso Prévia</th>
              <th>Peso Hoje</th>
              <th>Dieta/GPD</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody class="text-center">
            <tr v-for="registro in registros" :key="registro.id">
              <td>{{ registro.Lote }}</td>
              <td>{{ registro.Curral }}</td>
              <td>{{ registro.Raca }}</td>
              <td>{{ registro.Sexo }}</td>
              <td>{{ registro.Origem }}</td>
              <td>{{ registro.Quantidade }}</td>
              <td>{{ registro.Data_Entrada }}</td>
              <td>{{ registro.Dias_Confinamento }}</td>
              <td>{{ registro.Peso_Entrada }}</td>
              <td>{{ registro.Peso_Previa }}</td>
              <td>{{ registro.Peso_Hoje }}</td>
              <td>{{ registro.Dieta_GPD }}</td>
              <td>
                <button @click="excluirRegistro(registro.id)" class="btn btn-danger btn-sm">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-else class="text-center text-muted mt-4">Nenhum dado encontrado na coleção.</p>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { app } from '@/firebase/firebase'

export default {
  name: 'ConfinamentoPage',
  setup() {
    const registros = ref([])

    const carregarDados = async () => {
      try {
        const db = getFirestore(app)
        const querySnapshot = await getDocs(collection(db, 'ConfinamentoGado'))
        registros.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Erro ao carregar dados do Firestore:', error)
      }
    }

    const excluirRegistro = async (id) => {
      try {
        const db = getFirestore(app)
        await deleteDoc(doc(db, 'ConfinamentoGado', id))
        registros.value = registros.value.filter(item => item.id !== id)
      } catch (error) {
        console.error('Erro ao excluir registro:', error)
      }
    }

    const totalGado = computed(() => {
      return registros.value.reduce((total, item) => {
        return total + (parseInt(item.Quantidade) || 0)
      }, 0)
    })

    onMounted(() => {
      carregarDados()
    })

    return {
      registros,
      totalGado,
      excluirRegistro
    }
  }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.9rem;
}

table th {
  background-color: #198754;
  color: white;
  padding: 12px;
  text-align: center;
  text-transform: uppercase;
}

table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  text-transform: uppercase;
}

tr:hover {
  background-color: #f1f1f1;
}

.alert {
  font-size: 1.1rem;
}

.btn-danger {
  padding: 4px 8px;
  font-size: 0.8rem;
}
</style>
