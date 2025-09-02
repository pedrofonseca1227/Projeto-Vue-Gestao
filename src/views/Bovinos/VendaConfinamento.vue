<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4 fw-bold">📄 Registrar Venda de Gado</h2>

    <!-- Formulário de registro -->
    <form @submit.prevent="registrarVenda" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label class="form-label">Quantidade vendida</label>
        <input type="number" v-model.number="form.quantidade" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Preço da arroba (R$)</label>
        <input type="number" step="0.01" v-model.number="form.precoArroba" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Categoria</label>
        <input type="text" v-model="form.categoria" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Data da venda</label>
        <input type="date" v-model="form.dataVenda" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Comprador</label>
        <input type="text" v-model="form.comprador" class="form-control" required />
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-success">Registrar Venda</button>
      </div>
    </form>

    <div v-if="mensagemSucesso" class="alert alert-success mt-4 text-center">
      {{ mensagemSucesso }}
    </div>

    <!-- Filtros -->
    <div class="row mt-5 mb-4">
      <div class="col-md-3">
        <label class="form-label">Mês</label>
        <select v-model="filtro.mes" class="form-select">
          <option value="">Todos</option>
          <option v-for="(mes, index) in meses" :key="index" :value="index + 1">{{ mes }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Ano</label>
        <input type="number" v-model="filtro.ano" class="form-control" />
      </div>
      <div class="col-md-3 align-self-end">
        <button @click="gerarPDF" class="btn btn-danger w-100">📄 Exportar PDF</button>
      </div>
    </div>

    <!-- Tabela agrupada -->
    <div>
      <h4 class="fw-bold mb-3">📊 Resumo de Vendas Confinamento</h4>
      <div v-if="vendasAgrupadas.length === 0" class="text-muted">Nenhuma venda encontrada.</div>
      <table v-else class="table table-striped table-bordered text-center align-middle">
        <thead class="table-dark">
          <tr>
            <th>Data Média</th>
            <th>Categoria</th>
            <th>Preço Arroba (R$)</th>
            <th>Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, i) in vendasAgrupadas" :key="i">
            <td>{{ v.dataMedia }}</td>
            <td>{{ v.categoria }}</td>
            <td>R$ {{ v.precoArroba.toFixed(2) }}</td>
            <td>{{ v.quantidade }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  setup() {
    const form = ref({
      quantidade: null,
      precoArroba: null,
      categoria: '',
      dataVenda: '',
      comprador: ''
    });

    const vendas = ref([]);
    const mensagemSucesso = ref('');
    const filtro = ref({ mes: '', ano: '' });

    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const carregarVendas = async () => {
      const q = query(collection(db, 'VendasGado'), orderBy('dataVenda', 'desc'));
      const snapshot = await getDocs(q);
      vendas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const registrarVenda = async () => {
      try {
        const [ano, mes, dia] = form.value.dataVenda.split('-').map(Number);
        const dataCorrigida = new Date(ano, mes - 1, dia, 12, 0, 0);

        await addDoc(collection(db, 'VendasGado'), {
          ...form.value,
          dataVenda: Timestamp.fromDate(dataCorrigida),
          createdAt: serverTimestamp()
        });

        mensagemSucesso.value = '✅ Venda registrada com sucesso!';
        form.value = { quantidade: null, precoArroba: null, categoria: '', dataVenda: '', comprador: '' };

        await carregarVendas();
        setTimeout(() => (mensagemSucesso.value = ''), 4000);
      } catch (error) {
        console.error('Erro ao registrar venda:', error);
      }
    };

    const formatarData = (data) => {
      const d = data?.toDate?.() || new Date(data);
      return d.toLocaleDateString('pt-BR');
    };

    const vendasFiltradas = computed(() => {
      return vendas.value.filter(v => {
        const d = v.dataVenda?.toDate?.() || new Date(v.dataVenda);
        const mes = d.getMonth() + 1;
        const ano = d.getFullYear();

        return (!filtro.value.mes || mes === filtro.value.mes) &&
               (!filtro.value.ano || ano === Number(filtro.value.ano));
      });
    });

    const vendasAgrupadas = computed(() => {
      const grupos = {};

      vendasFiltradas.value.forEach(venda => {
        const key = `${venda.categoria}_${venda.precoArroba}`;
        if (!grupos[key]) {
          grupos[key] = {
            categoria: venda.categoria,
            precoArroba: venda.precoArroba,
            quantidade: 0,
            datas: []
          };
        }
        grupos[key].quantidade += venda.quantidade;
        const data = venda.dataVenda?.toDate?.() || new Date(venda.dataVenda);
        grupos[key].datas.push(data);
      });

      return Object.values(grupos).map(grupo => {
        const mediaTime = grupo.datas.reduce((acc, d) => acc + d.getTime(), 0) / grupo.datas.length;
        return {
          ...grupo,
          dataMedia: new Date(mediaTime).toLocaleDateString('pt-BR')
        };
      }).sort((a, b) => b.precoArroba - a.precoArroba);
    });

    const gerarPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Resumo Agrupado de Vendas de Gado', 14, 20);

      const body = vendasAgrupadas.value.map(v => [
        v.dataMedia,
        v.categoria,
        `R$ ${v.precoArroba.toFixed(2)}`,
        v.quantidade
      ]);

      autoTable(doc, {
        head: [['Data', 'Categoria', 'Preço Arroba', 'Total Vendido']],
        body,
        startY: 30
      });

      doc.save('vendas-confin-Luizinho.pdf');
    };

    onMounted(carregarVendas);

    return {
      form,
      vendas,
      registrarVenda,
      mensagemSucesso,
      filtro,
      meses,
      formatarData,
      vendasFiltradas,
      vendasAgrupadas,
      gerarPDF
    };
  }
};
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
}
th,
td {
  vertical-align: middle;
}
</style>
