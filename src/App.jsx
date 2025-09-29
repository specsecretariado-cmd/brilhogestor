import React, { useEffect, useState } from "react";
import Login from "./Login";
import { users as initialUsers } from "./users";
import UserManagement from "./UserManagement";

/*
  BrilhoGestor - Inventory & Sales Manager for jewelry stores
  Single-file React component (main app)
*/

export default function App() {
  const [products, setProducts] = useState(() => { try { return JSON.parse(localStorage.getItem("bg_products")) || [] } catch { return [] } });
  const [transactions, setTransactions] = useState(() => { try { return JSON.parse(localStorage.getItem("bg_transactions")) || [] } catch { return [] } });
  const [clients, setClients] = useState(() => { try { return JSON.parse(localStorage.getItem("bg_clients")) || [] } catch { return [] } });
  const [users, setUsers] = useState(() => { try { return JSON.parse(localStorage.getItem("bg_users")) || initialUsers } catch { return initialUsers } });

  useEffect(() => { localStorage.setItem("bg_products", JSON.stringify(products)) }, [products]);
  useEffect(() => { localStorage.setItem("bg_transactions", JSON.stringify(transactions)) }, [transactions]);
  useEffect(() => { localStorage.setItem("bg_clients", JSON.stringify(clients)) }, [clients]);
  useEffect(() => { localStorage.setItem("bg_users", JSON.stringify(users)) }, [users]);

  const [tab, setTab] = useState("dashboard");

  // product form
  const [pName, setPName] = useState("");
  const [pSKU, setPSKU] = useState("");
  const [pCost, setPCost] = useState(0);
  const [pPrice, setPPrice] = useState(0);
  const [pStock, setPStock] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);

  function addProduct(e) {
    e.preventDefault();
    if (!pName) return alert("Informe o nome do produto.");
    if (editingProduct) {
      setProducts(s => s.map(p => p.id === editingProduct.id ? { ...p, name: pName, sku: pSKU, cost: Number(pCost), price: Number(pPrice), stock: Number(pStock) } : p));
      setEditingProduct(null);
    } else {
      const id = Date.now();
      setProducts(s => [...s, { id, name: pName, sku: pSKU, cost: Number(pCost), price: Number(pPrice), stock: Number(pStock) }]);
    }
    setPName("");
    setPSKU("");
    setPCost(0);
    setPPrice(0);
    setPStock(0);
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
    setPName(product.name);
    setPSKU(product.sku);
    setPCost(product.cost);
    setPPrice(product.price);
    setPStock(product.stock);
  }

  function handleDeleteProduct(productId) {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      setProducts(s => s.filter(p => p.id !== productId));
    }
  }

  // transaction form
  const [tProdId, setTProdId] = useState("");
  const [tQtd, setTQtd] = useState(1);
  const [tPay, setTPay] = useState("dinheiro");
  const [tDiscount, setTDiscount] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);

  function addTransaction(e) {
    e.preventDefault();
    if (!tProdId) {
      alert("Selecione um produto.");
      return;
    }

    const product = products.find(p => p.id == tProdId);
    if (!product) {
        alert("Produto não encontrado.");
        return;
    }
    
    const finalPrice = product.price - Number(tDiscount);
    if (finalPrice < 0) {
      alert("Desconto não pode ser maior que o preço do produto.");
      return;
    }

    if (editingTransaction) {
      // Logic to edit an existing transaction
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, productId: product.id, product: product.name, quantity: Number(tQtd), price: finalPrice, payment: tPay, discount: Number(tDiscount) } : t));
      setEditingTransaction(null);
    } else {
      // Logic to add a new transaction
      if (product.stock < tQtd) {
        alert("Estoque insuficiente.");
        return;
      }
      const id = Date.now();
      setTransactions(s => [...s, { id, productId: product.id, product: product.name, quantity: Number(tQtd), price: finalPrice, payment: tPay, discount: Number(tDiscount), date: new Date().toLocaleDateString("pt-BR") }]);
      setProducts(s => s.map(p => p.id == tProdId ? { ...p, stock: p.stock - tQtd } : p));
    }

    setTProdId("");
    setTQtd(1);
    setTDiscount(0);
  }

  function handleEditTransaction(transaction) {
    if (!transaction) {
        console.error("Transação inválida.");
        return;
    }
    const product = products.find(p => p.id === transaction.productId);
    if (!product) {
      alert("Erro: O produto associado a esta transação não foi encontrado. Talvez ele tenha sido excluído.");
      return;
    }
    setEditingTransaction(transaction);
    setTProdId(product.id);
    setTQtd(transaction.quantity);
    setTDiscount(transaction.discount);
    setTPay(transaction.payment);
  }

  function handleDeleteTransaction(transactionId) {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      const transactionToDelete = transactions.find(t => t.id === transactionId);
      if (!transactionToDelete) {
          console.error("Transação a ser excluída não encontrada.");
          return;
      }
      const product = products.find(p => p.id === transactionToDelete.productId);
      if (product) {
        setProducts(s => s.map(p => p.id === product.id ? { ...p, stock: p.stock + transactionToDelete.quantity } : p));
      }
      setTransactions(transactions.filter(t => t.id !== transactionId));
    }
  }

  function addStock(e) {
    e.preventDefault();
    if (!tProdId) return alert("Selecione um produto.");
    const product = products.find(p => p.id == tProdId);
    if (!product) {
      alert("Produto não encontrado.");
      return;
    }
    setProducts(s => s.map(p => p.id == tProdId ? { ...p, stock: p.stock + tQtd } : p));
    setTProdId("");
    setTQtd(1);
  }

  // client form
  const [cName, setCName] = useState("");
  const [cCPF, setCCPF] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  function addClient(e) {
    e.preventDefault();
    if (!cName) return alert("Informe o nome do cliente.");
    if (!cCPF) return alert("Informe o CPF.");

    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, name: cName, cpf: cCPF } : c));
      setEditingClient(null);
    } else {
      const id = Date.now();
      setClients(s => [...s, { id, name: cName, cpf: cCPF }]);
    }
    setCName("");
    setCCPF("");
  }
  function handleEditClient(client) {
    setEditingClient(client);
    setCName(client.name);
    setCCPF(client.cpf);
  }
  function handleDeleteClient(clientId) {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      setClients(clients.filter(c => c.id !== clientId));
    }
  }

  // data export helpers
  function downloadJSON(filename, data) {
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
  function downloadCSV(filename, data) {
    const csvRows = ["id;product;quantity;price;payment;date"];
    data.forEach(t => csvRows.push(`${t.id};${t.product};${t.quantity};${t.price};${t.payment};${t.date}`));
    const csvStr = csvRows.join("\n");
    const blob = new Blob([csvStr], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  // --- Funções de cálculo de relatório mensal ---
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date.split('/').reverse().join('-'));
    return transactionDate.getMonth() + 1 === Number(reportMonth) && transactionDate.getFullYear() === Number(reportYear);
  });
  
  const monthlyRevenue = filteredTransactions.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const monthlyCost = filteredTransactions.reduce((sum, t) => sum + (products.find(p => p.id === t.productId)?.cost || 0) * t.quantity, 0);
  const monthlyProfit = monthlyRevenue - monthlyCost;

  // revenue and profit calculations
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const totalCost = transactions.reduce((sum, t) => sum + (products.find(p => p.id === t.productId)?.cost || 0) * t.quantity, 0);
  const totalProfit = totalRevenue - totalCost;

  // Login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem("bg_isLoggedIn", "true");
    localStorage.setItem("bg_currentUser", JSON.stringify(user));
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("bg_isLoggedIn");
    localStorage.removeItem("bg_currentUser");
  };

  useEffect(() => {
    try {
      const savedLoginState = localStorage.getItem("bg_isLoggedIn");
      const savedUser = JSON.parse(localStorage.getItem("bg_currentUser"));
      if (savedLoginState === "true" && savedUser) {
        setIsLoggedIn(true);
        setCurrentUser(savedUser);
      }
    } catch (e) {
      console.error("Falha ao carregar o estado do usuário do localStorage.", e);
      localStorage.removeItem("bg_isLoggedIn");
      localStorage.removeItem("bg_currentUser");
    }
  }, []);

  // Lista de anos para o seletor (agora incluindo 10 anos à frente)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <>
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="container">
          <header className="header">
            <div className="logo"><span className="badge">BG</span> <h3>BrilhoGestor</h3></div>
            <div className="nav">
              <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>Dashboard</button>
              <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>Produtos</button>
              <button className={tab === "movement" ? "active" : ""} onClick={() => setTab("movement")}>Movimentação</button>
              <button className={tab === "clients" ? "active" : ""} onClick={() => setTab("clients")}>Clientes</button>
              {currentUser?.role === "admin" && (
                <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Usuários</button>
              )}
              <button className="btn" onClick={handleLogout}>Sair</button>
            </div>
          </header>
          {tab === "dashboard" && (
            <section>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card"><h3>Receita total</h3><p>{totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
                <div className="card"><h3>Lucro total</h3><p>{totalProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Relatório Mensal</h3>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-row" style={{ flex: 1 }}><label>Mês</label><select value={reportMonth} onChange={e => setReportMonth(e.target.value)}>{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                  <div className="form-row" style={{ flex: 1 }}><label>Ano</label><select value={reportYear} onChange={e => setReportYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="card-mini"><h4>Receita do Mês</h4><p>{monthlyRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
                  <div className="card-mini"><h4>Lucro do Mês</h4><p>{monthlyProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
                </div>
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Vendas recentes</h3>
                <table className="table"><thead><tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Data</th></tr></thead><tbody>{transactions.slice(0, 5).map(t => <tr key={t.id}><td>{t.product}</td><td>{t.quantity}</td><td>{t.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td>{t.date}</td></tr>)}</tbody></table>
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Itens com estoque baixo</h3>
                <table className="table"><thead><tr><th>Produto</th><th>Estoque</th></tr></thead><tbody>{products.filter(p => p.stock < 10).map(p => <tr key={p.id}><td>{p.name}</td><td>{p.stock}</td></tr>)}</tbody></table>
              </div>
            </section>
          )}

          {tab === "products" && (
            <section>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <form className="card" onSubmit={addProduct}>
                  <h3 style={{ marginTop: 0 }}>{editingProduct ? "Editar Produto" : "Cadastrar Produto"}</h3>
                  <div className="form-row"><label>Nome</label><input value={pName} onChange={e => setPName(e.target.value)} /></div>
                  <div className="form-row"><label>SKU</label><input value={pSKU} onChange={e => setPSKU(e.target.value)} /></div>
                  <div className="form-row"><label>Custo</label><input type="number" value={pCost} onChange={e => setPCost(e.target.value)} /></div>
                  <div className="form-row"><label>Preço</label><input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} /></div>
                  <div className="form-row"><label>Estoque</label><input type="number" value={pStock} onChange={e => setPStock(e.target.value)} /></div>
                  <button className="btn" type="submit">{editingProduct ? "Salvar Edição" : "Salvar produto"}</button>
                  {editingProduct && (
                    <button className="btn" type="button" onClick={() => { setEditingProduct(null); setPName(""); setPSKU(""); setPCost(0); setPPrice(0); setPStock(0); }} style={{ width: '100%', marginTop: '8px' }}>
                      Cancelar
                    </button>
                  )}
                </form>
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Produtos</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>SKU</th>
                      <th>Custo</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>{p.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                        <td>{p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                        <td>{p.stock}</td>
                        <td>
                          <button className="btn-sm" onClick={() => handleEditProduct(p)} style={{ marginRight: '8px' }}>Editar</button>
                          <button className="btn-sm" onClick={() => handleDeleteProduct(p.id)} style={{ backgroundColor: 'salmon' }}>Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 8 }} className="controls"><button className="btn" onClick={() => downloadJSON("products.json", products)}>Exportar JSON</button><button className="btn" onClick={() => downloadCSV("products.csv", products)}>Exportar CSV</button></div>
              </div>
            </section>
          )}

          {tab === "movement" && (
            <section>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <form className="card" onSubmit={addTransaction}>
                  <h3 style={{ marginTop: 0 }}>{editingTransaction ? "Editar Venda" : "Venda / Saída"}</h3>
                  <div className="form-row"><label>Produto</label><select value={tProdId} onChange={e => setTProdId(e.target.value)}><option value="">Selecione um produto</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  <div className="form-row"><label>Quantidade</label><input type="number" value={tQtd} onChange={e => setTQtd(e.target.value)} /></div>
                  <div className="form-row"><label>Desconto (R$)</label><input type="number" value={tDiscount} onChange={e => setTDiscount(e.target.value)} /></div>
                  <div className="form-row"><label>Forma de Pagamento</label><select value={tPay} onChange={e => setTPay(e.target.value)}><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="pix">PIX</option><option value="boleto">Boleto</option></select></div>
                  <button className="btn" type="submit">{editingTransaction ? "Salvar Edição" : "Registrar venda"}</button>
                  {editingTransaction && (
                    <button className="btn" type="button" onClick={() => { setEditingTransaction(null); setTProdId(""); setTQtd(1); setTDiscount(0); setTPay("dinheiro"); }} style={{ width: '100%', marginTop: '8px' }}>
                      Cancelar
                    </button>
                  )}
                  <div className="note" style={{ marginTop: 16 }}>Para adicionar estoque, selecione um produto, digite a quantidade e clique no botão abaixo:</div>
                  <button className="btn" onClick={addStock}>Adicionar estoque</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Transações</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Preço</th>
                      <th>Desconto</th>
                      <th>Forma de Pagamento</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id}>
                        <td>{products.find(p => p.id === t.productId)?.name || 'Produto Excluído'}</td>
                        <td>{t.quantity}</td>
                        <td>{t.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                        <td>{t.discount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                        <td>{t.payment}</td>
                        <td>{t.date}</td>
                        <td>
                          <button className="btn-sm" onClick={() => handleEditTransaction(t)} style={{ marginRight: '8px' }}>Editar</button>
                          <button className="btn-sm" onClick={() => handleDeleteTransaction(t.id)} style={{ backgroundColor: 'salmon' }}>Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 8 }} className="controls">
                  <button className="btn" onClick={() => downloadJSON("all-data.json", { products, transactions, clients })}>Exportar tudo (JSON)</button>
                  <button className="btn" onClick={() => downloadCSV("transactions.csv", transactions)}>Exportar vendas (CSV)</button>
                </div>
              </div>
            </section>
          )}

          {tab === "clients" && (
            <section>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <form className="card" onSubmit={addClient}>
                  <h3 style={{ marginTop: 0 }}>{editingClient ? "Editar Cliente" : "Cadastrar Cliente"}</h3>
                  <div className="form-row"><label>Nome</label><input value={cName} onChange={e => setCName(e.target.value)} /></div>
                  <div className="form-row"><label>CPF</label><input value={cCPF} onChange={e => setCCPF(e.target.value)} /></div>
                  <button className="btn" type="submit">{editingClient ? "Salvar Edição" : "Salvar cliente"}</button>
                  {editingClient && (
                    <button className="btn" type="button" onClick={() => { setEditingClient(null); setCName(""); setCCPF(""); }} style={{ width: '100%', marginTop: '8px' }}>
                      Cancelar
                    </button>
                  )}
                </form>
                <div className="card">
                  <h3 style={{ marginTop: 0 }}>Lista de clientes</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(c => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{c.cpf}</td>
                          <td>
                            <button className="btn-sm" onClick={() => handleEditClient(c)} style={{ marginRight: '8px' }}>Editar</button>
                            <button className="btn-sm" onClick={() => handleDeleteClient(c.id)} style={{ backgroundColor: 'salmon' }}>Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 8 }} className="controls">
                    <button className="btn" onClick={() => downloadJSON("clients.json", clients)}>Exportar JSON</button>
                    <button className="btn" onClick={() => downloadCSV("clients.csv", clients)}>Exportar CSV</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {tab === "users" && (
            <UserManagement
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
            />
          )}

          <footer className="footer">Feito para loja de joias — BrilhoGestor. Dados salvos localmente.</footer>
        </div>
      )}
    </>
  );
}