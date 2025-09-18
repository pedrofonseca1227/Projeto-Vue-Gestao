<template>
  <div class="container mt-5">
    <h2 class="text-center fw-bold mb-4">➕ Adicionar Gado ao Confinamento</h2>

    <form @submit.prevent="adicionarRegistro" class="needs-validation" novalidate>
      <div class="row g-3">
        <div class="col-md-3">
          <label for="Lote" class="form-label">Lote</label>
          <input v-model="form.Lote" type="text" id="Lote" class="form-control" required />
        </div>

        <div class="col-md-3">
          <label for="Curral" class="form-label">Curral</label>
          <input v-model="form.Curral" type="text" id="Curral" class="form-control" required />
        </div>

        <div class="col-md-3">
          <label for="Raca" class="form-label">Raça</label>
          <input v-model="form.Raca" type="text" id="Raca" class="form-control" required />
        </div>

        <div class="col-md-3">
          <label for="Sexo" class="form-label">Sexo</label>
          <select v-model="form.Sexo" id="Sexo" class="form-select" required>
            <option value="" disabled>Selecione</option>
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </select>
        </div>

        <div class="col-md-3">
          <label for="Origem" class="form-label">Origem</label>
          <input v-model="form.Origem" type="text" id="Origem" class="form-control" required />
        </div>

        <div class="col-md-3">
          <label for="Quantidade" class="form-label">Quantidade</label>
          <input v-model.number="form.Quantidade" type="number" id="Quantidade" class="form-control" min="1" required />
        </div>

        <div class="col-md-3">
          <label for="Data_Entrada" class="form-label">Data Entrada</label>
          <input v-model="form.Data_Entrada" type="date" id="Data_Entrada" class="form-control" required />
        </div>

        <div class="col-md-3">
          <label for="Dias_Confinamento" class="form-label">Dias de Confinamento</label>
          <input v-model.number="form.Dias_Confinamento" type="number" id="Dias_Confinamento" class="form-control" min="0" required />
        </div>

        <div class="col-md-3">
          <label for="Peso_Entrada" class="form-label">Peso Entrada (kg)</label>
          <input v-model.number="form.Peso_Entrada" type="number" id="Peso_Entrada" class="form-control" min="0" step="0.1" required />
        </div>

        <div class="col-md-3">
          <label for="Peso_Previa" class="form-label">Peso Prévia (kg)</label>
          <input v-model.number="form.Peso_Previa" type="number" id="Peso_Previa" class="form-control" min="0" step="0.1" />
        </div>

        <div class="col-md-3">
          <label for="Peso_Hoje" class="form-label">Peso Hoje (kg)</label>
          <input v-model.number="form.Peso_Hoje" type="number" id="Peso_Hoje" class="form-control" min="0" step="0.1" />
        </div>

        <div class="col-md-3">
          <label for="Dieta_GPD" class="form-label">Dieta / GPD</label>
          <input v-model="form.Dieta_GPD" type="text" id="Dieta_GPD" class="form-control" />
        </div>
      </div>

      <button type="submit" class="btn btn-success mt-4">Adicionar Registro</button>
    </form>

    <div v-if="mensagem" class="alert mt-4" :class="{'alert-success': sucesso, 'alert-danger': !sucesso}">
      {{ mensagem }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { app } from '@/firebase/firebase'

export default {
  name: 'AdicionarConfinamento',
  setup() {
    const form = ref({
      Lote: '',
      Curral: '',
      Raca: '',
      Sexo: '',
      Origem: '',
      Quantidade: 1,
      Data_Entrada: '',
      Dias_Confinamento: 0,
      Peso_Entrada: 0,
      Peso_Previa: null,
      Peso_Hoje: null,
      Dieta_GPD: ''
    })

    const mensagem = ref('')
    const sucesso = ref(false)

    const adicionarRegistro = async () => {
      // Validação simples
      if (!form.value.Lote || !form.value.Curral || !form.value.Raca || !form.value.Sexo || !form.value.Origem || !form.value.Data_Entrada) {
        mensagem.value = 'Por favor, preencha todos os campos obrigatórios.'
        sucesso.value = false
        return
      }

      try {
        const db = getFirestore(app)
        await addDoc(collection(db, 'ConfinamentoGado'), { ...form.value })
        mensagem.value = 'Registro adicionado com sucesso!'
        sucesso.value = true

        // Resetar form 
        form.value = {
          Lote: '',
          Curral: '',
          Raca: '',
          Sexo: '',
          Origem: '',
          Quantidade: 1,
          Data_Entrada: '',
          Dias_Confinamento: 0,
          Peso_Entrada: 0,
          Peso_Previa: null,
          Peso_Hoje: null,
          Dieta_GPD: ''
        }
      } catch (error) {
        mensagem.value = 'Erro ao adicionar registro: ' + error.message
        sucesso.value = false
      }
    }

    return {
      form,
      mensagem,
      sucesso,
      adicionarRegistro
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
}

label {
  font-weight: 600;
  text-transform: uppercase;
}

input,
select {
  text-transform: uppercase;
}

.alert {
  font-weight: 600;
  text-align: center;
}
</style>
