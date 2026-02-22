const form = document.getElementById('collecte-form');
const dateInput = document.getElementById('creneau');

// Bloquer les dates passées
dateInput.min = new Date().toISOString().split("T")[0];

dateInput.addEventListener('change', function () {
  const selectedDate = new Date(this.value);
  const day = selectedDate.getDay();

  // 0 = dimanche
  // 3 = mercredi
  // 6 = samedi
  if (day !== 3 && day !== 6 && day !== 0) {
    alert("Les collectes sont possibles uniquement le mercredi, samedi et dimanche.");
    this.value = "";
  }
});
const resultat = document.getElementById('resultat');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    nom: String(data.get('nom')),
    telephone: String(data.get('telephone')),
    ville: String(data.get('ville')),
    typeClient: String(data.get('typeClient')),
    creneau: String(data.get('creneau')),
    canettes: Number(data.get('canettes')),
  };

  if (payload.canettes < 3) {
    resultat.textContent = 'Minimum de collecte: 3 sacs.';
    return;
  }


  try {
    const response = await fetch('/api/collectes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Erreur API');
    }

    resultat.textContent = `${payload.nom}, demande envoyée ✅ La collecte est sans frais sur Nancy et alentours. Si vous êtes hors zone, je vous confirme avant tout éventuel frais de déplacement.`;
    form.reset();
  } catch (error) {
    resultat.textContent = `${payload.nom}, problème d'envoi. Appelez-moi directement pour planifier la collecte.`;
  }
});
