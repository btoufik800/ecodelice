import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const { show } = useToast();

  const load = () => api.get('/api/admin/produits').then(({ data }) => {
    setProduits(data.produits); setCategories(data.categories);
  });
  useEffect(() => { load(); }, []);

  const post = async (body) => {
    const params = new URLSearchParams(body);
    const { data } = await api.post('/api/admin/produits', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    show(data.message, data.success ? 'ok' : 'err');
    if (data.success) { load(); setEditing(null); }
  };

  const save = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const obj = Object.fromEntries(fd.entries());
    obj.action = editing.id ? 'edit' : 'add';
    if (editing.id) obj.id = editing.id;
    post(obj);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Montserrat,sans-serif' }}>🍓 Produits</h1>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ Nouveau produit</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Badge</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {produits.map((p) => (
              <tr key={p.id} style={{ opacity: p.actif ? 1 : .5 }}>
                <td><strong>{p.nom}</strong><br /><small>{p.format}</small></td>
                <td>{p.cat_nom || '—'}</td>
                <td>{Number(p.prix).toFixed(2)} $</td>
                <td>{p.stock}</td>
                <td>{p.badge || '—'}</td>
                <td>{p.actif ? '✅' : '🚫'}</td>
                <td>
                  <button className="btn-tiny" onClick={() => setEditing(p)}>✏️</button>{' '}
                  {p.actif
                    ? <button className="btn-tiny btn-tiny-danger" onClick={() => post({ action: 'delete', id: p.id })}>🗑</button>
                    : <button className="btn-tiny" onClick={() => post({ action: 'restore', id: p.id })}>↩️</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setEditing(null)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editing.id ? 'Modifier' : 'Nouveau'} produit</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={save}>
                <div className="form-group"><label>Nom *</label><input name="nom" defaultValue={editing.nom} required /></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Catégorie</label>
                    <select name="categorie_id" defaultValue={editing.categorie_id || ''}>
                      <option value="">—</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Prix *</label><input type="number" step="0.01" name="prix" defaultValue={editing.prix} required /></div>
                  <div className="form-group"><label>Stock</label><input type="number" name="stock" defaultValue={editing.stock || 0} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Format</label><input name="format" defaultValue={editing.format || 'Pot de 250ml'} /></div>
                  <div className="form-group"><label>Badge</label><input name="badge" defaultValue={editing.badge || ''} placeholder="Vedette, Bio, ..." /></div>
                </div>
                <div className="form-group"><label>Description</label><textarea name="description" rows={3} defaultValue={editing.description || ''}></textarea></div>
                <div className="form-group"><label>Ingrédients</label><textarea name="ingredients" rows={2} defaultValue={editing.ingredients || ''}></textarea></div>
                <button type="submit" className="btn-submit">{editing.id ? 'Enregistrer' : 'Créer'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
