<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Bovinos no Pasto</h2>

     <!-- Botões de Exportação -->
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-outline-danger	" @click="exportToPDF">
          Exportar PDF
        </button>
      </div>
      <div class="d-flex justify-content-end mb-3">
        <router-link to="/add-pasto" class="btn btn-sm btn-outline-success">
          Adicionar Animal
        </router-link>
      </div>

    <!-- Campo de Pesquisa -->
    <div class="row mb-3">d
      <div class="col-md-6 offset-md-3">  
        <input
          v-model="filtro.nome"
          type="text"
          class="form-control"
          placeholder="Pesquisar por nome ou identificação (ex: Vaca 100)"
        />
      </div>
    </div>

    <!-- Contagem por Tipo -->
    <div class="mb-3 text-center">
      <p>
        Vacas: <strong>{{ resumoContagem.vacas }}</strong> |
        Vacas S/N: <strong>{{ resumoContagem.vacasSN }}</strong> |
        Touros: <strong>{{ resumoContagem.touros }}</strong> |
        Bezerros Machos: <strong>{{ resumoContagem.bezerrosMacho }}</strong> |
        Bezerros Fêmeas: <strong>{{ resumoContagem.bezerrosFemea }}</strong> |
        Bezerros Desmama: <strong>{{ resumoContagem.bezerrosDesmama }}</strong> |
        Total: <strong>{{ totalBovinos }}</strong>
      </p>
    </div>

    <!-- Tabela Detalhada de Bovinos -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Identificação</th>
                <th>Raça</th>
                <th>Sexo</th>
                <th>Localizacao</th>
                <th>Origem</th>
                <th>Vacinação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="bovinosFiltrados.length === 0">
                <td colspan="5" class="text-center">Nenhum bovino encontrado no pasto</td>
              </tr>
              <tr v-for="(bovino, index) in bovinosFiltrados" :key="index">
                <td>{{ bovino.nome }}</td>
                <td>{{ bovino.raca }}</td>
                <td>{{ bovino.sexo }}</td>
                <td>{{ bovino.localizacao }}</td>
                <td>{{ bovino.origem }}</td>
                <td>{{ bovino.vacinacao }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import jsPDF from 'jspdf';
import logoImage from '../assets/LogoPdf.jpg'; // Importe a imagem do logo


export default {
  setup() {
    const bovinos = ref([]);
    const filtro = ref({ nome: '' });

    // Escuta em tempo real no Firebase
    onMounted(() => {
      const q = query(collection(db, "GadoPasto"), orderBy("nome"));
      onSnapshot(q, (snapshot) => {
        bovinos.value = snapshot.docs.map(doc => doc.data());
        console.log('Dados atualizados:', bovinos.value);
      });
    });

    const bovinosFiltrados = computed(() => {
      return bovinos.value.filter((b) =>
        b.nome?.toLowerCase().includes(filtro.value.nome.toLowerCase())
      );
    });

    const resumoContagem = computed(() => {
      let vacas = 0,
        vacasSN = 0,
        touros = 0,
        bezerrosMacho = 0,
        bezerrosFemea = 0,
        bezerrosDesmama = 0;

      bovinos.value.forEach((b) => {
        const nome = b.nome?.toLowerCase() || '';
        const sexo = b.sexo?.trim().toLowerCase();

        if (nome.includes('vaca') && !nome.includes('s/n')) vacas++;
        else if (nome.includes('vaca') && nome.includes('s/n')) vacasSN++;
        else if (nome.includes('touro')) touros++;
        else if (nome.includes('bezerro') && sexo === 'fêmea') bezerrosFemea++;

        if (nome.includes('bezerro') && sexo === 'macho') {
          if (nome.includes('desmama')) {
            bezerrosDesmama++;
          } else {
            bezerrosMacho++;
          }
        }
      });

      return {
        vacas,
        vacasSN,
        touros,
        bezerrosMacho,
        bezerrosFemea,
        bezerrosDesmama,
      };
    });

    const totalBovinos = computed(() => bovinos.value.length);

    const img = new Image();
    img.src = logoImage; // Caminho da imagem do logo

    const exportToPDF = () => {
      const doc = new jsPDF();

      const marginLeft = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      // Logo no canto superior esquerdo
      doc.addImage(img, 'JPEG', marginLeft, 10, 30, 30); // Logo menor

      // Título centralizado e mais abaixo
      doc.setFontSize(20);
      doc.setTextColor(33, 37, 41);
      doc.text('Relatório de Contagem de Bovinos Pasto', centerX, 45, { align: 'center' });

      // Introdução (abaixo do título)
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Este relatório apresenta o resumo da contagem de bovinos, agrupados por categorias, para fins de controle e gestão do gado.', marginLeft, 60, { maxWidth: 170 });

      // Linha de separação
      doc.setLineWidth(0.5);
      doc.line(marginLeft, 70, pageWidth - marginLeft, 70);

      let y = 80;
      const resumo = resumoContagem.value;

      // Seção de resumo
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text('Resumo de Contagem de Bovinos', marginLeft, y); y += 10;

      // Texto explicativo
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Abaixo estão os totais de bovinos categorizados de acordo com o tipo e o sexo:', marginLeft, y); y += 10;

      // Lista dos dados
      doc.text(`• Vacas: ${resumo.vacas}`, marginLeft, y); y += 10;
      doc.text(`• Vacas S/N: ${resumo.vacasSN}`, marginLeft, y); y += 10;
      doc.text(`• Touros: ${resumo.touros}`, marginLeft, y); y += 10;
      doc.text(`• Bezerros Macho: ${resumo.bezerrosMacho}`, marginLeft, y); y += 10;
      doc.text(`• Bezerros Fêmea: ${resumo.bezerrosFemea}`, marginLeft, y); y += 10;
      doc.text(`• Bezerros Desmama: ${resumo.bezerrosDesmama}`, marginLeft, y); y += 10;
      doc.text(`• Total: ${totalBovinos.value}`, marginLeft, y); y += 10;
      // Linha de separação
      doc.setLineWidth(0.5);
      doc.line(marginLeft, y, pageWidth - marginLeft, y); y += 10;

      // Considerações finais
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(
        'O resumo acima mostra a quantidade de bovinos em diferentes categorias e sexos. Estes dados são essenciais para o acompanhamento da criação e controle do rebanho.',
        marginLeft,
        y,
        { maxWidth: 170 }
      ); y += 20;

      doc.setTextColor(100, 100, 100);
      doc.text('Este relatório foi gerado automaticamente para fins de controle e acompanhamento do gado no pasto.', marginLeft, y, { maxWidth: 170 });

      // Salvar
      doc.save('Resumo_GadoPasto.pdf');
    };

    return {
      bovinos,
      filtro,
      bovinosFiltrados,
      resumoContagem,
      totalBovinos,
      exportToPDF,
    };
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
