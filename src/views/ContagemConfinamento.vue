<template>
    <div class="container mt-5">
      <h2 class="text-center mb-4">Contagem de Bovinos - Confinamento</h2>
  
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Identificação</th>
            <th>Raça</th>
            <th>Sexo</th>
            <th>Localização</th>
            <th>Origem</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in contagemAgrupada" :key="index">
            <td>{{ item.Identificacao }}</td>
            <td>{{ item.Raca }}</td>
            <td>{{ item.Sexo }}</td>
            <td>{{ item.Localizacao }}</td>
            <td>{{ item.Origem }}</td>
            <td>{{ item.Quantidade }}</td>
          </tr>
        </tbody>
      </table>
  
      <div class="text-end fw-bold mt-3">
        Total de Bovinos: {{ totalBovinos }}
      </div>
    </div>
  </template>
  
  <script>
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { app } from '@/firebase/firebase';
  
  export default {
    name: 'ContagemConfinamento',
    data() {
      return {
        confinamentoData: [],
      };
    },
    computed: {
      contagemAgrupada() {
        const grupo = {};
        this.confinamentoData.forEach((item) => {
          const id = item.Identificacao;
          if (!grupo[id]) {
            grupo[id] = { ...item, Quantidade: parseInt(item.Quantidade) || 0 };
          } else {
            grupo[id].Quantidade += parseInt(item.Quantidade) || 0;
          }
        });
        return Object.values(grupo);
      },
      totalBovinos() {
        return this.confinamentoData.reduce((total, item) => total + (parseInt(item.Quantidade) || 0), 0);
      },
    },
    methods: {
      async fetchData() {
        const db = getFirestore(app);
        const confinamentoRef = collection(db, 'confinamento');
        const snapshot = await getDocs(confinamentoRef);
        this.confinamentoData = snapshot.docs.map((doc) => doc.data());
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1000px;
  }
  </style>
  