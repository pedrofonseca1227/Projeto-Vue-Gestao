<template>
    <div class="container mt-5">
        <h2 class="text-center fw-bold mb-4">📦 Registrar Venda de Lote</h2>
        <div class="card p-4 shadow-sm mb-5">
            <div
                v-for="(vendaLote, index) in lotesParaVenda"
                :key="index"
                class="row g-3 mb-3 border p-3 rounded"
            >
                <div class="col-md-4">
                    <label class="form-label">Lote Selecionado</label>
                    <select v-model="vendaLote.docId" class="form-select" required>
                        <option disabled value="">Escolha um lote</option>
                        <option v-for="l in lotesElegiveis" :key="l.docId" :value="l.docId">
                            {{ l.id }} - {{ l.quantidade }} cabeças
                        </option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label class="form-label">Quantidade a Vender</label>
                    <input
                        v-model.number="vendaLote.quantidadeVendida"
                        type="number"
                        class="form-control"
                        min="1"
                        :max="getQuantidadeOriginal(vendaLote.docId)"
                        required
                    />
                </div>

                <div class="col-md-3">
                    <label class="form-label">Peso Final Total (kg)</label>
                    <input
                        v-model.number="vendaLote.pesoFinalTotal"
                        type="number"
                        step="0.01"
                        class="form-control"
                        required
                    />
                </div>

                <div class="col-md-2 d-flex align-items-end">
                    <label class="form-label visually-hidden"
                        >Rendimento de Carcaça (%)</label
                    >
                    <div class="input-group">
                        <select
                            v-model.number="vendaLote.rendimentoCarcaça"
                            class="form-select"
                            required
                        >
                            <option disabled value="">Rendimento (%)</option>
                            <option :value="55">55%</option>
                            <option :value="56">56%</option>
                        </select>
                    </div>
                </div>

                <div class="col-md-1 d-flex align-items-end">
                    <button
                        @click="removerLote(index)"
                        class="btn btn-danger btn-sm w-100"
                    >
                        -
                    </button>
                </div>
            </div>

            <div class="d-grid gap-2 mb-3">
                <button @click="adicionarLote" class="btn btn-outline-primary">
                    + Adicionar outro Lote
                </button>
            </div>

            <div class="mb-3">
                <label class="form-label">Selecione o ciclo de gastos</label>
                <select v-model="cicloSelecionadoId" class="form-select" required>
                    <option disabled value="">Escolha um ciclo</option>
                    <option v-for="ciclo in ciclos" :key="ciclo.id" :value="ciclo.id">
                        {{ formatarData(ciclo.inicio) }} a
                        {{ formatarData(ciclo.fim) }} - R$ {{ ciclo.total.toFixed(2) }}
                    </option>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Preço acordado da arroba (R$)</label>
                <input
                    v-model.number="precoArroba"
                    type="number"
                    step="0.01"
                    class="form-control"
                    required
                />
            </div>

            <div class="alert alert-info">
                <p>
                    <strong>Receita Total Estimada:</strong> R$
                    {{ receitaEstimada.toFixed(2) }}
                </p>
                <p>
                    <strong>Custo Total Estimado:</strong> R$
                    {{ custoEstimado.toFixed(2) }}
                </p>
                <p>
                    <strong>Lucro Total Estimado:</strong> R$
                    {{ lucroEstimado.toFixed(2) }}
                </p>
            </div>

            <button class="btn btn-success w-100" @click="registrarVenda">
                ✅ Registrar Venda
            </button>
        </div>

        <div v-if="mensagem" class="alert alert-success text-center">
            {{ mensagem }}
        </div>

        <div class="mt-5">
            <h5 class="fw-bold mb-3 text-center">📄 Histórico de Vendas</h5>
            <table class="table table-bordered" v-if="historico.length">
                <thead class="table-dark">
                    <tr>
                        <th>Data</th>
                        <th>Qtde Total</th>
                        <th>Receita</th>
                        <th>Custo</th>
                        <th>Lucro</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="v in historico" 
                        :key="v.id" 
                        @click="abrirDetalhes(v)" 
                        class="cursor-pointer"
                    >
                        <td>{{ formatarData(v.dataVenda) }}</td>
                        <td>{{ v.quantidade }}</td>
                        <td>R$ {{ v.receita.toFixed(2) }}</td>
                        <td>R$ {{ v.custo.toFixed(2) }}</td>
                        <td>R$ {{ v.lucro.toFixed(2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div 
            class="modal fade" 
            id="detalheVendaModal" 
            tabindex="-1" 
            aria-labelledby="detalheVendaLabel" 
            aria-hidden="true"
            :class="{ 'd-block show': vendaSelecionada }" 
            v-if="vendaSelecionada"
        >
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="detalheVendaLabel">
                            Detalhes da Venda - {{ formatarData(vendaSelecionada.dataVenda) }}
                        </h5>
                        <button 
                            type="button" 
                            class="btn-close" 
                            @click="fecharDetalhes" 
                            aria-label="Close"
                        ></button>
                    </div>
                    
                    <div class="modal-body">
                        <h6>Resumo Financeiro da Transação</h6>
                        <p><strong>Receita Total:</strong> R$ {{ vendaSelecionada.receita.toFixed(2) }}</p>
                        <p><strong>Custo Total:</strong> R$ {{ vendaSelecionada.custo.toFixed(2) }}</p>
                        <p><strong>Lucro Total:</strong> R$ {{ vendaSelecionada.lucro.toFixed(2) }}</p>

                        <h6 class="mt-4">Lotes Vendidos Individualmente</h6>
                        <table class="table table-sm table-striped">
                            <thead class="table-info">
                                <tr>
                                    <th>ID Lote</th>
                                    <th>Qtde Vendida</th>
                                    <th>Receita (R$)</th>
                                    <th>Custo (R$)</th>
                                    <th>Lucro (R$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(detalhe, i) in vendaSelecionada.detalhes" :key="i">
                                    <td>{{ detalhe.id || 'N/A' }}</td>
                                    <td>{{ detalhe.quantidadeVendida }}</td>
                                    <td>{{ detalhe.receita.toFixed(2) }}</td>
                                    <td>{{ detalhe.custo.toFixed(2) }}</td>
                                    <td>{{ detalhe.lucro.toFixed(2) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="fecharDetalhes">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="vendaSelecionada" class="modal-backdrop fade show"></div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "@/firebase/firebase";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    Timestamp,
    query,
    orderBy,
    increment,
    getDoc, 
} from "firebase/firestore";

export default {
    setup() {
        // Estado principal
        const lotesParaVenda = ref([
            {
                docId: "",
                quantidadeVendida: null,
                pesoFinalTotal: null,
                rendimentoCarcaça: null,
            },
        ]);
        const cicloSelecionadoId = ref("");
        const precoArroba = ref(null);
        const lotes = ref([]);
        const ciclos = ref([]);
        const historico = ref([]);
        const mensagem = ref(""); 

        // NOVO: Estado para o modal de detalhes
        const vendaSelecionada = ref(null);
        
        // Funções de Gerenciamento do Formulário
        const adicionarLote = () => {
            lotesParaVenda.value.push({
                docId: "",
                quantidadeVendida: null,
                pesoFinalTotal: null,
                rendimentoCarcaça: null,
            });
        };
        const removerLote = (index) => {
            if (lotesParaVenda.value.length > 1) {
                lotesParaVenda.value.splice(index, 1);
            }
        }; 

        const getQuantidadeOriginal = (loteDocId) => {
            const lote = lotes.value.find((l) => l.docId === loteDocId);
            return lote ? lote.quantidade : null;
        }; 

        // Funções de Carregamento de Dados
        const carregarLotes = async () => {
            const snap = await getDocs(collection(db, "LotesConfinamento"));
            lotes.value = snap.docs.map((doc) => {
                const data = doc.data();
                return {
                    docId: doc.id,
                    ...data,
                    diasConfinamento: calcularDiasConfinamento(data.dataEntrada),
                };
            });
        };
        const carregarCiclos = async () => {
            const snap = await getDocs(collection(db, "CiclosGastos"));
            ciclos.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        };
        const carregarHistorico = async () => {
            const q = query(
                collection(db, "RegistroVendasLotes"),
                orderBy("dataVenda", "desc")
            );
            const snap = await getDocs(q);
            historico.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }; 

        // Funções de Cálculo
        const calcularDiasConfinamento = (dataEntrada) => {
            const entrada = dataEntrada.toDate
                ? dataEntrada.toDate()
                : new Date(dataEntrada);
            const hoje = new Date();
            entrada.setHours(0, 0, 0, 0);
            hoje.setHours(0, 0, 0, 0);
            return Math.floor((hoje - entrada) / (1000 * 60 * 60 * 24));
        };

        const calcularDetalhesLote = (loteVendido) => {
            const loteOriginal = lotes.value.find(
                (l) => l.docId === loteVendido.docId
            );
            const ciclo = ciclos.value.find((c) => c.id === cicloSelecionadoId.value);
            if (
                !loteOriginal ||
                !ciclo ||
                !precoArroba.value ||
                !loteVendido.pesoFinalTotal ||
                !loteVendido.quantidadeVendida ||
                !loteVendido.rendimentoCarcaça
            )
                return null; 

            // CÁLCULO DE CUSTO
            const custoPorAnimalIndireto = ciclo.total / ciclo.totalAnimais;
            const custoPorCabecaDireto =
                loteOriginal.custoCompraGado / loteOriginal.quantidade;
            const custoPorCabecaTotal = custoPorAnimalIndireto + custoPorCabecaDireto;
            const custoLote = loteVendido.quantidadeVendida * custoPorCabecaTotal; 

            // CÁLCULO DE RECEITA
            const pesoMedioPorCabecaVendida =
                loteVendido.pesoFinalTotal / loteVendido.quantidadeVendida;
            const pesoCarcaçaPorCabeca =
                pesoMedioPorCabecaVendida * (loteVendido.rendimentoCarcaça / 100);
            const arrobasPorCabeca = pesoCarcaçaPorCabeca / 15;
            const receitaPorCabeca = arrobasPorCabeca * precoArroba.value;
            const receitaLote = receitaPorCabeca * loteVendido.quantidadeVendida;

            return {
                id: loteOriginal.id, // Usa o ID amigável do lote
                quantidadeVendida: loteVendido.quantidadeVendida,
                receita: receitaLote,
                custo: custoLote,
                lucro: receitaLote - custoLote,
            };
        }; 

        // Computeds
        const lotesElegiveis = computed(() =>
            lotes.value.filter((l) => l.diasConfinamento >= 90)
        );
        const receitaEstimada = computed(() =>
            lotesParaVenda.value.reduce((total, lote) => {
                const detalhes = calcularDetalhesLote(lote);
                return total + (detalhes ? detalhes.receita : 0);
            }, 0)
        );
        const custoEstimado = computed(() =>
            lotesParaVenda.value.reduce((total, lote) => {
                const detalhes = calcularDetalhesLote(lote);
                return total + (detalhes ? detalhes.custo : 0);
            }, 0)
        );
        const lucroEstimado = computed(
            () => receitaEstimada.value - custoEstimado.value
        ); 

        // Funções de Utilidade
        const formatarData = (d) => {
            const data = d?.toDate?.() || new Date(d);
            return data.toLocaleDateString("pt-BR");
        }; 

        // NOVO: Funções do Modal
        const abrirDetalhes = (venda) => {
            vendaSelecionada.value = venda;
        };

        const fecharDetalhes = () => {
            vendaSelecionada.value = null;
        };
        // Fim das novas funções

        // Registrar venda
        const registrarVenda = async () => {
            // ... (A lógica de validação e registro permanece a mesma)
            if (
                !lotesParaVenda.value.every(
                    (l) =>
                        l.docId &&
                        l.quantidadeVendida > 0 &&
                        l.pesoFinalTotal > 0 &&
                        l.rendimentoCarcaça > 0
                ) ||
                !cicloSelecionadoId.value ||
                !precoArroba.value
            ) {
                alert("Por favor, preencha todos os campos corretamente.");
                return;
            }
            const detalhesVenda = lotesParaVenda.value.map((lote) =>
                calcularDetalhesLote(lote)
            ).filter(detalhe => detalhe !== null); // Remove qualquer cálculo nulo
            
            const venda = {
                quantidade: lotesParaVenda.value.reduce(
                    (total, lote) => total + (lote.quantidadeVendida || 0),
                    0
                ),
                receita: receitaEstimada.value,
                custo: custoEstimado.value,
                lucro: lucroEstimado.value,
                dataVenda: Timestamp.now(),
                detalhes: detalhesVenda,
            };
            await addDoc(collection(db, "RegistroVendasLotes"), venda); 

            // Atualização e Deleção do Lote com incremento
            for (const loteVendido of lotesParaVenda.value) {
                try {
                    const loteRef = doc(db, "LotesConfinamento", loteVendido.docId); 
                    await updateDoc(loteRef, {
                        quantidade: increment(-loteVendido.quantidadeVendida),
                    }); 
                    const loteSnap = await getDoc(loteRef);
                    if (loteSnap.exists() && loteSnap.data().quantidade <= 0) {
                        await deleteDoc(loteRef);
                    }
                } catch (error) {
                    console.error("Erro ao atualizar lote confinado após a venda:", error);
                    mensagem.value = "❌ Venda registrada, mas houve um erro na atualização do lote. Verifique o console.";
                    return; 
                }
            }
            mensagem.value = "✅ Venda registrada com sucesso!"; 

            // Resetar o formulário
            lotesParaVenda.value = [
                {
                    docId: "",
                    quantidadeVendida: null,
                    pesoFinalTotal: null,
                    rendimentoCarcaça: null,
                },
            ];
            cicloSelecionadoId.value = "";
            precoArroba.value = null; 

            // Recarrega os dados
            setTimeout(async () => {
                await carregarLotes();
                await carregarHistorico();
            }, 50); 
            
            setTimeout(() => (mensagem.value = ""), 4000);
        };
        
        onMounted(() => {
            carregarLotes();
            carregarCiclos();
            carregarHistorico();
        });
        
        return {
            lotesParaVenda,
            cicloSelecionadoId,
            precoArroba,
            lotesElegiveis,
            ciclos,
            historico,
            receitaEstimada,
            custoEstimado,
            lucroEstimado,
            adicionarLote,
            removerLote,
            getQuantidadeOriginal,
            registrarVenda,
            formatarData,
            mensagem,
            
            // Expondo as novas refs/funções
            vendaSelecionada,
            abrirDetalhes,
            fecharDetalhes,
        };
    },
};
</script>

<style scoped>
.container {
    max-width: 900px;
}

h2,
h5 {
    color: #004080;
}

.card {
    border-radius: 12px;
    border: 1px solid #dfe3e6;
}

.form-label {
    font-weight: 600;
    color: #333;
}

.btn-success {
    font-weight: bold;
    border-radius: 8px;
    padding: 10px;
    font-size: 1rem;
}

.alert-info {
    border-radius: 10px;
    background-color: #eaf4ff;
    border: 1px solid #b3daff;
    color: #004080;
    font-size: 0.95rem;
}

.table {
    font-size: 0.9rem;
    border-radius: 10px;
    overflow: hidden;
}

.table th,
.table td {
    text-align: center;
    vertical-align: middle;
}

.table th {
    background-color: #004080;
    color: white;
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: #f8f9fa;
}

.table-bordered {
    border-radius: 8px;
}

/* NOVO CSS PARA O MODAL */
.cursor-pointer {
    cursor: pointer;
}
.modal.show {
    /* Garante que o modal simples do Bootstrap apareça corretamente */
    display: block;
    padding-right: 17px; /* Para acomodar a barra de rolagem */
    overflow-y: auto;
}
.modal-backdrop.show {
    opacity: 0.5;
}
</style>