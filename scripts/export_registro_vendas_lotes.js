/**
 * Exporta RegistroVendasLotes (Firestore) para CSV (1 linha = 1 item de detalhes[])
 * Campos derivados: diasConfinamento, lucroPorCabeca, receitaPorCabeca, custoPorCabeca
 */

const admin = require("firebase-admin");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

// ======= CONFIG =======
const serviceAccount = require("../serviceAccountKey.json");
const COLLECTION_NAME = "RegistroVendasLotes";
const OUTPUT_CSV = path.resolve(__dirname, "dataset_vendas_confinamento.csv");
// ======================

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function toDateSafe(v) {
  if (!v) return null;
  // Firestore Timestamp
  if (typeof v.toDate === "function") return v.toDate();
  // ISO string or Date
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function diffDays(dateA, dateB) {
  if (!dateA || !dateB) return null;
  const a = new Date(dateA);
  const b = new Date(dateB);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

(async () => {
  try {
    const snap = await db.collection(COLLECTION_NAME).get();

    const rows = [];

    snap.forEach((doc) => {
      const venda = doc.data();

      const dataVenda = toDateSafe(venda.dataVenda);
      const cicloId = venda.cicloId ?? null;
      const precoArrobaVenda = num(venda.precoArroba);

      const detalhes = Array.isArray(venda.detalhes) ? venda.detalhes : [];

      detalhes.forEach((d, idx) => {
        const dataEntrada = toDateSafe(d.dataEntrada);
        const diasConfinamento = diffDays(dataVenda, dataEntrada);

        const quantidadeVendida = num(d.quantidadeVendida);
        const lucro = num(d.lucro);
        const receita = num(d.receita);
        const custo = num(d.custo);

        // Derivados por cabeça
        const lucroPorCabeca =
          quantidadeVendida && lucro != null ? lucro / quantidadeVendida : null;
        const receitaPorCabeca =
          quantidadeVendida && receita != null ? receita / quantidadeVendida : null;
        const custoPorCabeca =
          quantidadeVendida && custo != null ? custo / quantidadeVendida : null;

        rows.push({
          // IDs
          vendaDocId: doc.id,
          detalheIndex: idx,
          loteId: d.id ?? null,
          loteDocId: d.docId ?? null,
          cicloId,

          // Datas
          dataVenda: dataVenda ? dataVenda.toISOString().slice(0, 10) : null,
          dataEntrada: dataEntrada ? dataEntrada.toISOString().slice(0, 10) : null,
          diasConfinamento,

          // Snapshot do lote
          categoria: d.categoria ?? null,
          raca: d.raca ?? null,
          linha: d.linha ?? null,
          gpd: num(d.gpd),
          pesoInicial: num(d.pesoInicial),

          // Venda / Pesos
          quantidadeVendida,
          rendimentoCarcaca: num(d.rendimentoCarcaca),
          pesoFinalTotalKg: num(d.pesoFinalTotalKg),
          pesoMedioFinalKg: num(d.pesoMedioFinalKg),
          pesoCarcacaKgCabeca: num(d.pesoCarcacaKgCabeca),
          arrobasCabeca: num(d.arrobasCabeca),
          arrobasTotais: num(d.arrobasTotais),

          // Preço arroba (prioriza o detalhe, fallback venda)
          precoArroba: num(d.precoArroba) ?? precoArrobaVenda,

          // Financeiro
          receita,
          custo,
          lucro,
          receitaPorCabeca,
          custoPorCabeca,
          lucroPorCabeca,
        });
      });
    });

    if (!rows.length) {
      console.log("Nenhuma linha gerada. Verifique se há documentos e detalhes[] preenchidos.");
      process.exit(0);
    }

    // Cabeçalhos (colunas) do CSV
    const headers = Object.keys(rows[0]).map((k) => ({ id: k, title: k }));

    const csvWriter = createObjectCsvWriter({
      path: OUTPUT_CSV,
      header: headers,
    });

    await csvWriter.writeRecords(rows);

    console.log(`✅ Export concluído! Linhas: ${rows.length}`);
    console.log(`📄 Arquivo: ${OUTPUT_CSV}`);
  } catch (err) {
    console.error("❌ Erro ao exportar:", err);
    process.exit(1);
  }
})();
