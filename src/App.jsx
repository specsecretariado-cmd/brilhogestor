import React, { useEffect, useState } from "react";

/*
  BrilhoGestor - Inventory & Sales Manager for jewelry stores
  Single-file React component (main app)
*/

export default function App(){
  const [products, setProducts] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("bg_products"))||[] }catch{ return [] }});
  const [transactions, setTransactions] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("bg_transactions"))||[] }catch{ return [] }});
  const [clients, setClients] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("bg_clients"))||[] }catch{ return [] }});

  useEffect(()=>{ localStorage.setItem("bg_products", JSON.stringify(products)) },[products]);
  useEffect(()=>{ localStorage.setItem("bg_transactions", JSON.stringify(transactions)) },[transactions]);
  useEffect(()=>{ localStorage.setItem("bg_clients", JSON.stringify(clients)) },[clients]);

  const [tab,setTab] = useState("dashboard");

  // product form
  const [pName,setPName]=useState(""); const [pSKU,setPSKU]=useState(""); const [pCost,setPCost]=useState(0); const [pPrice,setPPrice]=useState(0); const [pStock,setPStock]=useState(0);
  function addProduct(e){ e.preventDefault(); if(!pName) return alert("Informe o nome do produto."); const id=Date.now(); setProducts(s=>[...s,{id,name:pName,sku:pSKU,cost:Number(pCost),price:Number(pPrice),stock:Number(pStock)}]); setPName(""); setPSKU(""); setPCost(0); setPPrice(0); setPStock(0); setTab("products"); }

  // clients
  const [cName,setCName]=useState(""); const [cCPF,setCCPF]=useState("");
  function addClient(e){ e.preventDefault(); if(!cName||!cCPF) return alert("Nome e CPF obrigatórios."); const cpfClean=cCPF.replace(/\D/g,""); setClients(s=>[...s,{id:Date.now(),name:cName,cpf:cpfClean}]); setCName(""); setCCPF(""); setTab("clients"); }

  // entries
  const [entryProductId,setEntryProductId]=useState(""); const [entryQty,setEntryQty]=useState(1); const [entryCostPerUnit,setEntryCostPerUnit]=useState(0);
  function addStock(e){ e.preventDefault(); const prodIdx=products.findIndex(p=>p.id===Number(entryProductId)); if(prodIdx===-1) return alert("Produto não selecionado."); const updated=[...products]; const prevStock = Number(updated[prodIdx].stock); updated[prodIdx].stock = prevStock + Number(entryQty); const oldTotalCost = (updated[prodIdx].cost||0)*prevStock; const newTotalCost = Number(entryCostPerUnit)*Number(entryQty); const newAvg = (oldTotalCost+newTotalCost)/(updated[prodIdx].stock||1); updated[prodIdx].cost = Number(newAvg.toFixed(2)); setProducts(updated); const t={id:Date.now(),type:"in",productId:Number(entryProductId),qty:Number(entryQty),unitCost:Number(entryCostPerUnit),date:new Date().toISOString()}; setTransactions(s=>[t,...s]); setEntryQty(1); setEntryCostPerUnit(0); setEntryProductId(""); setTab("transactions"); }

  // sales
  const [saleProductId,setSaleProductId]=useState("");
  const [saleSku, setSaleSku] = useState("");
  const [saleQty,setSaleQty]=useState(1); const [salePricePerUnit,setSalePricePerUnit]=useState(0); const [salePaymentMethod,setSalePaymentMethod]=useState("Dinheiro"); const [saleClientId,setSaleClientId]=useState("");

  // New logic: search product by SKU
  useEffect(() => {
    if (saleSku) {
      const foundProduct = products.find(p => p.sku === saleSku);
      if (foundProduct) {
        setSaleProductId(foundProduct.id.toString());
        setSalePricePerUnit(foundProduct.price);
      } else {
        setSaleProductId("");
        setSalePricePerUnit(0);
      }
    } else {
      setSaleProductId("");
      setSalePricePerUnit(0);
    }
  }, [saleSku, products]);

  function makeSale(e){ e.preventDefault(); const pIndex = products.findIndex(p=>p.id===Number(saleProductId)); if(pIndex===-1) return alert("Selecione um produto."); if(products[pIndex].stock < saleQty) return alert("Estoque insuficiente."); const updated=[...products]; updated[pIndex].stock = Number(updated[pIndex].stock) - Number(saleQty); setProducts(updated); const prod = products[pIndex]; const profit = (Number(salePricePerUnit) - Number(prod.cost)) * Number(saleQty); const t={id:Date.now(),type:"sale",productId:Number(saleProductId),qty:Number(saleQty),unitPrice:Number(salePricePerUnit),paymentMethod:salePaymentMethod,clientId:saleClientId?Number(saleClientId):null,profit:Number(profit.toFixed(2)),date:new Date().toISOString()}; setTransactions(s=>[t,...s]); setSaleQty(1); setSalePricePerUnit(0); setSaleProductId(""); setSaleSku(""); setSalePaymentMethod("Dinheiro"); setSaleClientId(""); setTab("transactions"); }

  const totals = transactions.reduce((acc,t)=>{ if(t.type==="sale"){ acc.totalRevenue += t.unitPrice * t.qty; acc.totalProfit += Number(t.profit||0); acc.paymentBreakdown[t.paymentMethod] = (acc.paymentBreakdown[t.paymentMethod]||0) + t.unitPrice * t.qty; } return acc; },{ totalRevenue:0, totalProfit:0, paymentBreakdown:{} });

  function downloadJSON(filename,data){ const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }
  function toCSV(arr){ if(!arr.length) return ""; const keys = Object.keys(arr[0]); const lines=[keys.join(",")]; for(const row of arr){ lines.push(keys.map(k=>`"${(row[k]??"").toString().replace(/"/g,'""')}"`).join(",")); } return lines.join("\n"); }
  function downloadCSV(filename,arr){ const csv=toCSV(arr); const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <div className="badge">BG</div>
          <div>
            <h1 style={{margin:0}}>BrilhoGestor</h1>
            <div className="small">Controle de estoque, vendas e clientes</div>
          </div>
        </div>
        <nav className="nav">
          <button className={tab==="dashboard"?"active":""} onClick={()=>setTab("dashboard")}>Visão Geral</button>
          <button className={tab==="products"?"active":""} onClick={()=>setTab("products")}>Produtos</button>
          <button className={tab==="transactions"?"active":""} onClick={()=>setTab("transactions")}>Movimentações</button>
          <button className={tab==="clients"?"active":""} onClick={()=>setTab("clients")}>Clientes</button>
        </nav>
      </header>

      {tab==="dashboard" && (
        <section>
          <div className="grid cols-3" style={{marginBottom:16}}>
            <div className="card"><div className="small">Receita total</div><div style={{fontSize:20,fontWeight:700}}>R$ {totals.totalRevenue.toFixed(2)}</div></div>
            <div className="card"><div className="small">Lucro total</div><div style={{fontSize:20,fontWeight:700}}>R$ {totals.totalProfit.toFixed(2)}</div></div>
            <div className="card"><div className="small">Produtos cadastrados</div><div style={{fontSize:20,fontWeight:700}}>{products.length}</div></div>
          </div>

          <div className="card" style={{marginBottom:12}}>
            <h3 style={{marginTop:0}}>Resumo por forma de pagamento</h3>
            {Object.entries(totals.paymentBreakdown).length===0 ? <div className="small">Nenhuma venda registrada ainda.</div> : Object.entries(totals.paymentBreakdown).map(([m,v])=> <div key={m}>{m}: R$ {v.toFixed(2)}</div>)}
          </div>

          <div className="controls" style={{marginTop:12}}>
            <button className="btn" onClick={()=>setTab("products")}>Novo produto</button>
            <button className="btn" onClick={()=>setTab("transactions")}>Registrar movimento</button>
            <button className="btn" onClick={()=>setTab("clients")}>Novo cliente</button>
          </div>
        </section>
      )}

      {tab==="products" && (
        <section>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <form className="card" onSubmit={addProduct}>
              <h3 style={{marginTop:0}}>Cadastrar produto</h3>
              <div className="form-row"><label>Nome</label><input value={pName} onChange={e=>setPName(e.target.value)} /></div>
              <div className="form-row"><label>SKU</label><input value={pSKU} onChange={e=>setPSKU(e.target.value)} /></div>
              <div className="form-row"><label>Custo unitário (R$)</label><input type="number" step="0.01" value={pCost} onChange={e=>setPCost(e.target.value)} /></div>
              <div className="form-row"><label>Preço venda (R$)</label><input type="number" step="0.01" value={pPrice} onChange={e=>setPPrice(e.target.value)} /></div>
              <div className="form-row"><label>Estoque inicial</label><input type="number" value={pStock} onChange={e=>setPStock(e.target.value)} /></div>
              <button className="btn" type="submit">Salvar produto</button>
            </form>

            <div className="card">
              <h3 style={{marginTop:0}}>Lista de produtos</h3>
              <table className="table">
                <thead><tr><th>Nome</th><th>SKU</th><th>Custo</th><th>Preço</th><th>Estoque</th></tr></thead>
                <tbody>{products.map(p=> <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td>R$ {Number(p.cost).toFixed(2)}</td><td>R$ {Number(p.price).toFixed(2)}</td><td>{p.stock}</td></tr>)}</tbody>
              </table>
              <div style={{marginTop:10}} className="controls">
                <button className="btn" onClick={()=>downloadJSON("products.json",products)}>Exportar JSON</button>
                <button className="btn" onClick={()=>downloadCSV("products.csv",products)}>Exportar CSV</button>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
            <form className="card" onSubmit={addStock}>
              <h3 style={{marginTop:0}}>Entrada de mercadoria</h3>
              <div className="form-row"><label>Produto</label><select value={entryProductId} onChange={e=>setEntryProductId(e.target.value)}><option value="">-- selecione --</option>{products.map(p=> <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</option>)}</select></div>
              <div className="form-row"><label>Quantidade</label><input type="number" value={entryQty} onChange={e=>setEntryQty(e.target.value)} /></div>
              <div className="form-row"><label>Custo unitário (R$)</label><input type="number" step="0.01" value={entryCostPerUnit} onChange={e=>setEntryCostPerUnit(e.target.value)} /></div>
              <button className="btn" type="submit">Registrar entrada</button>
            </form>

            <form className="card" onSubmit={makeSale}>
              <h3 style={{marginTop:0}}>Registrar venda</h3>
              <div className="form-row"><label>Buscar por SKU</label><input type="text" value={saleSku} onChange={e => setSaleSku(e.target.value)} placeholder="Digite o SKU" /></div>
              <div className="form-row"><label>Produto</label><select value={saleProductId} onChange={e=>setSaleProductId(e.target.value)}><option value="">-- selecione --</option>{products.map(p=> <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</option>)}</select></div>
              <div className="form-row"><label>Quantidade</label><input type="number" value={saleQty} onChange={e=>setSaleQty(e.target.value)} /></div>
              <div className="form-row"><label>Preço unitário (R$)</label><input type="number" step="0.01" value={salePricePerUnit} onChange={e=>setSalePricePerUnit(e.target.value)} /></div>
              <div className="form-row"><label>Forma de pagamento</label><select value={salePaymentMethod} onChange={e=>setSalePaymentMethod(e.target.value)}><option>Dinheiro</option><option>Cartão</option><option>PIX</option><option>Boleto</option></select></div>
              <div className="form-row"><label>Cliente (opcional)</label><select value={saleClientId} onChange={e=>setSaleClientId(e.target.value)}><option value="">-- nenhum --</option>{clients.map(c=> <option key={c.id} value={c.id}>{c.name} - {c.cpf}</option>)}</select></div>
              <button className="btn" type="submit">Registrar venda</button>
            </form>
          </div>
        </section>
      )}

      {tab==="transactions" && (
        <section>
          <div className="card">
            <h3 style={{marginTop:0}}>Movimentações recentes</h3>
            <table className="table">
              <thead><tr><th>Tipo</th><th>Produto</th><th>Qtd</th><th>Valor unit.</th><th>Forma</th><th>Cliente</th><th>Lucro</th><th>Data</th></tr></thead>
              <tbody>{transactions.map(t=>{ const p=products.find(x=>x.id===t.productId)||{}; const c=clients.find(x=>x.id===t.clientId)||null; return (<tr key={t.id}><td>{t.type==="in"?"Entrada":"Venda"}</td><td>{p.name||"-"}</td><td>{t.qty}</td><td>{t.type==="in"?`R$ ${Number(t.unitCost).toFixed(2)}`:`R$ ${Number(t.unitPrice).toFixed(2)}`}</td><td>{t.paymentMethod||"-"}</td><td>{c?`${c.name} (${c.cpf})`:"-"}</td><td>R$ {Number(t.profit||0).toFixed(2)}</td><td>{new Date(t.date).toLocaleString()}</td></tr>) })}</tbody>
            </table>
            <div style={{marginTop:10}} className="controls"><button className="btn" onClick={()=>downloadJSON("transactions.json",transactions)}>Exportar JSON</button><button className="btn" onClick={()=>downloadCSV("transactions.csv",transactions)}>Exportar CSV</button></div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
            <div className="card"><h3 style={{marginTop:0}}>Totais rápidos</h3><div>Receita: R$ {totals.totalRevenue.toFixed(2)}</div><div>Lucro: R$ {totals.totalProfit.toFixed(2)}</div>{Object.entries(totals.paymentBreakdown).map(([k,v])=> <div key={k}>{k}: R$ {v.toFixed(2)}</div>)}</div>
            <div className="card"><h3 style={{marginTop:0}}>Relatórios</h3><div className="small">Baixe os dados para abrir em Excel ou enviar ao contador.</div><div style={{marginTop:8}} className="controls"><button className="btn" onClick={()=>downloadJSON("all-data.json",{products,transactions,clients})}>Exportar tudo (JSON)</button><button className="btn" onClick={()=>downloadCSV("transactions.csv",transactions)}>Exportar vendas (CSV)</button></div></div>
          </div>
        </section>
      )}

      {tab==="clients" && (
        <section>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <form className="card" onSubmit={addClient}><h3 style={{marginTop:0}}>Cadastrar cliente</h3><div className="form-row"><label>Nome</label><input value={cName} onChange={e=>setCName(e.target.value)} /></div><div className="form-row"><label>CPF</label><input value={cCPF} onChange={e=>setCCPF(e.target.value)} /></div><button className="btn" type="submit">Salvar cliente</button></form>
            <div className="card"><h3 style={{marginTop:0}}>Lista de clientes</h3><table className="table"><thead><tr><th>Nome</th><th>CPF</th></tr></thead><tbody>{clients.map(c=> <tr key={c.id}><td>{c.name}</td><td>{c.cpf}</td></tr>)}</tbody></table><div style={{marginTop:8}} className="controls"><button className="btn" onClick={()=>downloadJSON("clients.json",clients)}>Exportar JSON</button><button className="btn" onClick={()=>downloadCSV("clients.csv",clients)}>Exportar CSV</button></div></div>
          </div>
        </section>
      )}

      <footer className="footer">Feito para loja de joias — BrilhoGestor. Dados salvos localmente (localStorage). Faça backup com exportação.</footer>
    </div>
  )
}