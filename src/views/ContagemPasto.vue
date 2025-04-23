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
          placeholder="Pesquisar por identificação (ex: Bezerro)"
        />
      </div>
    </div>

    <!-- Tabela de Bovinos Agrupados -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Identificação</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="bovinosAgrupadosFiltrados.length === 0">
                <td colspan="2" class="text-center">Nenhum bovino encontrado</td>
              </tr>
              <tr v-for="bovino in bovinosAgrupadosFiltrados" :key="bovino.nome">
                <td>{{ bovino.nome }}</td>
                <td>{{ bovino.quantidade }}</td>
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
    bovinosAgrupados() {
      const agrupados = {};

      this.bovinos.forEach((bovino) => {
        const nome = bovino.nome;
        if (agrupados[nome]) {
          agrupados[nome]++;
        } else {
          agrupados[nome] = 1;
        }
      });

      return Object.entries(agrupados).map(([nome, quantidade]) => ({
        nome,
        quantidade,
      }));
    },

    bovinosAgrupadosFiltrados() {
      const filtro = this.filtro.nome.toLowerCase();
      return this.bovinosAgrupados.filter((b) =>
        b.nome.toLowerCase().includes(filtro)
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
    this.bovinos = querySnapshot.docs.map((doc) => ({
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
