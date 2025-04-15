<template>
    <div class="container mt-5">
      <h2 class="text-center mb-4">Adicionar Gado</h2>
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
                    placeholder="Nome do Gado"
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
                  <label for="ano_nasc">Ano de Nascimento</label>
                  <input
                    type="number"
                    class="form-control"
                    id="ano_nasc"
                    v-model="gado.ano_nasc"
                    placeholder="Ano de Nascimento"
                  />
                </div>
  
                <div class="form-group mb-3">
                  <label for="localizacao">Localização</label>
                  <select class="form-select" id="localizacao" v-model="gado.localizacao" required>
                    <option value="Confinamento">Confinamento</option>
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
  
                <div class="form-group mb-3">
                  <label for="saude">Estado de Saúde</label>
                  <input
                    type="text"
                    class="form-control"
                    id="saude"
                    v-model="gado.saude"
                    placeholder="Estado de Saúde"
                    required
                  />
                </div>
  
                <button type="submit" class="btn btn-primary w-100">Adicionar Gado</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from '@/firebase/firebase';
  import { collection, addDoc } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        gado: {
          nome: '',
          raca: '',
          sexo: 'Macho',
          ano_nasc: '',
          localizacao: 'Pasto',
          origem: 'Nascido na Fazenda',
          vacinacao: '',
          saude: '',
        },
      };
    },
    methods: {
      async adicionarGado() {
        try {
          const docRef = await addDoc(collection(db, 'gado'), this.gado);
          console.log('Gado adicionado com sucesso', docRef.id);
          // Resetando os campos após sucesso
          this.gado = {
            nome: '',
            raca: '',
            sexo: 'Macho',
            ano_nasc: '',
            localizacao: 'Pasto',
            origem: 'Nascido na Fazenda',
            vacinacao: '',
            saude: '',
          };
        } catch (e) {
          console.error('Erro ao adicionar gado: ', e);
        }
      },
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
  