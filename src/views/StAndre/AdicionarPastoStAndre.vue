<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Adicionar Gado ao Pasto</h2>
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="adicionarGado">
              <div class="form-group mb-3">
                <label for="nome">Nome do Gado</label>
                <input
                  type="text"
                  class="form-control"
                  id="nome"
                  v-model="gado.nome"
                  placeholder="Identificação do animal"
                  required
                />
              </div>

              <div class="form-group mb-3">
                <label for="raca">Raça</label>
                <input
                  type="text"
                  class="form-control"
                  id="raca"
                  v-model="gado.raca"
                  placeholder="Raça do Gado"
                  required
                />
              </div>

              <div class="form-group mb-3">
                <label for="sexo">Sexo</label>
                <select class="form-select" id="sexo" v-model="gado.sexo" required>
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                </select>
              </div>

              <div class="form-group mb-3">
                <label for="localizacao">Localização</label>
                <select class="form-select" id="localizacao" v-model="gado.localizacao" required>
                  <option value="Desconhecida">Desconhecida</option>
                  <option value="Pasto">Pasto</option>
                </select>
              </div>

              <div class="form-group mb-3">
                <label for="origem">Origem</label>
                <select class="form-select" id="origem" v-model="gado.origem" required>
                  <option value="Nascido na Fazenda">Nascido na Fazenda</option>
                  <option value="Comprado">Comprado</option>
                </select>
              </div>

              <div class="form-group mb-3">
                <label for="vacinacao">Vacinação</label>
                <input
                  type="text"
                  class="form-control"
                  id="vacinacao"
                  v-model="gado.vacinacao"
                  placeholder="Vacinação"
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary w-100">Adicionar Gado</button>
              <div v-if="mensagem" class="alert alert-info">
                {{ mensagem }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default {
  data() {
    return {
      gado: {
        nome: '',
        raca: '',
        sexo: 'Macho',
        localizacao: 'Pasto',
        origem: 'Nascido na Fazenda',
        vacinacao: '',
      },
      mensagem: '',
      bovinos: [], // lista local dos bovinos cadastrados
    };
  },
  methods: {
    async adicionarGado() {
      try {
        const docRef = await addDoc(collection(db, 'GadoStAndre'), {
          nome: this.gado.nome,
          raca: this.gado.raca,
          sexo: this.gado.sexo,
          localizacao: this.gado.localizacao,
          origem: this.gado.origem,
          vacinacao: this.gado.vacinacao,
        });

        console.log('✅ Gado adicionado com ID:', docRef.id);
        this.mensagem = `Gado "${this.gado.nome}" adicionado com sucesso!`;

        // Limpa os campos do formulário
        this.gado = {
          nome: '',
          raca: '',
          sexo: 'Macho',
          localizacao: 'Pasto',
          origem: 'Nascido na Fazenda',
          vacinacao: '',
        };

        // Atualiza a lista local após adicionar
        await this.carregarGado();
      } catch (e) {
        console.error('❌ Erro ao adicionar gado:', e);
        this.mensagem = 'Erro ao adicionar o gado. Verifique o console.';
      }
    },

    async carregarGado() {
      try {
        const querySnapshot = await getDocs(collection(db, 'GadoStAndre'));
        this.bovinos = querySnapshot.docs.map(doc => doc.data());
        console.log('📦 Dados carregados:', this.bovinos);
      } catch (e) {
        console.error('❌ Erro ao carregar dados:', e);
      }
    },
  },
  mounted() {
    this.carregarGado();
  },
};
</script>


<style scoped>
.card {
  border-radius: 8px;
}

.card-body {
  padding: 30px;
}

.btn-primary {
  font-size: 16px;
}

.form-group label {
  font-weight: 600;
}

.form-group input,
.form-group select {
  font-size: 14px;
}

.form-control,
.form-select {
  border-radius: 5px;
}

.row {
  margin-top: 20px;
}
</style>
