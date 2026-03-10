// services/api.ts
// ⚠️  Sur appareil physique : remplacez 'localhost' par l'IP de votre machine
//     ex: 'http://192.168.1.10:3001'
const BASE = 'http://192.168.1.84:3001';

const ok = async (res: Response) => {
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Erreur serveur');
  return json;
};

export const getEmployes   = ()         => fetch(`${BASE}/employes`).then(ok);
export const getStats      = ()         => fetch(`${BASE}/employes/stats`).then(ok);
export const addEmploye    = (d: any)   => fetch(`${BASE}/employes`,     { method: 'POST',   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(ok);
export const updateEmploye = (id: number, d: any) => fetch(`${BASE}/employes/${id}`, { method: 'PUT',    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(ok);
export const deleteEmploye = (id: number)         => fetch(`${BASE}/employes/${id}`, { method: 'DELETE' }).then(ok);
