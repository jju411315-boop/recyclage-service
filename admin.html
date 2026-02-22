async function charger() {
  const tbody = document.querySelector('#tableau tbody');
  tbody.innerHTML = '';

  const response = await fetch('/api/collectes');
  const items = await response.json();

  items.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.nom}</td>
      <td>${item.ville}</td>
      <td>${item.canettes}</td>
      <td>${item.statut}</td>
      <td>
        <select data-id="${item.id}">
          <option value="nouvelle" ${item.statut === 'nouvelle' ? 'selected' : ''}>nouvelle</option>
          <option value="rappelee" ${item.statut === 'rappelee' ? 'selected' : ''}>rappelée</option>
          <option value="collectee" ${item.statut === 'collectee' ? 'selected' : ''}>collectée</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('select[data-id]').forEach((select) => {
    select.addEventListener('change', async (event) => {
      const id = event.target.getAttribute('data-id');
      await fetch(`/api/collectes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: event.target.value }),
      });
      charger();
    });
  });
}

charger();
