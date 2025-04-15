<template>
    <div class="container mt-5">
      <h2 class="text-center mb-4">Contagem de Bovinos no Confinamento e Pasto</h2>
  
      <!-- Resumo da Quantidade -->
      <div class="alert alert-success text-center fs-5">
        Total de Bovinos: <strong>{{ totalBovinos }}</strong> |
        Confinamento: <strong>{{ contagemPorLocal['Confinamento'] || 0 }}</strong> |
        Pasto: <strong>{{ contagemPorLocal['Pasto'] || 0 }}</strong>
      </div>
  
      <!-- Campo de Pesquisa -->
      <div class="row mb-3">
        <div class="col-md-6 offset-md-3">
          <input
            v-model="filtro.nome"
            type="text"
            class="form-control"
            placeholder="Pesquisar por nome ou identificação"
          />
        </div>
      </div>
  
      <!-- Tabela de Bovinos -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Identificação</th>
                  <th>Raça</th>
                  <th>Sexo</th>
                  <th>Ano de Nascimento</th>
                  <th>Localização</th>
                  <th>Origem</th>
                  <th>Vacinação</th>
                  <th>Estado de Saúde</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="bovinosFiltrados.length === 0">
                  <td colspan="8" class="text-center">Nenhum bovino encontrado</td>
                </tr>
                <tr v-for="bovino in bovinosFiltrados" :key="bovino.id">
                  <td>{{ bovino.nome }}</td>
                  <td>{{ bovino.raca }}</td>
                  <td>{{ bovino.sexo }}</td>
                  <td>{{ bovino.ano_nasc }}</td>
                  <td>{{ bovino.localizacao }}</td>
                  <td>{{ bovino.origem }}</td>
                  <td>{{ bovino.vacinacao }}</td>
                  <td>{{ bovino.saude }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from '@/firebase/firebase';
  import { collection, getDocs } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        filtro: { nome: '' },
        bovinos: [],
      };
    },
    computed: {
      bovinosFiltrados() {
        const nomeFiltro = this.filtro.nome.toLowerCase();
        return this.bovinos.filter((b) =>
          b.nome.toLowerCase().includes(nomeFiltro)
        );
      },
      totalBovinos() {
        return this.bovinos.length;
      },
      contagemPorLocal() {
        return this.bovinos.reduce((acc, bovino) => {
          acc[bovino.localizacao] = (acc[bovino.localizacao] || 0) + 1;
          return acc;
        }, {});
      },
    },
    async mounted() {
      const querySnapshot = await getDocs(collection(db, 'gado'));
      this.bovinos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  };
  </script>
  
  <style scoped>
  .table th,
  .table td {
    text-align: center;
  }
  .table th {
    background-color: #f8f9fa;
    color: #495057;
  }
  .table td {
    font-size: 0.9rem;
  }
  .text-center {
    text-align: center;
  }
  .alert {
    font-weight: 500;
  }
  
  .card {
    margin-top: 20px;
    border-radius: 8px;
  }
  
  .card-body {
    padding: 30px;
  }
  
  .table {
    font-size: 0.9rem;
  }
  
  .table-responsive {
    margin-top: 20px;
  }
  </style>
  