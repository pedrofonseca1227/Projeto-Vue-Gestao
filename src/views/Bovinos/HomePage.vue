<template>
  <div class="container mt-5">
    <!-- Título e Data -->
    <div class="text-center mb-4">
      <h1 class="fw-bold">Sistema de Gestão de Gado</h1>
      <p class="text-muted">{{ dataAtualFormatada }}</p>
    </div>

    <!-- Mensagem de boas-vindas -->
    <div class="alert alert-success text-center">
      Bem-vindo! Utilize os atalhos abaixo para gerenciar os animais da fazenda com mais agilidade.
    </div>

    <!-- Cartões de Acesso Rápido -->
    <div class="row text-center mb-5">
      <div class="col-md-4 col-12 mb-3">
        <router-link to="/contagemPasto" class="card-link">
          <div class="card atalho shadow-sm">
            <div class="card-body">
              <h5 class="card-title">📋 Contagem no Pasto</h5>
              <p class="card-text">Visualize os bovinos atualmente no pasto.</p>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-md-4 col-12 mb-3">
        <router-link to="/add-pasto" class="card-link">
          <div class="card atalho shadow-sm">
            <div class="card-body">
              <h5 class="card-title">➕ Adicionar Animal</h5>
              <p class="card-text">Cadastrar novo animal no sistema.</p>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-md-4 col-12 mb-3">
        <router-link to="/relatoriosanaliticos" class="card-link">
          <div class="card atalho shadow-sm">
            <div class="card-body">
              <h5 class="card-title">📋 Relatórios</h5>
              <p class="card-text">Visualizar análises</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Resumo da Contagem -->
    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h4 class="mb-4">📊 Resumo Pasto</h4>
        <p>
          Vacas: <strong>{{ resumo.vacas }}</strong> |
          Vacas S/B: <strong>{{ resumo.vacasSN }}</strong> |
          Touros: <strong>{{ resumo.touros }}</strong> |
          Bezerros Machos: <strong>{{ resumo.bezerrosMacho }}</strong> |
          Bezerros Fêmeas: <strong>{{ resumo.bezerrosFemea }}</strong> |
          Bezerros Desmama: <strong>{{ resumo.bezerrosDesmama }}</strong> |
        </p>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h4 class="mb-4">📊 Resumo Confinamento</h4>
        <p>
          Vacas/Fêmeas: <strong>{{ resumoConfinamento.femeas }}</strong> | 
          Bois/Machos: <strong>{{ resumoConfinamento.machos }}</strong> | 
          Total: <strong>{{ totalAnimais }}</strong>
        </p>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h4 class="mb-4">📊 Resumo Geral</h4>
        <p>
            Total Pasto: <strong>{{ totalBovinos }}</strong>
            Total Confinamento: <strong>{{ totalAnimaisConfinamento }}</strong>
            Total Geral: <strong>{{ totalBovinos + totalAnimaisConfinamento }}</strong>
        </p>
      </div>
    </div>

    <!-- Últimos Animais Cadastrados -->
    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="mb-3 text-center">🆕 Últimos Animais Cadastrados Pasto</h4>
        <div class="table-responsive">
          <table class="table table-bordered table-sm text-center align-middle">
            <thead class="table-light">
              <tr>
                <th>Nome</th>
                <th>Sexo</th>
                <th>Raça</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(animal, index) in ultimosAnimais" :key="index">
                <td>{{ animal.nome || '-' }}</td>
                <td>{{ animal.sexo || '-' }}</td>
                <td>{{ animal.raca || '-' }}</td>
                <td>{{ animal.origem || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref, computed } from 'vue'; // Importe onUnmounted
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import jsPDF from 'jspdf';
import logoImage from '@/assets/LogoPdf.jpg';

export default {
    setup() {
        const bovinos = ref([]); // Dados do Pasto (Coleção GadoPasto)
        const lotesConfinamento = ref([]); // Dados do Confinamento (Coleção LotesConfinamento)
        
        let unsubscribePasto = null;
        let unsubscribeConfinamento = null;

        onMounted(() => {
            // 1. Carregar Gado do Pasto (GadoPasto)
            const pastoRef = collection(db, "GadoPasto");
            unsubscribePasto = onSnapshot(pastoRef, (snapshot) => {
                bovinos.value = snapshot.docs.map(doc => doc.data());
            });

            // 2. Carregar Lotes de Confinamento (LotesConfinamento)
            const confinamentoRef = collection(db, "LotesConfinamento");
            unsubscribeConfinamento = onSnapshot(confinamentoRef, (snapshot) => {
                lotesConfinamento.value = snapshot.docs.map(doc => doc.data());
            });
        });

        // NOVO: Adicione onUnmounted para limpar as escutas do Firebase
        onUnmounted(() => {
            if (unsubscribePasto) {
                unsubscribePasto();
            }
            if (unsubscribeConfinamento) {
                unsubscribeConfinamento();
            }
        });

        // Computed para o resumo do Pasto (Lógica inalterada)
        const resumo = computed(() => {
            let vacas = 0,
                vacasSN = 0,
                touros = 0,
                bezerrosMacho = 0,
                bezerrosFemea = 0,
                bezerrosDesmama = 0;

            bovinos.value.forEach((b) => {
                const nome = b.nome?.toLowerCase() || '';
                const sexo = b.sexo?.trim().toLowerCase();

                if (nome.includes('vaca') && !nome.includes('s/b')) vacas++;
                else if (nome.includes('vaca') && nome.includes('s/b')) vacasSN++;
                else if (nome.includes('touro')) touros++;
                else if (nome.includes('bezerro') && sexo === 'fêmea') bezerrosFemea++;

                if (nome.includes('bezerro') && sexo === 'macho') {
                    if (nome.includes('desmama')) bezerrosDesmama++;
                    else bezerrosMacho++;
                }
            });

            return { vacas, vacasSN, touros, bezerrosMacho, bezerrosFemea, bezerrosDesmama };
        });

        // Computed para o Total de Animais no Pasto
        const totalBovinos = computed(() => bovinos.value.length);

        // Resumo de Categoria (MACHO/FEMEA) para o Confinamento (Lógica inalterada)
        const resumoConfinamento = computed(() => {
            let machos = 0;
            let femeas = 0;

            lotesConfinamento.value.forEach(lote => {
                const categoria = lote.categoria?.trim().toUpperCase();
                const quantidade = lote.quantidade || 0; 
                
                if (categoria === 'MACHO') {
                    machos += quantidade;
                } else if (categoria === 'FEMEA') {
                    femeas += quantidade;
                }
            });

            return { machos, femeas };
        });

        // Computed para o Total de Animais no Confinamento (Lógica inalterada)
        const totalAnimaisConfinamento = computed(() =>
            lotesConfinamento.value.reduce((sum, lote) => sum + (lote.quantidade || 0), 0)
        );


        const dataAtualFormatada = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Lógica de exportação para PDF (mantida)
        const exportToPDF = () => {
            const doc = new jsPDF();
            const marginLeft = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const centerX = pageWidth / 2;

            const img = new Image();
            img.src = logoImage;

            doc.addImage(img, 'JPEG', marginLeft, 10, 30, 30);
            doc.setFontSize(20);
            doc.setTextColor(33, 37, 41);
            doc.text('Relatório de Contagem de Bovinos Pasto', centerX, 45, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Resumo geral da contagem de bovinos cadastrados no sistema.', marginLeft, 60, { maxWidth: 170 });

            doc.setLineWidth(0.5);
            doc.line(marginLeft, 70, pageWidth - marginLeft, 70);

            let y = 80;
            const r = resumo.value;

            doc.setFontSize(14);
            doc.setTextColor(33, 37, 41);
            doc.text('Resumo de Contagem', marginLeft, y); y += 10;

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`• Vacas: ${r.vacas}`, marginLeft, y); y += 10;
            doc.text(`• Vacas S/B: ${r.vacasSN}`, marginLeft, y); y += 10;
            doc.text(`• Touros: ${r.touros}`, marginLeft, y); y += 10;
            doc.text(`• Bezerros Macho: ${r.bezerrosMacho}`, marginLeft, y); y += 10;
            doc.text(`• Bezerros Fêmea: ${r.bezerrosFemea}`, marginLeft, y); y += 10;
            doc.text(`• Bezerros Desmama: ${r.bezerrosDesmama}`, marginLeft, y); y += 10;
            doc.text(`• Total: ${totalBovinos.value}`, marginLeft, y); y += 20;

            doc.save('Resumo_Home.pdf');
        };

        const ultimosAnimais = computed(() => {
            return [...bovinos.value]
                .sort((a, b) => {
                    const dataA = new Date(a.createdAt?.seconds * 1000 || 0);
                    const dataB = new Date(b.createdAt?.seconds * 1000 || 0);
                    return dataB - dataA;
                })
                .slice(0, 5);
        });

        // Retorna todas as variáveis necessárias
        return {
            resumo,
            resumoConfinamento, // Variável correta para o resumo do confinamento
            totalBovinos,
            totalAnimais: totalAnimaisConfinamento, 
            totalAnimaisConfinamento,
            exportToPDF,
            dataAtualFormatada,
            ultimosAnimais
        };
    }
};
</script>

<style scoped>
.card.atalho {
  transition: 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}
.card.atalho:hover {
  background-color: #f8f9fa;
  transform: translateY(-4px);
}
.card-title {
  font-weight: bold;
  font-size: 1.2rem;
}
.card-text {
  font-size: 0.95rem;
}
.table td,
.table th {
  vertical-align: middle;
}
@media (max-width: 768px) {
  .card-title {
    font-size: 1rem;
  }
  .card-text {
    font-size: 0.85rem;
  }
  h1 {
    font-size: 1.5rem;
  }
  .container {
    padding: 0 1rem;
  }
}
</style>

