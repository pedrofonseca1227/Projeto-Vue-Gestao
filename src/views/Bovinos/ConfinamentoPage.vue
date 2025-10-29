<template>
    <div class="container mt-5">
        <h2 class="mb-4 fw-bold text-center text-primary">Cadastro de Lotes Confinados -- 06/2025</h2>

        <h4 class="text-primary border-bottom pb-2 mb-3">📋 Novo Lote</h4>
        <form @submit.prevent="cadastrarLote" class="card p-4 shadow-sm mb-4">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">ID do Lote</label>
                    <input v-model="form.id" class="form-control" required />
                </div>
                <div class="col-md-4">
                    <label class="form-label">Linha (opcional)</label>
                    <input v-model="form.linha" class="form-control" />
                </div>

                <div class="col-md-4">
                    <label class="form-label">Quantidade de Animais</label>
                    <input v-model.number="form.quantidade" type="number" class="form-control" min="1" required />
                </div>
                <div class="col-md-4">
                    <label class="form-label">Custo de Compra do Lote (R$)</label>
                    <input v-model.number="form.custoCompraGado" type="number" step="0.01" class="form-control" required />
                </div>
                <div class="col-md-4">
                    <label class="form-label">Data de Entrada</label>
                    <input v-model="form.dataEntrada" type="date" class="form-control" required />
                </div>
                <div class="col-md-4">
                    <label class="form-label">Peso Inicial (kg)</label>
                    <input v-model.number="form.pesoInicial" type="number" step="0.1" class="form-control" required />
                </div>
                <div class="col-md-4">
                    <label class="form-label">Raça</label>
                    <input v-model="form.raca" class="form-control" required />
                </div>
                <div class="col-md-4">
                    <label class="form-label">Categoria</label>
                    <input v-model="form.categoria" class="form-control" required />
                </div>
                <div class="col-md-4">
                    <label class="form-label">GPD (kg/dia)</label>
                    <input v-model.number="form.gpd" type="number" step="0.01" class="form-control" required />
                </div>
            </div>
            <div class="d-grid mt-4">
                <button class="btn btn-success">Cadastrar Lote</button>
            </div>
        </form>

        <div v-if="mensagem" class="alert text-center mt-3" :class="mensagem.startsWith('✅') ? 'alert-success' : 'alert-danger'">
            {{ mensagem }}
        </div>

        <div class="row mb-4" v-if="lotes.length">
            <div class="col-md-3">
                <div class="card text-center shadow-sm p-3">
                    <h6 class="text-muted">🐂 Total de Lotes</h6>
                    <h3 class="fw-bold text-primary">{{ lotes.length }}</h3>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card text-center shadow-sm p-3">
                    <h6 class="text-muted">👥 Total de Animais</h6>
                    <h3 class="fw-bold text-success">{{ totalAnimais }}</h3>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card text-center shadow-sm p-3">
                    <h6 class="text-muted">⚖️ Peso Médio Final</h6>
                    <h3 class="fw-bold text-warning">{{ pesoMedioFinal.toFixed(1) }} kg</h3>
                </div>
            </div>
        </div>

        <h4 class="text-primary border-bottom pb-2 mb-3 mt-5">📦 Lotes Ativos</h4>
        <div v-if="lotes.length" class="card p-3">
            <div class="table-responsive">
                <table class="table table-bordered table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Linha</th>
                            <th>Entrada</th>
                            <th>Dias</th>
                            <th>Qtde</th>
                            <th>P. Inicial</th>
                            <th>P. Final Est.</th>
                            <th>GPD</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="lote in lotes" :key="lote.docId">
                            <td>{{ lote.id }}</td>

                            <td>
                                <input v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId" v-model="formEdicao.linha" class="form-control form-control-sm" />
                                <span v-else>{{ lote.linha }}</span>
                            </td>

                            <td>{{ formatarData(lote.dataEntrada) }}</td>
                            <td>{{ calcularDiasConfinamento(lote.dataEntrada) }}</td>

                            <td>
                                <input v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId" v-model.number="formEdicao.quantidade" type="number" class="form-control form-control-sm" />
                                <span v-else>{{ lote.quantidade }}</span>
                            </td>

                            <td>
                                <input v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId" v-model.number="formEdicao.pesoInicial" type="number" step="0.1" class="form-control form-control-sm" />
                                <span v-else>{{ lote.pesoInicial }} kg</span>
                            </td>

                            <td>{{ calcularPesoFinal(lote) }} kg</td>

                            <td>
                                <input v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId" v-model.number="formEdicao.gpd" type="number" step="0.01" class="form-control form-control-sm" />
                                <span v-else>{{ lote.gpd }}</span>
                            </td>

                            <td>
                              <span class="badge"
                                :class="ehProntoVenda(lote) ? 'bg-success' : 'bg-warning'">
                                {{ ehProntoVenda(lote) ? 'Pronto p/ Venda' : 'Em Confinamento' }}
                              </span>
                            </td>

                            <td>
                                <div v-if="loteEmEdicao && loteEmEdicao.docId === lote.docId" class="d-flex gap-1 justify-content-center">
                                    <button @click="salvarEdicao(lote.docId)" class="btn btn-primary btn-sm">💾 Salvar</button>
                                    <button @click="fecharEdicao" class="btn btn-secondary btn-sm">❌ Cancelar</button>
                                </div>
                                <div v-else class="d-flex gap-1 justify-content-center">
                                    <button @click="abrirEdicao(lote)" class="btn btn-warning btn-sm">✏️ Editar</button>
                                    <button @click="excluirLote(lote.docId)" class="btn btn-danger btn-sm">🗑️ Excluir</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'; 
import { db } from '@/firebase/firebase';
import {
    collection, getDocs, doc, deleteDoc, query, orderBy, addDoc, Timestamp, updateDoc
} from 'firebase/firestore';

export default {
    setup() {
        const lotes = ref([]);
        const mensagem = ref('');
        const loteEmEdicao = ref(null);

        // Formulário de Cadastro (Resetado após o envio)
        const formPadrao = () => ({
            id: '', 
            linha: '',
            quantidade: null,
            custoCompraGado: null,
            dataEntrada: '',
            pesoInicial: null,
            raca: '',
            categoria: '',
            gpd: null,
        });
        const form = ref(formPadrao());

        // Formulário de Edição (Temporário)
        const formEdicao = ref({});

        // Funções de formatação e cálculo
        const calcularDiasConfinamento = (dataEntrada) => {
            const entrada = dataEntrada.toDate ? dataEntrada.toDate() : new Date(dataEntrada);
            const hoje = new Date();
            entrada.setHours(0, 0, 0, 0);
            hoje.setHours(0, 0, 0, 0);
            return Math.floor((hoje - entrada) / (1000 * 60 * 60 * 24));
        };

        const calcularPesoFinal = (lote) => {
            const dias = calcularDiasConfinamento(lote.dataEntrada);
            return parseFloat((lote.pesoInicial + (dias * lote.gpd)).toFixed(1));
        };

        const formatarData = (d) => {
            const data = d?.toDate?.() || new Date(d);
            return data.toLocaleDateString('pt-BR');
        };

        // Computed Properties 
        const totalAnimais = computed(() =>
            lotes.value.reduce((sum, lote) => sum + (lote.quantidade || 0), 0)
        );

        const pesoMedioFinal = computed(() => {
            if (!lotes.value.length) return 0;
            const pesoTotal = lotes.value.reduce((sum, lote) => sum + (calcularPesoFinal(lote) * lote.quantidade), 0);
            return pesoTotal / totalAnimais.value;
        });

        // 1. Função para carregar lotes (READ)
        const carregarLotes = async () => {
            try {
                const q = query(collection(db, 'LotesConfinamento'), orderBy('linha'));
                const snapshot = await getDocs(q);

                lotes.value = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        docId: doc.id, // ID REAL do Firestore
                        ...data,
                        diasConfinamento: calcularDiasConfinamento(data.dataEntrada)
                    };
                });
            } catch (error) {
                console.error("Erro ao carregar lotes:", error);
            }
        };

        // 2. Função para cadastrar lote (CREATE)
        const cadastrarLote = async () => {
            try {
                // Converte a data string para Firestore Timestamp antes de salvar
                const loteData = {
                    ...form.value,
                    dataEntrada: Timestamp.fromDate(new Date(form.value.dataEntrada))
                };

                // Usando addDoc para adicionar o novo lote
                await addDoc(collection(db, 'LotesConfinamento'), loteData);

                mensagem.value = '✅ Lote cadastrado com sucesso!';
                form.value = formPadrao(); // Reseta o formulário
                await carregarLotes(); // Recarrega a lista
            } catch (error) {
                console.error("Erro ao cadastrar lote:", error);
                mensagem.value = '❌ Erro ao cadastrar lote.';
            }
            setTimeout(() => mensagem.value = '', 4000);
        };

        const ehProntoVenda = (lote) => {
          const dias = calcularDiasConfinamento(lote.dataEntrada);

          // Garantir comparação segura (sem depender de acentuação ou capitalização)
          const categoria = lote.categoria?.toUpperCase().trim();

          if (categoria === "FEMEA") return dias >= 60;
          if (categoria === "MACHO") return dias >= 90;

          // Caso o campo esteja vazio ou diferente, exige o prazo máximo (segurança)
          return dias >= 90;
        };

        // 3. Funções para Edição (UPDATE)
        const abrirEdicao = (lote) => {
            // Usa o docId, que é o ID real do Firestore
            loteEmEdicao.value = { ...lote };
            // Copia apenas os campos editáveis para o formEdicao
            formEdicao.value = {
                linha: lote.linha,
                quantidade: lote.quantidade,
                pesoInicial: lote.pesoInicial,
                gpd: lote.gpd,
            };
        };

        const fecharEdicao = () => {
            loteEmEdicao.value = null;
            formEdicao.value = {};
        };

        const salvarEdicao = async (loteDocId) => {
            try {
                const loteRef = doc(db, 'LotesConfinamento', loteDocId);

                // Aplica apenas os campos editáveis
                await updateDoc(loteRef, formEdicao.value);

                mensagem.value = `✅ Lote ${loteEmEdicao.value.id} atualizado com sucesso!`;

                await carregarLotes();
                fecharEdicao();

            } catch (error) {
                console.error("Erro ao salvar edição:", error);
                mensagem.value = '❌ Erro ao salvar edição do lote.';
            }
            setTimeout(() => mensagem.value = '', 4000);
        };

        // 4. Função para excluir lote (DELETE)
        const excluirLote = async (firestoreDocId) => {
            const loteExibicao = lotes.value.find(l => l.docId === firestoreDocId)?.id || firestoreDocId;

            if (confirm(`Tem certeza que deseja excluir o Lote ${loteExibicao}? Esta ação é irreversível.`)) {
                try {
                    await deleteDoc(doc(db, 'LotesConfinamento', firestoreDocId));
                    await carregarLotes();
                    mensagem.value = `🗑️ Lote ${loteExibicao} excluído com sucesso!`;
                } catch (error) {
                    console.error("ERRO CRÍTICO: Exclusão Rejeitada. Detalhes:", error);
                    mensagem.value = `❌ FALHA! O lote ${loteExibicao} não foi excluído.`;
                }
                setTimeout(() => mensagem.value = '', 4000);
            }
        };

        onMounted(() => {
            carregarLotes();
        });

        return {
            lotes,
            mensagem,
            form,
            loteEmEdicao,
            formEdicao,
            totalAnimais,
            pesoMedioFinal,
            cadastrarLote,
            formatarData,
            calcularDiasConfinamento,
            calcularPesoFinal,
            abrirEdicao,
            fecharEdicao,
            salvarEdicao,
            excluirLote,
            ehProntoVenda
        };
    }
};
</script>