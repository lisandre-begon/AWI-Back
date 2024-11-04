const transactionsPrefaites = [
    {
      id: 1,
      statut: 'vente',
      id_acheteur: 101,
      prix: 25,
      jeux: [
        {
          id_vendeur: 201,
          categorie: [
            'jeux de société', 'jeu familial'
          ],
          intitule: 'Monopoly',
          editeur: 'Hasbro',
          date_depot: '2024-10-20',
        },
        {
          id_vendeur: 202,
          categorie: [
            'jeux de stratégie',
          ],
          intitule: 'Catan',
          editeur: 'Kosmos',
          date_depot: '2024-10-22',
        },
      ],
    },
    {
      id: 2,
      statut: 'depot',
      id_acheteur: null,
      prix: 60,
      jeux: [
        {
          id_vendeur: 203,
          categorie: [
            'Jeux vidéo', 'jeu pour enfants'
          ],
          intitule: 'The Legend of Zelda',
          editeur: 'Nintendo',
          date_depot: '2024-10-23',
        },
      ],
    },
  ];

  const vendeurPrefaits = [
    { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com' },
    { id: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@example.com' },
    { id: 3, nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@example.com' },
    { id: 4, nom: 'Dubois', prenom: 'Lucie', email: 'lucie.dubois@example.com' },
    { id: 5, nom: 'Thomas', prenom: 'Paul', email: 'paul.thomas@example.com' },
    { id: 6, nom: 'Robert', prenom: 'Sophie', email: 'sophie.robert@example.com' },
    { id: 7, nom: 'Richard', prenom: 'Julien', email: 'julien.richard@example.com' },
    { id: 8, nom: 'Petit', prenom: 'Laura', email: 'laura.petit@example.com' },
    { id: 9, nom: 'Durand', prenom: 'Antoine', email: 'antoine.durand@example.com' },
    { id: 10, nom: 'Leroy', prenom: 'Claire', email: 'claire.leroy@example.com' }
];

const acheteurPrefaits = [
  { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com' },
  { id: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@example.com' },
  { id: 3, nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@example.com' },
  { id: 4, nom: 'Dubois', prenom: 'Lucie', email: 'lucie.dubois@example.com' },
  { id: 5, nom: 'Thomas', prenom: 'Paul', email: 'paul.thomas@example.com' },
  { id: 6, nom: 'Robert', prenom: 'Sophie', email: 'sophie.robert@example.com' },
  { id: 7, nom: 'Richard', prenom: 'Julien', email: 'julien.richard@example.com' },
  { id: 8, nom: 'Petit', prenom: 'Laura', email: 'laura.petit@example.com' },
  { id: 9, nom: 'Durand', prenom: 'Antoine', email: 'antoine.durand@example.com' },
  { id: 10, nom: 'Leroy', prenom: 'Claire', email: 'claire.leroy@example.com' }
];

const gestionnairePrefaits = [
  { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com' },
  { id: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@example.com' },
  { id: 3, nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@example.com' },
  { id: 4, nom: 'Dubois', prenom: 'Lucie', email: 'lucie.dubois@example.com' },
  { id: 5, nom: 'Thomas', prenom: 'Paul', email: 'paul.thomas@example.com' },
  { id: 6, nom: 'Robert', prenom: 'Sophie', email: 'sophie.robert@example.com' },
  { id: 7, nom: 'Richard', prenom: 'Julien', email: 'julien.richard@example.com' },
  { id: 8, nom: 'Petit', prenom: 'Laura', email: 'laura.petit@example.com' },
  { id: 9, nom: 'Durand', prenom: 'Antoine', email: 'antoine.durand@example.com' },
  { id: 10, nom: 'Leroy', prenom: 'Claire', email: 'claire.leroy@example.com' }
];

const jeuxPrefaits = [
  {
    id: 1,
    id_vendeur: 1,
    categorie: ['jeux de société', 'jeu familial'],
    intitule: 'Monopoly',
    editeur: 'Hasbro',
    prix: 25,
  },
  {
    id: 2,
    id_vendeur: 1,
    categorie: ['jeux de stratégie'],
    intitule: 'Catan',
    editeur: 'Kosmos',
    prix: 30,
  },
  {
    id: 3,
    id_vendeur: 3,
    categorie: ['Jeux vidéo', 'jeu pour enfants'],
    intitule: 'The Legend of Zelda',
    editeur: 'Nintendo',
    date_depot: '2024-10-23',
    prix: 60,
  },
];

const categoriePrefaites = [
    { id: 1, nom: 'Action' },
    { id: 2, nom: 'Aventure' },
    { id: 3, nom: 'Simulation' },
    { id: 4, nom: 'Stratégie' },
    { id: 5, nom: 'RPG' },
    { id: 6, nom: 'Sport' },
    { id: 7, nom: 'Puzzle' },
    { id: 8, nom: 'Horreur' },
    { id: 9, nom: 'Plateforme' },
    { id: 10, nom: 'Course' },
    { id: 11, nom: 'FPS' },
    { id: 12, nom: 'TPS' },
    { id: 13, nom: 'MMO' },
    { id: 14, nom: 'Survie' },
    { id: 15, nom: 'Battle Royale' },
    { id: 16, nom: 'Rogue-like' },
    { id: 17, nom: 'Beat\'em all' },
    { id: 18, nom: 'Musical' },
    { id: 19, nom: 'Party Game' },
    { id: 20, nom: 'Visual Novel' },
    { id: 21, nom: 'Metroidvania' },
    { id: 22, nom: 'Hack\'n Slash' },
    { id: 23, nom: 'City Builder' },
    { id: 24, nom: 'Sandbox' },
    { id: 25, nom: 'Rythme' },
    { id: 26, nom: 'Tactical RPG' },
    { id: 27, nom: 'MMORPG' },
    { id: 28, nom: 'MOBA' },
    { id: 29, nom: 'Tower Defense' },
    { id: 30, nom: 'Visual Novel' },
    { id: 31, nom: 'Jeu de cartes' },
    { id: 32, nom: 'Jeu de société' },
    { id: 33, nom: 'Jeu de rôle' },
    { id: 34, nom: 'Jeu de stratégie' },
    { id: 35, nom: 'Jeu de tir' },
  ];

    module.exports = {
        transactionsPrefaites,
        vendeurPrefaits,
        acheteurPrefaits,
        gestionnairePrefaits,
        jeuxPrefaits,
        categoriePrefaites,
    };