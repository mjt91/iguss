/**
 * iGuss Plant Database
 * Heimische Gartenpflanzen für Westdeutschland (NRW, Hessen, RLP, Saarland)
 * Intervalle sind Richtwerte für den Sommer (Mai-Sept), passen sich an Standort an
 */

const PLANT_DB = [
  // ── Gemüse: Hoch Wasserbedarf ──
  { name: "Tomate", type: "Solanum lycopersicum", interval: 2, location: "pot", note: "Hochstämmig/Busch — unbedingt regelmäßig, nie austrocknen lassen" },
  { name: "Gurke", type: "Cucumis sativus", interval: 2, location: "pot", note: "Sehr wasserbedürftig, besonders bei Fruchtansatz" },
  { name: "Zucchini", type: "Cucurbita pepo", interval: 2, location: "pot", note: "2-3 Liter/Tag, bei Hitze bis 5L" },
  { name: "Paprika", type: "Capsicum annuum", interval: 3, location: "pot", note: "Gleichmäßig gießen, Staunässe vermeiden" },
  { name: "Aubergine", type: "Solanum melongena", interval: 3, location: "pot", note: "Wärmeliebend, regelmäßig gießen" },
  { name: "Kürbis", type: "Cucurbita maxima", interval: 3, location: "bed", note: "Tief wurzelnd, aber viel Wasser bei Fruchtbildung" },
  { name: "Kopfsalat", type: "Lactuca sativa", interval: 2, location: "bed", note: "Schnell welk, niemals austrocknen" },
  { name: "Radieschen", type: "Raphanus sativus", interval: 2, location: "bed", note: "Schnell wachsend, gleichmäßig feucht halten" },
  { name: "Spinat", type: "Spinacia oleracea", interval: 2, location: "bed", note: "Bei Trockenheit schnell zur Blüte gedrängt" },
  { name: "Mangold", type: "Beta vulgaris", interval: 3, location: "bed", note: "Robust, aber Ertrag steigt mit Wasser" },

  // ── Gemüse: Mittlerer Wasserbedarf ──
  { name: "Kartoffel", type: "Solanum tuberosum", interval: 5, location: "bed", note: "Besonders bei Knollenbildung wichtig" },
  { name: "Möhre", type: "Daucus carota", interval: 5, location: "bed", note: "Tief wurzelnd, tief gießen" },
  { name: "Rote Bete", type: "Beta vulgaris", interval: 5, location: "bed", note: "Knollenbildung braucht gleichmäßige Feuchtigkeit" },
  { name: "Zwiebel", type: "Allium cepa", interval: 5, location: "bed", note: "Vor der Ernte weniger gießen" },
  { name: "Knoblauch", type: "Allium sativum", interval: 7, location: "bed", note: "Sehr anspruchslos, überhaupt nicht verträgt Staunässe" },
  { name: "Erbsen", type: "Pisum sativum", interval: 5, location: "bed", note: "Blütezeit wichtig, danach reduzieren" },
  { name: "Bohnen", type: "Phaseolus vulgaris", interval: 4, location: "bed", note: "Blüte und Hülsenbildung = viel Wasser" },
  { name: "Kohlrabi", type: "Brassica oleracea", interval: 4, location: "bed", note: "Knollenbildung braucht Wasser" },
  { name: "Brokkoli", type: "Brassica oleracea", interval: 4, location: "bed", note: "Kopfbildung = viel Wasser" },
  { name: "Blumenkohl", type: "Brassica oleracea", interval: 4, location: "bed", note: "Anspruchsvoll, nie austrocknen" },
  { name: "Rosenkohl", type: "Brassica oleracea", interval: 5, location: "bed", note: "Herbstpflanze, regelmäßig gießen" },
  { name: "Rettich", type: "Raphanus sativus", interval: 3, location: "bed", note: "Schnell wachsend, gleichmäßig" },
  { name: "Sellerie", type: "Apium graveolens", interval: 3, location: "bed", note: "Sehr wasserbedürftig" },
  { name: "Fenchel", type: "Foeniculum vulgare", interval: 5, location: "bed", note: "Anspruchslos, trocken verträglich" },
  { name: "Spargel", type: "Asparagus officinalis", interval: 7, location: "bed", note: "Tief wurzelnd, nach der Ernte weniger" },

  // ── Kräuter: Trockenheitsverträglich (14 Tage) ──
  { name: "Lavendel", type: "Lavandula angustifolia", interval: 14, location: "pot", note: "Trockenheitsverträglich! Zu viel Wasser = Wurzelfäule" },
  { name: "Rosmarin", type: "Salvia rosmarinus", interval: 14, location: "pot", note: "Mediterran, mag kein Staunässe" },
  { name: "Thymian", type: "Thymus vulgaris", interval: 14, location: "pot", note: "Sehr robust, wenig Wasser" },
  { name: "Salbei", type: "Salvia officinalis", interval: 14, location: "pot", note: "Trocken verträglich, guter Drainage wichtig" },
  { name: "Bohnenkraut", type: "Satureja hortensis", interval: 14, location: "pot", note: "Wärmeliebend, wenig Wasser" },
  { name: "Estragon", type: "Artemisia dracunculus", interval: 10, location: "pot", note: "Anspruchslos" },
  { name: "Liebstöckel", type: "Levisticum officinale", interval: 7, location: "bed", note: "Tief wurzelnd, robust" },
  { name: "Schnittlauch", type: "Allium schoenoprasum", interval: 7, location: "pot", note: "Gleichmäßig feucht" },
  { name: "Petersilie", type: "Petroselinum crispum", interval: 5, location: "pot", note: "Nie austrocknen lassen" },
  { name: "Dill", type: "Anethum graveolens", interval: 4, location: "bed", note: "Schnell zur Blüte, gleichmäßig gießen" },
  { name: "Kresse", type: "Lepidium sativum", interval: 2, location: "pot", note: "Immer feucht halten" },
  { name: "Basilikum", type: "Ocimum basilicum", interval: 3, location: "pot", note: "Anspruchsvoll! Nicht austrocknen, aber keine Staunässe" },
  { name: "Minze", type: "Mentha", interval: 3, location: "pot", note: "Wasserverbraucher, gut verträgt Feuchtigkeit" },
  { name: "Melisse", type: "Melissa officinalis", interval: 5, location: "pot", note: "Robust, anspruchslos" },
  { name: "Oregano", type: "Origanum vulgare", interval: 10, location: "pot", note: "Mediterran, trocken verträglich" },

  // ── Blumen / Stauden ──
  { name: "Rose", type: "Rosa", interval: 7, location: "bed", note: "Tief und gründlich gießen, liebt Morgenguss" },
  { name: "Hortensie", type: "Hydrangea macrophylla", interval: 3, location: "pot", note: "Wasserliebend! Nie austrocknen, besonders in Kübeln" },
  { name: "Rhododendron", type: "Rhododendron", interval: 5, location: "bed", note: "Feuchter, saurer Boden — Regenwasser bevorzugt" },
  { name: "Geranie", type: "Pelargonium", interval: 4, location: "pot", note: "Kübelpflanze, regelmäßig, Staunässe vermeiden" },
  { name: "Sonnenblume", type: "Helianthus annuus", interval: 5, location: "bed", note: "Tief wurzelnd, aber Blütezeit braucht Wasser" },
  { name: "Clematis", type: "Clematis", interval: 5, location: "bed", note: "Wurzeln schattig halten, regelmäßig gießen" },
  { name: "Lavatera", type: "Lavatera", interval: 7, location: "bed", note: "Trocken verträglich" },
  { name: "Kletterhortensie", type: "Hydrangea anomala", interval: 5, location: "bed", note: "Wie Hortensie: wasserliebend" },
  { name: "Wandelröschen", type: "Impatiens", interval: 3, location: "pot", note: "Schatten, nie austrocknen" },
  { name: "Petunie", type: "Petunia", interval: 3, location: "pot", note: "Ampelpflanze, viel Wasser im Sommer" },
  { name: "Begonie", type: "Begonia", interval: 4, location: "pot", note: "Gleichmäßig feucht, Staunässe vermeiden" },
  { name: "Fuchsien", type: "Fuchsia", interval: 3, location: "pot", note: "Halbschatten, regelmäßig gießen" },
  { name: "Lilie", type: "Lilium", interval: 5, location: "bed", note: "Blütezeit wichtig, danach reduzieren" },
  { name: "Tulpe", type: "Tulipa", interval: 7, location: "bed", note: "Frühblüher, nach der Blüte zurückschneiden" },
  { name: "Narzisse", type: "Narcissus", interval: 7, location: "bed", note: "Robust, nach der Blüte ausgeizen" },
  { name: "Stauden-Phlox", type: "Phlox paniculata", interval: 5, location: "bed", note: "Sonnig, regelmäßig gießen" },
  { name: "Akelei", type: "Aquilegia", interval: 7, location: "bed", note: "Halbschatten, anspruchslos" },
  { name: "Fingerhut", type: "Digitalis", interval: 7, location: "bed", note: "Schatten, wenig anspruchsvoll" },
  { name: "Pfingstrose", type: "Paeonia", interval: 7, location: "bed", note: "Tief wurzelnd, nach der Blüte weniger" },
  { name: "Gänseblümchen", type: "Bellis perennis", interval: 5, location: "bed", note: "Robust, vielseitig" },

  // ── Beeren / Obst ──
  { name: "Erdbeere", type: "Fragaria", interval: 3, location: "bed", note: "Besonders in der Erntezeit viel Wasser" },
  { name: "Himbeere", type: "Rubus idaeus", interval: 5, location: "bed", note: "Fruchtansatz braucht Wasser" },
  { name: "Brombeere", type: "Rubus fruticosus", interval: 5, location: "bed", note: "Robust, tief wurzelnd" },
  { name: "Johannisbeere", type: "Ribes", interval: 5, location: "bed", note: "Fruchtbildung = viel Wasser" },
  { name: "Stachelbeere", type: "Ribes uva-crispa", interval: 5, location: "bed", note: "Wie Johannisbeere" },
  { name: "Heidelbeere / Blaubeere", type: "Vaccinium", interval: 5, location: "pot", note: "Sauren Boden, gleichmäßig feucht" },
  { name: "Brombeere", type: "Rubus", interval: 5, location: "bed", note: "Sehr robust" },
  { name: "Weintraube / Tafeltraube", type: "Vitis vinifera", interval: 7, location: "bed", note: "Tief wurzelnd, nach der Reife weniger" },
  { name: "Kirsche", type: "Prunus avium", interval: 7, location: "bed", note: "Baum — bei Fruchtbildung gießen" },
  { name: "Apfelbaum", type: "Malus domestica", interval: 7, location: "bed", note: "Baum — junge Bäume brauchen mehr" },
  { name: "Birnenbaum", type: "Pyrus communis", interval: 7, location: "bed", note: "Wie Apfel" },
  { name: "Pflaumenbaum", type: "Prunus domestica", interval: 7, location: "bed", note: "Junger Baum: regelmäßig" },
  { name: "Pfirsichbaum", type: "Prunus persica", interval: 7, location: "bed", note: "Wärmeliebend, Fruchtbildung = Wasser" },
  { name: "Aprikosenbaum", type: "Prunus armeniaca", interval: 7, location: "bed", note: "Wie Pfirsich" },
  { name: "Feige", type: "Ficus carica", interval: 7, location: "pot", note: "Mediterran, aber Ertrag steigt mit Wasser" },
  { name: "Kiwi", type: "Actinidia deliciosa", interval: 5, location: "bed", note: "Viel Laub = viel Wasserbedarf" },

  { name: "Pfennigbaum", type: "Crassula multicava / peperomioides", interval: 14, location: "indoor", note: "Sukkulente, sparsam gießen — Erde antrocknen lassen" },
  { name: "Einblatt", type: "Spathiphyllum (kleinblättrig)", interval: 5, location: "indoor", note: "Welkt als Warnsignal, dann gründlich gießen" },
  { name: "Japanischer Ahorn", type: "Acer palmatum", interval: 14, location: "bed", note: "Baum — nur bei längerer Trockenheit gießen, junge Exemplare öfter" },

  // ── Zimmerpflanzen (für "im Haus") ──
  { name: "Monstera", type: "Monstera deliciosa", interval: 7, location: "indoor", note: "Topferde antrocknen lassen, dann gründlich gießen" },
  { name: "Gummibaum", type: "Ficus elastica", interval: 7, location: "indoor", note: "Geduldig mit Trockenheit, Staunässe tötet" },
  { name: "Grünlilie", type: "Chlorophytum comosum", interval: 5, location: "indoor", note: "Robust, auch Trockenheit verträglich" },
  { name: "Efeutute", type: "Epipremnum aureum", interval: 5, location: "indoor", note: "Anspruchslos, auch Schatten" },
  { name: "Aloe Vera", type: "Aloe barbadensis", interval: 14, location: "indoor", note: "Sukkulente! Sehr sparsam gießen" },
  { name: "Schwiegermutterzunge", type: "Sansevieria", interval: 14, location: "indoor", note: "Extrem robust, wenig Wasser" },
  { name: "Friedenslilie", type: "Spathiphyllum", interval: 5, location: "indoor", note: "Welkt als Warnsignal, dann gießen" },
  { name: "Korbmarante", type: "Calathea", interval: 4, location: "indoor", note: "Hoch Luftfeuchtigkeit, nie austrocknen" },
  { name: "Pilea / Ufopflanze", type: "Pilea peperomioides", interval: 5, location: "indoor", note: "Gleichmäßig feucht" },
  { name: "Ficus Benjamini", type: "Ficus benjamina", interval: 5, location: "indoor", note: "Mag kein Staunässe, niemals austrocknen" },
  { name: "Drachenbaum", type: "Dracaena", interval: 7, location: "indoor", note: "Geduldig mit Trockenheit" },
  { name: "Yucca", type: "Yucca elephantipes", interval: 14, location: "indoor", note: "Sehr sparsam, Staunässe vermeiden" },
  { name: "Geldbaum", type: "Crassula ovata", interval: 14, location: "indoor", note: "Sukkulente, Erde antrocknen lassen" },
  { name: "Elefantenfuß", type: "Beaucarnea recurvata", interval: 14, location: "indoor", note: "Wasserspeicher, sehr sparsam" },
  { name: "Kentia-Palme", type: "Howea forsteriana", interval: 7, location: "indoor", note: "Gleichmäßig feucht halten" },
  { name: "Farn", type: "Nephrolepis", interval: 3, location: "indoor", note: "Hoch Luftfeuchtigkeit, nie austrocknen" },
  { name: "Begonie (Zimmer)", type: "Begonia", interval: 4, location: "indoor", note: "Nicht nass, nicht trocken" },
  { name: "Orchidee", type: "Phalaenopsis", interval: 7, location: "indoor", note: "Luftwurzeln besprühen, Wasser abgießen lassen" },
  { name: "Bogenhanf", type: "Sansevieria cylindrica", interval: 14, location: "indoor", note: "Extrem robust" },
  { name: "Zamioculcas", type: "Zamioculcas zamiifolia", interval: 14, location: "indoor", note: "Kaum totzukriegen, sparsam gießen" }
];

// ── Helper: DB durchsuchen ──
function searchPlants(query) {
  if (!query) return PLANT_DB;
  const q = query.toLowerCase();
  return PLANT_DB.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.type.toLowerCase().includes(q)
  );
}

function getPlantByName(name) {
  return PLANT_DB.find(p =>
    p.name.toLowerCase() === name.toLowerCase()
  );
}

// Export für Module oder global
if (typeof module !== 'undefined') {
  module.exports = { PLANT_DB, searchPlants, getPlantByName };
}
